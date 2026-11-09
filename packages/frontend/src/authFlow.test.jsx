import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from './App';
import { authUser, credentials, products, TOKEN } from './test/mocks/fixtures';
import { loginAs } from './test/utils';

// Rend l'application complète (BrowserRouter) à partir d'une URL donnée.
const renderAppAt = (path) => {
  window.history.pushState({}, '', path);
  return { user: userEvent.setup(), ...render(<App />) };
};

const submitLogin = async (user, { password, username }) => {
  await user.type(screen.getByPlaceholderText('Username'), username);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('Authentication flow', () => {
  describe('login', () => {
    it('stores the session and redirects to the product list on success', async () => {
      const { user } = renderAppAt('/login');

      await submitLogin(user, credentials);

      expect(await screen.findByRole('heading', { name: products[0].name })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/products');
      expect(localStorage.getItem('token')).toBe(TOKEN);
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(authUser);
      expect(screen.getByRole('navigation')).toHaveTextContent(`, ${authUser.firstname}`);
    });

    it('shows an error and keeps the user logged out on failure', async () => {
      const { user } = renderAppAt('/login');

      await submitLogin(user, { password: 'whatever', username: 'nobody' });

      expect(await screen.findByText('No user found.')).toBeInTheDocument();
      expect(window.location.pathname).toBe('/login');
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });

  describe('protected routes', () => {
    it.each(['/products', '/users', '/add-product'])('redirects %s to /login without a token', (path) => {
      renderAppAt(path);

      expect(window.location.pathname).toBe('/login');
      expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    });

    it.each([
      ['/products', 'Products'],
      ['/users', 'Users'],
      ['/add-product', 'Add New Product']
    ])('renders %s when a token is stored', async (path, heading) => {
      loginAs();

      renderAppAt(path);

      expect(window.location.pathname).toBe(path);
      expect(await screen.findByRole('heading', { level: 2, name: heading })).toBeInTheDocument();
    });

    it('lets a newly registered user reach the product list', async () => {
      const { user } = renderAppAt('/register');

      await user.type(screen.getByPlaceholderText('First Name'), 'Grace');
      await user.type(screen.getByPlaceholderText('Last Name'), 'Hopper');
      await user.type(screen.getByPlaceholderText('Username'), 'grace');
      await user.type(screen.getByPlaceholderText('Password'), 'cobol1959');
      await user.click(screen.getByRole('button', { name: 'Register' }));

      expect(await screen.findByRole('heading', { name: products[0].name })).toBeInTheDocument();
      expect(window.location.pathname).toBe('/products');
    });
  });

  describe('logout', () => {
    it('clears the session and protects the routes again', async () => {
      loginAs();
      const { user } = renderAppAt('/products');
      await screen.findByRole('heading', { name: products[0].name });

      await user.click(screen.getByRole('button', { name: 'Logout' }));

      expect(window.location.pathname).toBe('/login');
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'Register' }));
      expect(window.location.pathname).toBe('/register');
    });

    it('redirects to /login when a protected route is visited after logout', async () => {
      loginAs();
      const { unmount, user } = renderAppAt('/products');
      await user.click(screen.getByRole('button', { name: 'Logout' }));
      unmount();

      renderAppAt('/users');

      expect(window.location.pathname).toBe('/login');
    });
  });
});
