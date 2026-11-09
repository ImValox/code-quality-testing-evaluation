const request = require('supertest');

const app = require('../../src/app');

describe('Products API', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'admin123', username: 'admin' });
    token = res.body.token;
  });

  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const authed = (req) => req.set('Authorization', `Bearer ${token}`);

  describe('GET /api/products', () => {
    it('lists the seeded products with computed details (200)', async () => {
      const res = await authed(request(app).get('/api/products'));

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('success');
      const laptop = res.body.data.find((product) => product.name === 'Laptop');
      expect(laptop).toEqual(expect.objectContaining({ cheaperCount: 3, price: 999.99 }));
      expect(laptop.avgPrice).toEqual(expect.any(Number));
    });

    it('requires a token (401)', async () => {
      const res = await request(app).get('/api/products');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
    });
  });

  describe('POST /api/products', () => {
    it('creates a product (201)', async () => {
      const res = await authed(request(app).post('/api/products')).send({ name: 'Keyboard', price: 49.9, stock: 5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: expect.any(Number), name: 'Keyboard', price: 49.9, stock: 5 });

      const created = await authed(request(app).get(`/api/products/${res.body.id}`));
      expect(created.body.data).toEqual(expect.objectContaining({ name: 'Keyboard', stock: 5 }));
    });

    it('rejects a product without name (500)', async () => {
      const res = await authed(request(app).post('/api/products')).send({ price: 10, stock: 1 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error creating product' });
    });

    it('requires a token (401)', async () => {
      const res = await request(app).post('/api/products').send({ name: 'Keyboard', price: 49.9, stock: 5 });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/products/:id', () => {
    it('returns the product (200)', async () => {
      const res = await authed(request(app).get('/api/products/1'));

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: expect.objectContaining({ id: 1, name: 'Laptop', price: 999.99, stock: 10 }),
        message: 'success'
      });
    });

    it('returns no data for an unknown id', async () => {
      const res = await authed(request(app).get('/api/products/9999'));

      expect(res.status).toBe(200);
      expect(res.body.data).toBeUndefined();
    });

    it('requires a token (401)', async () => {
      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    it('updates the stock (200)', async () => {
      const res = await authed(request(app).patch('/api/products/2/stock')).send({ stock: 42 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });

      const updated = await authed(request(app).get('/api/products/2'));
      expect(updated.body.data.stock).toBe(42);
    });

    it('returns 404 for an unknown product', async () => {
      const res = await authed(request(app).patch('/api/products/9999/stock')).send({ stock: 1 });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Product not found' });
    });

    it('requires a token (401)', async () => {
      const res = await request(app).patch('/api/products/1/stock').send({ stock: 1 });

      expect(res.status).toBe(401);
    });
  });

  describe('unknown routes', () => {
    it('returns 404 JSON', async () => {
      const res = await request(app).get('/api/does-not-exist');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Not found' });
    });
  });
});
