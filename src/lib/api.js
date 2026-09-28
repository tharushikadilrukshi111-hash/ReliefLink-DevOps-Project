const API_BASE = import.meta.env.VITE_API_URL || '/api';

function getToken() { return localStorage.getItem('crisisbridge_token'); }

export function setSession(token, user) {
  if (token) localStorage.setItem('crisisbridge_token', token);
  if (user) localStorage.setItem('crisisbridge_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('crisisbridge_token');
  localStorage.removeItem('crisisbridge_user');
}

export function getStoredUser() {
  try { return JSON.parse(localStorage.getItem('crisisbridge_user') || 'null'); }
  catch { return null; }
}

export async function api(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { message: text }; }
  if (!response.ok) {
    const error = new Error(data?.message || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const backend = {
  health: () => api('/health'),
  login: (username, password) => api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => api('/auth/me'),
  summary: () => api('/dashboard/summary'),
  incidents: (filter = 'all') => api(`/incidents?filter=${encodeURIComponent(filter)}`),
  createIncident: payload => api('/incidents', { method: 'POST', body: JSON.stringify(payload) }),
  updateIncidentStatus: (id, status) => api(`/incidents/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  dispatchIncident: (id, actionLabel) => api(`/incidents/${id}/dispatch`, { method: 'POST', body: JSON.stringify({ actionLabel }) }),
  inventory: () => api('/inventory'),
  createInventory: payload => api('/inventory', { method: 'POST', body: JSON.stringify(payload) }),
  updateInventory: (id, payload) => api(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteInventory: id => api(`/inventory/${id}`, { method: 'DELETE' }),
  volunteers: () => api('/volunteers'),
  createVolunteer: payload => api('/volunteers', { method: 'POST', body: JSON.stringify(payload) }),
  updateVolunteer: (id, payload) => api(`/volunteers/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteVolunteer: id => api(`/volunteers/${id}`, { method: 'DELETE' }),
  logs: () => api('/field-logs'),
  createLog: payload => api('/field-logs', { method: 'POST', body: JSON.stringify(payload) }),
  quickAction: actionLabel => api('/actions/quick', { method: 'POST', body: JSON.stringify({ actionLabel }) }),
  siren: active => api('/actions/siren', { method: 'POST', body: JSON.stringify({ active }) }),
  sos: active => api('/actions/sos-trigger', { method: 'POST', body: JSON.stringify({ active }) }),
  dispatches: () => api('/actions/dispatches'),
  units: () => api('/units'),
  updateUnit: (id, payload) => api(`/units/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
