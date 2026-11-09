// Minimal Express-like request/response doubles for controller unit tests.

const mockRequest = ({ body = {}, headers = {}, params = {}, query = {}, user } = {}) => ({
  body,
  headers,
  params,
  query,
  user
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Waits for pending promise callbacks (controllers that await inside DB callbacks).
const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

module.exports = { flushPromises, mockRequest, mockResponse };
