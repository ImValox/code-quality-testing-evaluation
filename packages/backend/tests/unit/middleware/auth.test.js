const jwt = require('jsonwebtoken');

const auth = require('../../../src/middleware/auth');
const { mockRequest, mockResponse } = require('../../helpers/http');

// Must match the secret used by the middleware (to be moved to env vars, see #42)
const SECRET = 'your-super-secret-key-that-should-not-be-hardcoded';

const withToken = (authorization) => mockRequest({ headers: { authorization } });

describe('auth middleware', () => {
  let next;
  let res;

  beforeEach(() => {
    next = jest.fn();
    res = mockResponse();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls next() and sets req.user for a valid token', () => {
    const req = withToken(`Bearer ${jwt.sign({ id: 7 }, SECRET, { expiresIn: 60 })}`);

    auth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual(expect.objectContaining({ id: 7 }));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('responds 401 when no token is provided', () => {
    auth(mockRequest(), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
  });

  it.each([
    ['a header without the Bearer scheme', 'only-one-part'],
    ['a malformed token', 'Bearer not-a-jwt'],
    ['an empty Bearer value', 'Bearer ']
  ])('responds 401 for %s', (_label, header) => {
    auth(withToken(header), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to authenticate token' });
  });

  it('responds 401 for an expired token', () => {
    const expired = jwt.sign({ exp: Math.floor(Date.now() / 1000) - 60, id: 7 }, SECRET);

    auth(withToken(`Bearer ${expired}`), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(console.error).toHaveBeenCalledWith('Auth error:', expect.objectContaining({ name: 'TokenExpiredError' }));
  });

  it('responds 401 for a token signed with another secret', () => {
    auth(withToken(`Bearer ${jwt.sign({ id: 7 }, 'another-secret')}`), res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });
});
