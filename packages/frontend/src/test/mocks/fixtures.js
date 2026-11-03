export const API_URL = 'http://localhost:3001/api';

export const TOKEN = 'fake-jwt-token';

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

// Forme de la réponse de POST /auth/login
export const authUser = {
  firstname: 'Ada',
  id: 1,
  lastname: 'Lovelace',
  username: 'ada'
};

export const credentials = {
  password: 'secret123',
  username: 'ada'
};

// Forme de la réponse de GET /auth/users
export const users = [
  { created_at: daysAgo(2), firstname: 'Ada', id: 1, lastname: 'Lovelace', username: 'ada' },
  { created_at: daysAgo(15), firstname: 'Grace', id: 2, lastname: 'Hopper', username: 'grace' },
  { created_at: daysAgo(90), firstname: 'Alan', id: 3, lastname: 'Turing', username: 'alan' }
];

// Contenu de `data` dans la réponse de GET /products
export const products = [
  { id: 1, name: 'Keyboard', price: 45, stock: 12 },
  { id: 2, name: 'Monitor', price: 199, stock: 0 },
  { id: 3, name: 'Headphones', price: 75, stock: 5 }
];
