import { render, screen } from '@testing-library/react';

import App from './App';
import { products } from './test/mocks/fixtures';
import { loginAs } from './test/utils';

describe('App', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/');
  });

  it('redirects an unauthenticated user to the login page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(window.location.pathname).toBe('/login');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows the navigation and the product list when a token is stored', async () => {
    loginAs();

    render(<App />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(window.location.pathname).toBe('/products');
    expect(await screen.findByRole('heading', { name: products[0].name })).toBeInTheDocument();
  });
});
