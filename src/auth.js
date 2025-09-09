import Keycloak from "keycloak-js";

const KC_URL    = "https://auth-ckrikas.duckdns.org/auth";
const KC_REALM  = "stratologia";
const KC_CLIENT = "admin-portal";
export const API_BASE  = "https://api-ckrikas.duckdns.org";

export const keycloak = new Keycloak({
  url: KC_URL,
  realm: KC_REALM,
  clientId: KC_CLIENT,
});

export const hasRole = (r) =>
  (keycloak?.tokenParsed?.realm_access?.roles || []).includes(r);

const REQUIRED_ROLE = "officer";

export async function initAuth() {
  const ok = await keycloak.init({
    onLoad: "login-required",  // force login when entering the portal
    pkceMethod: "S256",
    checkLoginIframe: false,
    silentCheckSsoFallback: false,
    enableLogging: true,
  });

  if (ok && !hasRole(REQUIRED_ROLE)) {
    // Log them out immediately if they’re not an officer
    await keycloak.logout({ redirectUri: window.location.origin + "/?unauthorized=1" });
    throw new Error("Forbidden: missing role 'officer'");
  }
}

export const login   = () => keycloak.login();
export const logout  = () => keycloak.logout();
export const token   = () => keycloak.token;

export async function authedFetch(url, opts = {}) {
  const t = token();
  const headers = { ...(opts.headers || {}) };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
