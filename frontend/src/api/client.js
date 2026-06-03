// Shared fetch helper. Reads base URL from env and attaches the JWT.
export const BASE = import.meta.env.VITE_API_URL;

export const authHeaders = () => {
  const token = localStorage.getItem('studiea_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiFetch = (path, { method = 'GET', body, headers = {} } = {}) =>
  fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...authHeaders(),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  }).then(r => r.json());
