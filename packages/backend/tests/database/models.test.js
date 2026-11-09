const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3');

const initDatabase = require('../../src/db/migrations/init');

const open = () =>
  new Promise((resolve, reject) => {
    const db = new sqlite3.Database(':memory:', (err) => (err ? reject(err) : resolve(db)));
  });

const run = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });

const get = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });

const all = (db, sql) =>
  new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => (err ? reject(err) : resolve(rows)));
  });

describe('Database models', () => {
  let db;

  // Fresh in-memory database for every test
  beforeEach(async () => {
    db = await open();
    await initDatabase(db);
  });

  afterEach(async () => {
    await new Promise((resolve) => db.close(resolve));
  });

  describe('migrations', () => {
    it('creates the users and products tables', async () => {
      const tables = await all(db, "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name");

      expect(tables.map((table) => table.name)).toEqual(expect.arrayContaining(['products', 'users']));
    });

    it('seeds an admin user with a hashed password', async () => {
      const admin = await get(db, 'SELECT * FROM users WHERE username = ?', ['admin']);

      expect(admin).toEqual(expect.objectContaining({ firstname: 'Admin', lastname: 'User' }));
      expect(admin.password).not.toBe('admin123');
      expect(bcrypt.compareSync('admin123', admin.password)).toBe(true);
    });

    it('seeds the sample products', async () => {
      const products = await all(db, 'SELECT name, price, stock FROM products ORDER BY id');

      expect(products).toEqual([
        { name: 'Laptop', price: 999.99, stock: 10 },
        { name: 'Smartphone', price: 499.99, stock: 15 },
        { name: 'Headphones', price: 79.99, stock: 20 }
      ]);
    });

    it('is idempotent: running it again does not duplicate seed data', async () => {
      await initDatabase(db);

      expect(await get(db, 'SELECT COUNT(*) AS count FROM users')).toEqual({ count: 1 });
      expect(await get(db, 'SELECT COUNT(*) AS count FROM products')).toEqual({ count: 3 });
    });

    it('rejects when a migration query fails', async () => {
      await new Promise((resolve) => db.close(resolve));

      await expect(initDatabase(db)).rejects.toThrow(/SQLITE_MISUSE/);

      db = await open();
    });
  });

  describe('users', () => {
    it('creates, reads, updates and deletes a user', async () => {
      const { lastID } = await run(
        db,
        'INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)',
        ['ada', 'hash', 'Ada', 'Lovelace']
      );

      const created = await get(db, 'SELECT * FROM users WHERE id = ?', [lastID]);
      expect(created).toEqual(expect.objectContaining({ firstname: 'Ada', username: 'ada' }));
      expect(created.created_at).toEqual(expect.any(String));

      const update = await run(db, 'UPDATE users SET lastname = ? WHERE id = ?', ['Byron', lastID]);
      expect(update.changes).toBe(1);
      expect(await get(db, 'SELECT lastname FROM users WHERE id = ?', [lastID])).toEqual({ lastname: 'Byron' });

      const removal = await run(db, 'DELETE FROM users WHERE id = ?', [lastID]);
      expect(removal.changes).toBe(1);
      expect(await get(db, 'SELECT * FROM users WHERE id = ?', [lastID])).toBeUndefined();
    });

    it('enforces username uniqueness', async () => {
      await expect(run(db, 'INSERT INTO users (username, password) VALUES (?, ?)', ['admin', 'hash'])).rejects.toThrow(
        /UNIQUE constraint failed: users.username/
      );
    });

    it('auto-increments ids', async () => {
      const first = await run(db, 'INSERT INTO users (username) VALUES (?)', ['u1']);
      const second = await run(db, 'INSERT INTO users (username) VALUES (?)', ['u2']);

      expect(second.lastID).toBe(first.lastID + 1);
    });
  });

  describe('products', () => {
    it('creates, reads, updates and deletes a product', async () => {
      const { lastID } = await run(db, 'INSERT INTO products (name, price, stock) VALUES (?, ?, ?)', [
        'Mouse',
        19.9,
        4
      ]);

      expect(await get(db, 'SELECT name, price, stock FROM products WHERE id = ?', [lastID])).toEqual({
        name: 'Mouse',
        price: 19.9,
        stock: 4
      });

      await run(db, 'UPDATE products SET stock = ? WHERE id = ?', [0, lastID]);
      expect(await get(db, 'SELECT stock FROM products WHERE id = ?', [lastID])).toEqual({ stock: 0 });

      await run(db, 'DELETE FROM products WHERE id = ?', [lastID]);
      expect(await get(db, 'SELECT * FROM products WHERE id = ?', [lastID])).toBeUndefined();
    });

    it('requires a name (NOT NULL)', async () => {
      await expect(run(db, 'INSERT INTO products (price, stock) VALUES (?, ?)', [1, 1])).rejects.toThrow(
        /NOT NULL constraint failed: products.name/
      );
    });

    it('defaults price and stock to 0 and sets created_at', async () => {
      const { lastID } = await run(db, 'INSERT INTO products (name) VALUES (?)', ['Cable']);

      const product = await get(db, 'SELECT price, stock, created_at FROM products WHERE id = ?', [lastID]);

      expect(product).toEqual({ created_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2} /), price: 0, stock: 0 });
    });

    it('reports zero changes when updating an unknown product', async () => {
      const { changes } = await run(db, 'UPDATE products SET stock = ? WHERE id = ?', [1, 9999]);

      expect(changes).toBe(0);
    });
  });
});
