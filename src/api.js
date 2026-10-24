// All API access lives here. Paths are fixed to the server's routes so that
// a wrong environment variable can never send a request to the wrong URL.
const BASE = (import.meta.env.VITE_API_BASE_URL || "https://klip-server.onrender.com").replace(
  /\/+$/,
  ""
);

const PATHS = {
  login: "/api/auth/login",
  register: "/api/auth/register",
  entries: "/api/entry",
};

const SESSION_KEY = "klip.session";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token && session?.user ? session : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable: the session just lasts until the tab closes */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* nothing to clear */
  }
}

async function request(path, { method = "GET", body, token, onSlow } = {}) {
  const controller = new AbortController();
  // Free hosting can take about a minute to wake up, so allow for it.
  const giveUp = setTimeout(() => controller.abort(), 75_000);
  const slow = onSlow ? setTimeout(onSlow, 4_000) : null;

  try {
    const res = await fetch(BASE + path, {
      method,
      signal: controller.signal,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      /* empty or non-JSON body */
    }

    if (!res.ok) {
      if (res.status === 429) {
        throw new ApiError("Too many attempts. Wait a few minutes, then try again.", 429);
      }
      throw new ApiError(data?.error || `Something went wrong (error ${res.status}).`, res.status);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      "Can't reach the server. Check your connection, or try again in a minute.",
      0
    );
  } finally {
    clearTimeout(giveUp);
    if (slow) clearTimeout(slow);
  }
}

export const login = (phone, password, onSlow) =>
  request(PATHS.login, { method: "POST", body: { phone, password }, onSlow });

export const register = (name, phone, password, onSlow) =>
  request(PATHS.register, { method: "POST", body: { name, phone, password }, onSlow });

export const listEntries = (token, onSlow) =>
  request(`${PATHS.entries}?limit=100`, { token, onSlow });

export const createEntry = (token, entry) =>
  request(PATHS.entries, { method: "POST", token, body: entry });

// action is "confirm", "dispute" or "settle".
export const transitionEntry = (token, id, action) =>
  request(`${PATHS.entries}/${encodeURIComponent(id)}/${action}`, { method: "POST", token });
