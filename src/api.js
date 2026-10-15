const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");
export const LOGIN_PATH = import.meta.env.VITE_LOGIN_PATH || "/auth/login";
export const REGISTER_PATH = import.meta.env.VITE_REGISTER_PATH || "/auth/register";
export const ENTRIES_PATH = import.meta.env.VITE_ENTRIES_PATH || "/entries";

export function getToken() {
  return localStorage.getItem("klip_token");
}
export function setToken(token) {
  if (token) localStorage.setItem("klip_token", token);
}
export function clearToken() {
  localStorage.removeItem("klip_token");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload;
}

export async function loginRequest(body) {
  return apiRequest(LOGIN_PATH, { method: "POST", body: JSON.stringify(body) });
}
export async function registerRequest(body) {
  return apiRequest(REGISTER_PATH, { method: "POST", body: JSON.stringify(body) });
}
export async function fetchEntries() {
  const data = await apiRequest(ENTRIES_PATH);
  return Array.isArray(data) ? data : (data.entries || data.rows || []);
}
export async function createEntry(body) {
  return apiRequest(ENTRIES_PATH, { method: "POST", body: JSON.stringify(body) });
}