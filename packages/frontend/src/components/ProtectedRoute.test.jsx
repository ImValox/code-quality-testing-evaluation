import { screen } from '@testing-library/react';

import { loginAs, renderWithRouter } from '../test/utils';
import ProtectedRoute from './ProtectedRoute';

describe('ProtectedRoute', () => {
  it('renders its children when a token is stored', () => {
    loginAs();

    renderWithRouter(
      <ProtectedRoute>
        <p>Secret page</p>
      </ProtectedRoute>,
      { route: '/products' }
    );

    expect(screen.getByText('Secret page')).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/products');
  });

  it('redirects to /login without a token', () => {
    renderWithRouter(
      <ProtectedRoute>
        <p>Secret page</p>
      </ProtectedRoute>,
      { route: '/products' }
    );

    expect(screen.queryByText('Secret page')).not.toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
