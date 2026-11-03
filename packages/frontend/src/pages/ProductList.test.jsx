import { screen } from '@testing-library/react';

import { serverError } from '../test/mocks/handlers';
import { server } from '../test/mocks/server';
import { loginAs, renderWithRouter } from '../test/utils';
import ProductList from './ProductList';

const productNames = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

const renderList = async () => {
  const result = renderWithRouter(<ProductList />, { route: '/products' });
  await screen.findByRole('heading', { name: 'Keyboard' });
  return result;
};

describe('ProductList', () => {
  beforeEach(() => {
    loginAs();
  });

  it('renders the products returned by the API', async () => {
    await renderList();

    expect(productNames()).toEqual(['Keyboard', 'Monitor', 'Headphones']);
    expect(screen.getByText('Price: $199')).toBeInTheDocument();
    expect(screen.getByText('Stock: 0')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add Product' })).toHaveAttribute('href', '/add-product');
  });

  it('filters the products with the search field', async () => {
    const { user } = await renderList();

    await user.type(screen.getByPlaceholderText('Search products...'), 'keyboard');

    expect(productNames()).toEqual(['Keyboard']);
  });

  it('filters the products by price range', async () => {
    const { user } = await renderList();
    const [priceSelect] = screen.getAllByRole('combobox');

    await user.selectOptions(priceSelect, 'high');
    expect(productNames()).toEqual(['Monitor']);

    await user.selectOptions(priceSelect, 'medium');
    expect(productNames()).toEqual(['Headphones']);
  });

  it('filters the products by stock status', async () => {
    const { user } = await renderList();
    const [, stockSelect] = screen.getAllByRole('combobox');

    await user.selectOptions(stockSelect, 'out');
    expect(productNames()).toEqual(['Monitor']);

    await user.selectOptions(stockSelect, 'low');
    expect(productNames()).toEqual(['Headphones']);
  });

  it('shows an empty-state message when nothing matches', async () => {
    const { user } = await renderList();

    await user.type(screen.getByPlaceholderText('Search products...'), 'zzzzzzzz');

    expect(screen.queryAllByRole('heading', { level: 3 })).toHaveLength(0);
    expect(screen.getByText('No products found matching your criteria')).toBeInTheDocument();
  });

  it('shows the empty state when the API fails', async () => {
    // getProducts intercepte l'erreur, la logue et renvoie une liste vide.
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    server.use(serverError('get', '/products'));

    renderWithRouter(<ProductList />, { route: '/products' });

    expect(await screen.findByText('No products found matching your criteria')).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith('Error fetching products:', expect.anything());
  });
});
