const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function getToken() {
  return localStorage.getItem('synclab_token');
}

export function saveSession(token, user) {
  localStorage.setItem('synclab_token', token);
  localStorage.setItem('synclab_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('synclab_token');
  localStorage.removeItem('synclab_user');
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('synclab_user'));
  } catch {
    return null;
  }
}

async function request(path, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData || (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.message || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = json?.data;
    throw err;
  }
  return json;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, formData) => request(path, { method: 'POST', formData }),
};
