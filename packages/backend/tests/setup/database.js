const db = require('../../src/db/database');

beforeAll(async () => {
  await db.connect();
});

afterAll(async () => {
  await db.closeConnection();
});
