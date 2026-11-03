import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { API_URL, TOKEN } from '../test/mocks/fixtures';
import { serverError } from '../test/mocks/handlers';
import { server } from '../test/mocks/server';
import { renderWithRouter } from '../test/utils';
import Register from './Register';

const newUser = { firstname: 'Grace', lastname: 'Hopper', password: 'cobol1959', username: 'grace' };

const fillForm = async (user) => {
  await user.type(screen.getByPlaceholderText('First Name'), newUser.firstname);
  await user.type(screen.getByPlaceholderText('Last Name'), newUser.lastname);
  await user.type(screen.getByPlaceholderText('Username'), newUser.username);
  await user.type(screen.getByPlaceholderText('Password'), newUser.password);
};

describe('Register', () => {
  it('renders the four fields and a link to the login page', () => {
    renderWithRouter(<Register />);

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    expect(screen.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
  });

  it('sends the form data, stores the token and redirects to /products', async () => {
    let body;
    server.use(
      http.post(`${API_URL}/auth/register`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ auth: true, token: TOKEN }, { status: 201 });
      })
    );
    const { user } = renderWithRouter(<Register />, { route: '/register' });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/products');
    expect(body).toEqual(newUser);
    expect(localStorage.getItem('token')).toBe(TOKEN);
  });

  it('shows the API error message when registration fails', async () => {
    server.use(serverError('post', '/auth/register', 'Error creating user'));
    const { user } = renderWithRouter(<Register />, { route: '/register' });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Register' }));

    expect(await screen.findByText('Error creating user')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/register');
  });
});
