const request = require('supertest');

const app = require('../../src/app');

const loginAsAdmin = async () => {
  const res = await request(app).post('/api/auth/login').send({ password: 'admin123', username: 'admin' });
  return res.body.token;
};

describe('Auth & users API', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('creates a user and returns a token (201)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ firstname: 'Ada', lastname: 'Lovelace', password: 'Str0ngPass', username: 'ada' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ auth: true, token: expect.any(String) });
    });

    it('rejects an already used username (500)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ firstname: 'Admin', lastname: 'Bis', password: 'x', username: 'admin' });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error creating user' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('returns a token and the public user profile (200)', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'admin123', username: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        auth: true,
        token: expect.any(String),
        user: { firstname: 'Admin', id: 1, lastname: 'User', username: 'admin' }
      });
    });

    it('rejects a wrong password (401)', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'wrong', username: 'admin' });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ auth: false, token: null });
    });

    it('returns 404 for an unknown user', async () => {
      const res = await request(app).post('/api/auth/login').send({ password: 'x', username: 'ghost' });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No user found.' });
    });
  });

  describe('GET /api/auth/users', () => {
    it('lists users without password (200)', async () => {
      const token = await loginAsAdmin();

      const res = await request(app).get('/api/auth/users').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ firstname: 'Admin', id: 1, username: 'admin' })])
      );
      for (const user of res.body) {
        expect(user).not.toHaveProperty('password');
      }
    });

    it('requires a token (401)', async () => {
      const res = await request(app).get('/api/auth/users');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'No token provided' });
    });

    it('rejects an invalid token (401)', async () => {
      const res = await request(app).get('/api/auth/users').set('Authorization', 'Bearer not-a-jwt');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Failed to authenticate token' });
    });
  });

  describe('GET /api/auth/similar-usernames', () => {
    it('returns usernames close to each other (200)', async () => {
      const token = await loginAsAdmin();
      await request(app)
        .post('/api/auth/register')
        .send({ firstname: 'Ad', lastname: 'Min', password: 'Str0ngPass', username: 'admin2' });

      const res = await request(app).get('/api/auth/similar-usernames').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.similar).toEqual(expect.arrayContaining([{ distance: 1, user1: 'admin', user2: 'admin2' }]));
      expect(res.body.totalComparisons).toBeGreaterThan(0);
    });

    it('requires a token (401)', async () => {
      const res = await request(app).get('/api/auth/similar-usernames');

      expect(res.status).toBe(401);
    });
  });
});
