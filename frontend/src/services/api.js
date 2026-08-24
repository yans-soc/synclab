const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

export function ambilToken() {
  return localStorage.getItem('synclab_token');
}

export function simpanSesi(token, pengguna) {
  localStorage.setItem('synclab_token', token);
  localStorage.setItem('synclab_pengguna', JSON.stringify(pengguna));
}

export function hapusSesi() {
  localStorage.removeItem('synclab_token');
  localStorage.removeItem('synclab_pengguna');
}

export function ambilPengguna() {
  try {
    return JSON.parse(localStorage.getItem('synclab_pengguna'));
  } catch {
    return null;
  }
}

async function minta(jalur, { method = 'GET', body, formData } = {}) {
  const headers = {};
  const token = ambilToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${jalur}`, {
    method,
    headers,
    body: formData || (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(json?.pesan || `Permintaan gagal (${res.status})`);
    err.status = res.status;
    err.data = json?.data;
    throw err;
  }
  return json;
}

export const api = {
  get: (jalur) => minta(jalur),
  post: (jalur, body) => minta(jalur, { method: 'POST', body }),
  put: (jalur, body) => minta(jalur, { method: 'PUT', body }),
  del: (jalur) => minta(jalur, { method: 'DELETE' }),
  unggah: (jalur, formData) => minta(jalur, { method: 'POST', formData }),
};
