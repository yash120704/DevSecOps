import api from './api';

const TOKEN_KEY = 'jwt';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';

function notifyAuthChanged() {
  window.dispatchEvent(new Event('auth-changed'));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(payload) {
  if (payload?.session?.access_token) {
    localStorage.setItem(TOKEN_KEY, payload.session.access_token);
  }
  if (payload?.session?.refresh_token) {
    localStorage.setItem(REFRESH_KEY, payload.session.refresh_token);
  }
  if (payload?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  }
  notifyAuthChanged();
}

export async function loginUser(email, password) {
  const { data } = await api.post('/auth/login/', { email, password });
  saveSession(data);
  return data;
}

export async function registerUser(email, password) {
  const { data } = await api.post('/auth/register/', { email, password });
  if (data?.session?.access_token) {
    saveSession(data);
  }
  return data;
}

export async function logoutUser() {
  try {
    await api.post('/auth/logout/');
  } catch (error) {
    // keep logout resilient even if server call fails
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    notifyAuthChanged();
  }
}
