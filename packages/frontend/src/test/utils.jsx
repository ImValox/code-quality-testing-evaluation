import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { TOKEN } from './mocks/fixtures';

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

// Rend un composant dans un routeur mémoire et expose le chemin courant via `data-testid="location"`.
export const renderWithRouter = (ui, { route = '/' } = {}) => ({
  user: userEvent.setup(),
  ...render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }} initialEntries={[route]}>
      {ui}
      <LocationDisplay />
    </MemoryRouter>
  )
});

export const loginAs = (user = { firstname: 'Ada' }) => {
  localStorage.setItem('token', TOKEN);
  localStorage.setItem('user', JSON.stringify(user));
};
