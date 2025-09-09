import Keycloak from "keycloak-js";

const KC_URL    = "https://auth-ckrikas.duckdns.org/auth";
const KC_REALM  = "stratologia";
const KC_CLIENT = "admin-portal";
export const API_BASE = "https://api-ckrikas.duckdns.org";

export const keycloak = new Keycloak({
  url: KC_URL,
  realm: KC_REALM,
  clientId: KC_CLIENT,
});

export function hasRole(role) {
  const t = keycloak?.tokenParsed || {};
  const realmRoles = t.realm_access?.roles || [];
  const clientRoles = t.resource_access?.[KC_CLIENT]?.roles || [];
  return realmRoles.includes(role) || clientRoles.includes(role);
}

const REQUIRED_ROLE = "officer";

export async function initAuth() {
  const ok = await keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
    silentCheckSsoFallback: false,
    enableLogging: true,
  });

  // optional: auto-refresh
  keycloak.onTokenExpired = () => {
    keycloak.updateToken(30).catch(() => keycloak.login());
  };

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
