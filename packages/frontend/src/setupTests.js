import '@testing-library/jest-dom';

import { server } from './test/mocks/server';

// Toute requête non mockée fait échouer le test : aucun appel réseau réel n'est possible.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => server.close());
