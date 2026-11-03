import { screen } from '@testing-library/react';

import { serverError } from '../test/mocks/handlers';
import { server } from '../test/mocks/server';
import { loginAs, renderWithRouter } from '../test/utils';
import UserList from './UserList';

const userNames = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);

const renderList = async () => {
  const result = renderWithRouter(<UserList />, { route: '/users' });
  await screen.findByRole('heading', { name: 'Ada Lovelace' });
  return result;
};

describe('UserList', () => {
  beforeEach(() => {
    loginAs();
  });

  it('renders the users sorted by name', async () => {
    await renderList();

    expect(userNames()).toEqual(['Ada Lovelace', 'Alan Turing', 'Grace Hopper']);
    expect(screen.getByText('@grace')).toBeInTheDocument();
  });

  it('reverses the order with the sort direction button', async () => {
    const { user } = await renderList();

    await user.click(screen.getByRole('button', { name: '↑' }));

    expect(userNames()).toEqual(['Grace Hopper', 'Alan Turing', 'Ada Lovelace']);
    expect(screen.getByRole('button', { name: '↓' })).toBeInTheDocument();
  });

  it('sorts the users by join date', async () => {
    const { user } = await renderList();
    const [, sortSelect] = screen.getAllByRole('combobox');

    await user.selectOptions(sortSelect, 'joined');

    expect(userNames()).toEqual(['Alan Turing', 'Grace Hopper', 'Ada Lovelace']);
  });

  it('filters the users with the search field', async () => {
    const { user } = await renderList();

    await user.type(screen.getByPlaceholderText('Search users...'), 'grace');

    expect(userNames()).toEqual(['Grace Hopper']);
  });

  it('filters the users by join period', async () => {
    const { user } = await renderList();
    const [joinedSelect] = screen.getAllByRole('combobox');

    await user.selectOptions(joinedSelect, 'week');
    expect(userNames()).toEqual(['Ada Lovelace']);

    await user.selectOptions(joinedSelect, 'month');
    expect(userNames()).toEqual(['Grace Hopper']);

    await user.selectOptions(joinedSelect, 'older');
    expect(userNames()).toEqual(['Alan Turing']);
  });

  it('shows an error message when the API fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    server.use(serverError('get', '/auth/users'));

    renderWithRouter(<UserList />, { route: '/users' });

    expect(await screen.findByText('Failed to load users')).toBeInTheDocument();
    expect(screen.getByText('No users found matching your criteria')).toBeInTheDocument();
  });
});
