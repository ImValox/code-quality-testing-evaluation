import { render, screen } from '@testing-library/react';

import App from './App';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.pushState({}, '', '/');
  });

  it('redirects an unauthenticated user to the login page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
  });

  it('shows the navigation when a token is stored', () => {
    localStorage.setItem('token', 'fake-token');

    render(<App />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
