import { screen } from '@testing-library/react';

import { loginAs, renderWithRouter } from '../test/utils';
import Navigation from './Navigation';

describe('Navigation', () => {
  it('renders the links and greets the stored user', () => {
    loginAs({ firstname: 'Ada' });

    renderWithRouter(<Navigation onLogout={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute('href', '/products');
    expect(screen.getByText(/^Good (morning|afternoon|evening), Ada/)).toBeInTheDocument();
  });

  it('falls back to "User" when no user is stored', () => {
    renderWithRouter(<Navigation onLogout={jest.fn()} />);

    expect(screen.getByText(/, User /)).toBeInTheDocument();
  });

  it('clears the session, notifies the parent and goes to /login on logout', async () => {
    loginAs();
    const onLogout = jest.fn();
    const { user } = renderWithRouter(<Navigation onLogout={onLogout} />, { route: '/products' });

    await user.click(screen.getByRole('button', { name: 'Logout' }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location')).toHaveTextContent('/login');
  });
});
