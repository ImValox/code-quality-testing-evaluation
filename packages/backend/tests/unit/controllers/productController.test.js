jest.mock('../../../src/db/database', () => ({
  getDb: jest.fn()
}));

const productController = require('../../../src/controllers/productController');
const db = require('../../../src/db/database');
const { flushPromises, mockRequest, mockResponse } = require('../../helpers/http');

describe('productController (unit)', () => {
  let database;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    database = {
      all: jest.fn(),
      get: jest.fn(),
      run: jest.fn()
    };
    db.getDb.mockReturnValue(database);
  });

  describe('getAllProducts', () => {
    it('returns products enriched with cheaperCount and avgPrice', async () => {
      const products = [
        { id: 1, name: 'Laptop', price: 999.99, stock: 10 },
        { id: 2, name: 'Mouse', price: 19.99, stock: 50 }
      ];
      database.all.mockImplementation((_sql, _params, callback) => callback(null, products));
      database.get.mockImplementation((sql, params, callback) => {
        if (sql.includes('COUNT')) {
          return callback(null, { total: params[0] > 100 ? 2 : 1 });
        }
        return callback(null, { avg: 509.99 });
      });
      const res = mockResponse();

      productController.getAllProducts(mockRequest(), res);
      await flushPromises();

      expect(database.all).toHaveBeenCalledWith('SELECT * FROM products', [], expect.any(Function));
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        data: [
          { avgPrice: 509.99, cheaperCount: 2, id: 1, name: 'Laptop', price: 999.99, stock: 10 },
          { avgPrice: 509.99, cheaperCount: 1, id: 2, name: 'Mouse', price: 19.99, stock: 50 }
        ],
        message: 'success'
      });
    });

    it('returns an empty list when there are no products', async () => {
      database.all.mockImplementation((_sql, _params, callback) => callback(null, []));
      const res = mockResponse();

      productController.getAllProducts(mockRequest(), res);
      await flushPromises();

      expect(database.get).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ data: [], message: 'success' });
    });

    it('keeps the product without details when the detail queries fail', async () => {
      const products = [{ id: 1, name: 'Laptop', price: 999.99, stock: 10 }];
      database.all.mockImplementation((_sql, _params, callback) => callback(null, products));
      database.get.mockImplementation((_sql, _params, callback) => callback(new Error('boom')));
      const res = mockResponse();

      productController.getAllProducts(mockRequest(), res);
      await flushPromises();

      expect(res.json).toHaveBeenCalledWith({
        data: [{ id: 1, name: 'Laptop', price: 999.99, stock: 10 }],
        message: 'success'
      });
    });

    it('responds 400 with the error message when the query fails', async () => {
      database.all.mockImplementation((_sql, _params, callback) => callback(new Error('SQLITE_ERROR')));
      const res = mockResponse();

      productController.getAllProducts(mockRequest(), res);
      await flushPromises();

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'SQLITE_ERROR' });
    });
  });

  describe('createProduct', () => {
    it('inserts the product and responds 201 with its id', () => {
      database.run.mockImplementation(function (_sql, _params, callback) {
        callback.call({ lastID: 42 }, null);
      });
      const req = mockRequest({ body: { name: 'Keyboard', price: 49.9, stock: 5 } });
      const res = mockResponse();

      productController.createProduct(req, res);

      expect(database.run).toHaveBeenCalledWith(
        'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
        ['Keyboard', 49.9, 5],
        expect.any(Function)
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 42, name: 'Keyboard', price: 49.9, stock: 5 });
    });

    it('responds 500 when the insert fails', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      database.run.mockImplementation((_sql, _params, callback) => callback(new Error('constraint failed')));
      const res = mockResponse();

      productController.createProduct(mockRequest({ body: { name: null } }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating product' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getProduct', () => {
    it('returns the product matching the id param', () => {
      const product = { id: 3, name: 'Headphones', price: 79.99, stock: 20 };
      database.get.mockImplementation((_sql, _params, callback) => callback(null, product));
      const res = mockResponse();

      productController.getProduct(mockRequest({ params: { id: '3' } }), res);

      expect(database.get).toHaveBeenCalledWith('SELECT * FROM products WHERE id = ?', ['3'], expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({ data: product, message: 'success' });
    });

    it('returns undefined data when the product does not exist', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(null));
      const res = mockResponse();

      productController.getProduct(mockRequest({ params: { id: '999' } }), res);

      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ data: undefined, message: 'success' });
    });

    it('responds 400 when the query fails', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(new Error('bad query')));
      const res = mockResponse();

      productController.getProduct(mockRequest({ params: { id: '1' } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'bad query' });
    });
  });

  describe('updateStock', () => {
    it('updates the stock and responds with success', () => {
      database.run.mockImplementation(function (_sql, _params, callback) {
        callback.call({ changes: 1 }, null);
      });
      const res = mockResponse();

      productController.updateStock(mockRequest({ body: { stock: 7 }, params: { id: '1' } }), res);

      expect(database.run).toHaveBeenCalledWith(
        'UPDATE products SET stock = ? WHERE id = ?',
        [7, '1'],
        expect.any(Function)
      );
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('responds 404 when no product was updated', () => {
      database.run.mockImplementation(function (_sql, _params, callback) {
        callback.call({ changes: 0 }, null);
      });
      const res = mockResponse();

      productController.updateStock(mockRequest({ body: { stock: 7 }, params: { id: '999' } }), res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('responds 500 when the update fails', () => {
      database.run.mockImplementation((_sql, _params, callback) => callback(new Error('locked')));
      const res = mockResponse();

      productController.updateStock(mockRequest({ body: { stock: 7 }, params: { id: '1' } }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Failed to update stock' });
    });
  });
});
