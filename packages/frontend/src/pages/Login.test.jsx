import { screen } from '@testing-library/react';

import { authUser, credentials, TOKEN } from '../test/mocks/fixtures';
import { renderWithRouter } from '../test/utils';
import Login from './Login';

const fillAndSubmit = async (user, { password, username }) => {
  await user.type(screen.getByPlaceholderText('Username'), username);
  await user.type(screen.getByPlaceholderText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Login' }));
};

describe('Login', () => {
  it('renders the form and a link to the register page', () => {
    renderWithRouter(<Login onLogin={jest.fn()} />);

    expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Register' })).toHaveAttribute('href', '/register');
  });

  it('stores the session, calls onLogin and redirects to /products on success', async () => {
    const onLogin = jest.fn();
    const { user } = renderWithRouter(<Login onLogin={onLogin} />, { route: '/login' });

    await fillAndSubmit(user, credentials);

    expect(await screen.findByTestId('location')).toHaveTextContent('/products');
    expect(onLogin).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('token')).toBe(TOKEN);
    expect(JSON.parse(localStorage.getItem('user'))).toEqual(authUser);
  });

  it('shows the API error message for an unknown user', async () => {
    const onLogin = jest.fn();
    const { user } = renderWithRouter(<Login onLogin={onLogin} />, { route: '/login' });

    await fillAndSubmit(user, { password: 'whatever', username: 'nobody' });

    expect(await screen.findByText('No user found.')).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });

  it('shows a generic error message for a wrong password', async () => {
    const { user } = renderWithRouter(<Login onLogin={jest.fn()} />);

    await fillAndSubmit(user, { ...credentials, password: 'wrong' });

    expect(await screen.findByText('An error occurred')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
