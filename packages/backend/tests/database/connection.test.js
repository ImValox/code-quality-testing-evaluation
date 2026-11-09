// Each test loads a fresh copy of the module so the connection state is not shared
// with the global test setup.
const loadDatabaseModule = () => {
  let db;
  jest.isolateModules(() => {
    db = require('../../src/db/database');
  });
  return db;
};

describe('database connection module', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws when getDb is called before connect', () => {
    const db = loadDatabaseModule();

    expect(() => db.getDb()).toThrow('Database not connected. Call connect() first.');
  });

  it('connects, initializes the schema and exposes the instance', async () => {
    const db = loadDatabaseModule();

    const instance = await db.connect();

    expect(db.getDb()).toBe(instance);
    const row = await new Promise((resolve, reject) => {
      instance.get('SELECT COUNT(*) AS count FROM products', (err, result) => (err ? reject(err) : resolve(result)));
    });
    expect(row.count).toBe(3);

    await db.closeConnection();
  });

  it('reuses the existing connection on subsequent connect calls', async () => {
    const db = loadDatabaseModule();

    const first = await db.connect();
    const second = await db.connect();

    expect(second).toBe(first);

    await db.closeConnection();
  });

  it('closes the connection and resets the state', async () => {
    const db = loadDatabaseModule();
    await db.connect();

    await db.closeConnection();

    expect(() => db.getDb()).toThrow();
  });

  it('resolves closeConnection when not connected', async () => {
    const db = loadDatabaseModule();

    await expect(db.closeConnection()).resolves.toBeUndefined();
  });
});
