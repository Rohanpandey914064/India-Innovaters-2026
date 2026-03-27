/** Base URL for API (empty = same origin, use Vite proxy in dev) */
export function apiUrl(path) {
  const base = import.meta.env.VITE_API_URL || '';
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}

const TOKEN_KEY = 'cityspark_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('cityspark_user');
}

function authHeaders() {
  const t = getStoredToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function apiHealth() {
  try {
    const res = await fetch(apiUrl('/api/health'));
    return res.ok;
  } catch {
    return false;
  }
}

export async function apiJson(path, options = {}) {
  const { body, skipAuth, ...rest } = options;
  const res = await fetch(apiUrl(path), {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(skipAuth ? {} : authHeaders()),
      ...rest.headers,
    },
    body: body !== undefined && typeof body !== 'string' ? JSON.stringify(body) : body,
  });

  const isCredentialAttempt =
    path.includes('/api/auth/login') || path.includes('/api/auth/signup');
  if (res.status === 401 && !skipAuth && !isCredentialAttempt) {
    clearAuthStorage();
    window.dispatchEvent(new Event('auth:logout'));
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = typeof data === 'object' && data?.error ? data.error : text || res.statusText;
    throw new Error(msg);
  }
  return data;
}
