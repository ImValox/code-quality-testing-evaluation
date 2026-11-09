import { act, renderHook } from '@testing-library/react';
import axios from 'axios';

import { useApi } from './useApi';

jest.mock('axios');

describe('useApi', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('sends the stored token as a Bearer header and returns the response data', async () => {
    localStorage.setItem('token', 'abc');
    axios.mockResolvedValue({ data: { ok: true } });
    const { result } = renderHook(() => useApi());

    let data;
    await act(async () => {
      data = await result.current.get('/api/products');
    });

    expect(axios).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer abc' },
      method: 'GET',
      url: '/api/products'
    });
    expect(data).toEqual({ ok: true });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('omits the Authorization header when no token is stored', async () => {
    axios.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.post('/api/auth/login', { username: 'ada' });
    });

    expect(axios).toHaveBeenCalledWith({
      data: { username: 'ada' },
      headers: { Authorization: undefined },
      method: 'POST',
      url: '/api/auth/login'
    });
  });

  it('exposes put and delete helpers', async () => {
    axios.mockResolvedValue({ data: {} });
    const { result } = renderHook(() => useApi());

    await act(async () => {
      await result.current.put('/api/products/1', { stock: 3 });
      await result.current.delete('/api/products/1');
    });

    expect(axios).toHaveBeenNthCalledWith(1, expect.objectContaining({ data: { stock: 3 }, method: 'PUT' }));
    expect(axios).toHaveBeenNthCalledWith(2, expect.objectContaining({ method: 'DELETE', url: '/api/products/1' }));
  });

  it('stores the API error message and rethrows', async () => {
    const apiError = { response: { data: { error: 'No token provided' } } };
    axios.mockRejectedValue(apiError);
    const { result } = renderHook(() => useApi());

    await act(async () => {
      await expect(result.current.get('/api/users')).rejects.toBe(apiError);
    });

    expect(result.current.error).toBe('No token provided');
    expect(result.current.loading).toBe(false);
  });

  it('falls back to a generic message for network errors', async () => {
    axios.mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useApi());

    await act(async () => {
      await expect(result.current.get('/api/users')).rejects.toThrow('Network Error');
    });

    expect(result.current.error).toBe('An error occurred');
  });
});
