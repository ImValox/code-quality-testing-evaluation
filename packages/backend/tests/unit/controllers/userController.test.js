jest.mock('../../../src/db/database', () => ({
  getDb: jest.fn()
}));
jest.mock('bcryptjs', () => ({
  compareSync: jest.fn(),
  hashSync: jest.fn()
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn()
}));

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userController = require('../../../src/controllers/userController');
const db = require('../../../src/db/database');
const { mockRequest, mockResponse } = require('../../helpers/http');

describe('userController (unit)', () => {
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
    bcrypt.hashSync.mockReturnValue('hashed-password');
    jwt.sign.mockReturnValue('signed-token');
  });

  describe('registerUser', () => {
    const body = { firstname: 'Jane', lastname: 'Doe', password: 'secret', username: 'jdoe' };

    it('hashes the password, inserts the user and responds 201 with a token', () => {
      database.run.mockImplementation(function (_sql, _params, callback) {
        callback.call({ lastID: 5 }, null);
      });
      const res = mockResponse();

      userController.registerUser(mockRequest({ body }), res);

      expect(bcrypt.hashSync).toHaveBeenCalledWith('secret', 8);
      expect(database.run).toHaveBeenCalledWith(
        'INSERT INTO users (username, password, firstname, lastname) VALUES (?, ?, ?, ?)',
        ['jdoe', 'hashed-password', 'Jane', 'Doe'],
        expect.any(Function)
      );
      expect(jwt.sign).toHaveBeenCalledWith({ id: 5 }, expect.any(String), { expiresIn: 86_400 });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ auth: true, token: 'signed-token' });
    });

    it('responds 500 when the insert fails (e.g. duplicate username)', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      database.run.mockImplementation((_sql, _params, callback) => callback(new Error('UNIQUE constraint failed')));
      const res = mockResponse();

      userController.registerUser(mockRequest({ body }), res);

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
    });
  });

  describe('loginUser', () => {
    const storedUser = {
      firstname: 'Admin',
      id: 1,
      lastname: 'User',
      password: 'stored-hash',
      username: 'admin'
    };

    it('responds 200 with a token and the public user fields on valid credentials', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(null, storedUser));
      bcrypt.compareSync.mockReturnValue(true);
      const res = mockResponse();

      userController.loginUser(mockRequest({ body: { password: 'admin123', username: 'admin' } }), res);

      expect(database.get).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE username = ?',
        ['admin'],
        expect.any(Function)
      );
      expect(bcrypt.compareSync).toHaveBeenCalledWith('admin123', 'stored-hash');
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1 }, expect.any(String), { expiresIn: 86_400 });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        auth: true,
        token: 'signed-token',
        user: { firstname: 'Admin', id: 1, lastname: 'User', username: 'admin' }
      });
    });

    it('never exposes the password hash in the response', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(null, storedUser));
      bcrypt.compareSync.mockReturnValue(true);
      const res = mockResponse();

      userController.loginUser(mockRequest({ body: { password: 'admin123', username: 'admin' } }), res);

      expect(res.json.mock.calls[0][0].user).not.toHaveProperty('password');
    });

    it('responds 401 when the password is invalid', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(null, storedUser));
      bcrypt.compareSync.mockReturnValue(false);
      const res = mockResponse();

      userController.loginUser(mockRequest({ body: { password: 'wrong', username: 'admin' } }), res);

      expect(jwt.sign).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ auth: false, token: null });
    });

    it('responds 404 when the user does not exist', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(null));
      const res = mockResponse();

      userController.loginUser(mockRequest({ body: { password: 'x', username: 'ghost' } }), res);

      expect(bcrypt.compareSync).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'No user found.' });
    });

    it('responds 500 when the query fails', () => {
      database.get.mockImplementation((_sql, _params, callback) => callback(new Error('db down')));
      const res = mockResponse();

      userController.loginUser(mockRequest({ body: { password: 'x', username: 'admin' } }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error on the server.' });
    });
  });

  describe('getAllUsers', () => {
    it('returns the users without their passwords', () => {
      const users = [{ created_at: '2026-01-01', firstname: 'Admin', id: 1, lastname: 'User', username: 'admin' }];
      database.all.mockImplementation((_sql, _params, callback) => callback(null, users));
      const res = mockResponse();

      userController.getAllUsers(mockRequest(), res);

      expect(database.all.mock.calls[0][0]).not.toMatch(/password/);
      expect(res.json).toHaveBeenCalledWith(users);
    });

    it('responds 500 when the query fails', () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      database.all.mockImplementation((_sql, _params, callback) => callback(new Error('db down')));
      const res = mockResponse();

      userController.getAllUsers(mockRequest(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error getting users' });
    });
  });

  describe('findSimilarUsernames', () => {
    it('returns pairs of usernames within a Levenshtein distance of 2 (case-insensitive)', () => {
      const users = [{ username: 'John' }, { username: 'jon' }, { username: 'alice' }, { username: 'Alicia' }];
      database.all.mockImplementation((_sql, _params, callback) => callback(null, users));
      const res = mockResponse();

      userController.findSimilarUsernames(mockRequest(), res);

      expect(res.json).toHaveBeenCalledWith({
        similar: [
          { distance: 1, user1: 'John', user2: 'jon' },
          { distance: 2, user1: 'alice', user2: 'Alicia' }
        ],
        totalComparisons: 6
      });
    });

    it('returns no pairs and zero comparisons for a single user', () => {
      database.all.mockImplementation((_sql, _params, callback) => callback(null, [{ username: 'admin' }]));
      const res = mockResponse();

      userController.findSimilarUsernames(mockRequest(), res);

      expect(res.json).toHaveBeenCalledWith({ similar: [], totalComparisons: 0 });
    });

    it('responds 500 with the error message when the query fails', () => {
      database.all.mockImplementation((_sql, _params, callback) => callback(new Error('db down')));
      const res = mockResponse();

      userController.findSimilarUsernames(mockRequest(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
    });
  });
});
