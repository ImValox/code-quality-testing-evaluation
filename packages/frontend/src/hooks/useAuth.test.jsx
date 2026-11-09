import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { useAuth } from './useAuth';

const wrapper = ({ children }) => (
  <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }} initialEntries={['/products']}>
    {children}
  </MemoryRouter>
);

const renderAuth = () =>
  renderHook(
    () => {
      const auth = useAuth();
      const location = useLocation();
      return { ...auth, pathname: location.pathname };
    },
    { wrapper }
  );

describe('useAuth', () => {
  afterEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('starts without user when the session is empty', () => {
    const { result } = renderAuth();

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('restores the user from localStorage', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));

    const { result } = renderAuth();

    expect(result.current.user).toEqual({ firstname: 'Ada' });
  });

  it('ignores a stored user without token', () => {
    localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));

    const { result } = renderAuth();

    expect(result.current.user).toBeNull();
  });

  it('persists the session on login', () => {
    const { result } = renderAuth();

    act(() => {
      result.current.login('abc', { firstname: 'Ada' });
    });

    expect(localStorage.getItem('token')).toBe('abc');
    expect(JSON.parse(localStorage.getItem('user'))).toEqual({ firstname: 'Ada' });
    expect(result.current.user).toEqual({ firstname: 'Ada' });
  });

  it('logs the error when the session cannot be saved', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { result } = renderAuth();

    act(() => {
      result.current.login('abc', { firstname: 'Ada' });
    });

    expect(console.error).toHaveBeenCalledWith('Failed to save auth data:', expect.any(Error));
    expect(result.current.user).toBeNull();
  });

  it('clears the session and redirects to /login on logout', () => {
    localStorage.setItem('token', 'abc');
    localStorage.setItem('user', JSON.stringify({ firstname: 'Ada' }));
    const { result } = renderAuth();

    act(() => {
      result.current.logout();
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.pathname).toBe('/login');
  });
});
