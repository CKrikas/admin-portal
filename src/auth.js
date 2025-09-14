import Keycloak from "keycloak-js";

const VM = "20.90.162.52";
const KC_URL    = `http://${VM}:8080/auth`;
const KC_REALM  = "stratologia";
const KC_CLIENT = "admin-portal";
export const API_BASE = `http://${VM}:8000`;

export const keycloak = new Keycloak({ url: KC_URL, realm: KC_REALM, clientId: KC_CLIENT });

export const hasRole = (r) =>
  (keycloak?.tokenParsed?.realm_access?.roles || []).includes(r);

const REQUIRED_ROLE = "officer";

export async function initAuth() {
  const ok = await keycloak.init({
    onLoad: "login-required",
    pkceMethod: "plain",  
    checkLoginIframe: false,
    silentCheckSsoFallback: false,
    enableLogging: true,
  });
  if (ok && !hasRole(REQUIRED_ROLE)) {
    await keycloak.logout({ redirectUri: window.location.origin + "/?unauthorized=1" });
    throw new Error("Forbidden: missing role 'officer'");
  }
}

export const login  = () => keycloak.login();
export const logout = () => keycloak.logout();
export const token  = () => keycloak.token;

export async function authedFetch(url, opts = {}) {
  const t = token();
  const headers = { ...(opts.headers || {}) };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
