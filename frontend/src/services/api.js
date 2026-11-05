const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || `Error ${response.status}: no se pudo completar la solicitud.`);
  return payload;
}

export const api = {
  list: (table) => request(`/${table}`),
  get: (table, id) => request(`/${table}/${id}`),
  create: (table, data) => request(`/${table}`, { method: 'POST', body: JSON.stringify(data) }),
  update: (table, id, data) => request(`/${table}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  patch: (path, data = undefined) => request(path, { method: 'PATCH', ...(data === undefined ? {} : { body: JSON.stringify(data) }) }),
  remove: (table, id) => request(`/${table}/${id}`, { method: 'DELETE' }),
  dashboard: () => request('/dashboard'),
  health: () => request('/health'),
};
