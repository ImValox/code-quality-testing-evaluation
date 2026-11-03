import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import { API_URL } from '../test/mocks/fixtures';
import { serverError, unauthorized } from '../test/mocks/handlers';
import { server } from '../test/mocks/server';
import { loginAs, renderWithRouter } from '../test/utils';
import AddProduct from './AddProduct';

const fillForm = async (user, { name = 'Webcam', price = '59.9', stock = '7' } = {}) => {
  if (name) await user.type(screen.getByPlaceholderText('Product Name'), name);
  if (price) await user.type(screen.getByPlaceholderText('Price'), price);
  if (stock) await user.type(screen.getByPlaceholderText('Stock'), stock);
};

describe('AddProduct', () => {
  beforeEach(() => {
    loginAs();
    // Le composant logue les échecs de création, attendus dans les cas d'erreur.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('shows a validation error and sends nothing when a field is empty', async () => {
    const onRequest = jest.fn();
    server.events.on('request:start', onRequest);
    const { user } = renderWithRouter(<AddProduct />, { route: '/add-product' });

    await fillForm(user, { stock: '' });
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(screen.getByText('All fields are required!')).toBeInTheDocument();
    expect(onRequest).not.toHaveBeenCalled();
    server.events.removeAllListeners();
  });

  it('creates the product and redirects to /products', async () => {
    let body;
    server.use(
      http.post(`${API_URL}/products`, async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ id: 4, ...body }, { status: 201 });
      })
    );
    const { user } = renderWithRouter(<AddProduct />, { route: '/add-product' });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(await screen.findByTestId('location')).toHaveTextContent('/products');
    expect(body).toEqual({ name: 'Webcam', price: '59.9', stock: '7' });
  });

  it('shows the API error message on a 500', async () => {
    server.use(serverError('post', '/products', 'Error creating product'));
    const { user } = renderWithRouter(<AddProduct />, { route: '/add-product' });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(await screen.findByText('Error creating product')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/add-product');
  });

  it('shows the API error message on a 401', async () => {
    server.use(unauthorized('post', '/products'));
    const { user } = renderWithRouter(<AddProduct />, { route: '/add-product' });

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Add Product' }));

    expect(await screen.findByText('No token provided')).toBeInTheDocument();
  });

  it('goes back to /products on cancel', async () => {
    const { user } = renderWithRouter(<AddProduct />, { route: '/add-product' });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByTestId('location')).toHaveTextContent('/products');
  });
});
