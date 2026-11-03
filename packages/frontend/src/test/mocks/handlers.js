import { http, HttpResponse } from 'msw';

import { API_URL, authUser, credentials, products, TOKEN, users } from './fixtures';

const isAuthorized = (request) => request.headers.get('Authorization') === `Bearer ${TOKEN}`;

const noToken = () => HttpResponse.json({ error: 'No token provided' }, { status: 401 });

// Handlers par défaut : reproduisent les réponses nominales du backend.
export const handlers = [
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const { password, username } = await request.json();

    if (username !== credentials.username) {
      return HttpResponse.json({ error: 'No user found.' }, { status: 404 });
    }
    if (password !== credentials.password) {
      return HttpResponse.json({ auth: false, token: null }, { status: 401 });
    }
    return HttpResponse.json({ auth: true, token: TOKEN, user: authUser });
  }),

  http.post(`${API_URL}/auth/register`, () => HttpResponse.json({ auth: true, token: TOKEN }, { status: 201 })),

  http.get(`${API_URL}/auth/users`, ({ request }) => (isAuthorized(request) ? HttpResponse.json(users) : noToken())),

  http.get(`${API_URL}/products`, ({ request }) =>
    isAuthorized(request) ? HttpResponse.json({ data: products, message: 'success' }) : noToken()
  ),

  http.post(`${API_URL}/products`, async ({ request }) => {
    if (!isAuthorized(request)) return noToken();
    const body = await request.json();
    return HttpResponse.json({ id: products.length + 1, ...body }, { status: 201 });
  })
];

// Handlers d'erreur réutilisables, à passer à `server.use(...)` dans un test.
const methods = { delete: http.delete, get: http.get, post: http.post, put: http.put };

export const unauthorized = (method, path) => methods[method](`${API_URL}${path}`, noToken);

export const serverError = (method, path, error = 'Internal server error') =>
  methods[method](`${API_URL}${path}`, () => HttpResponse.json({ error }, { status: 500 }));
