import axios from "axios";

const TOKEN_KEY = "company_ui_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
});

// Send the JWT with every request
client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// The backend answers 401 when the token is missing, expired, or the account was disabled.
// (403 means "logged in but not allowed", which we leave to the page to show.)
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
  unauthorizedHandler = fn;
};

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && tokenStore.get() && unauthorizedHandler) {
      unauthorizedHandler();
    }
    return Promise.reject(err);
  }
);

// Turns any axios/FastAPI error into a readable message
export function errorMessage(err) {
  if (!err.response) return "Cannot reach the API. Is the backend running?";
  if (err.response.status === 404) {
    const { method, baseURL, url } = err.config || {};
    const where = `${(method || "").toUpperCase()} ${baseURL || ""}${url || ""}`.trim();
    const detail404 = err.response.data?.detail;
    return `Endpoint not found (404): ${where}. ${
      typeof detail404 === "string" && detail404 !== "Not Found" ? detail404 : "Check the route path in src/api."
    }`;
  }
  const detail = err.response.data?.detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d) => `${(d.loc || []).slice(1).join(".")}: ${d.msg}`)
      .join("; ");
  }
  if (typeof detail === "string") return detail;
  return err.message || "Something went wrong";
}

export default client;
