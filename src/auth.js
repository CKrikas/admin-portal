import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: "http://localhost:8080/auth",  
  realm: "stratologia",
  clientId: "admin-portal",
});

export async function initAuth() {
  await keycloak.init({
    onLoad: "check-sso",     // show app, don’t force login
    pkceMethod: "S256",
    checkLoginIframe: false, // avoid iframe pings
    silentCheckSsoFallback: false, // don't try silent flow
    enableLogging: true,
  });
}

export const login   = () => keycloak.login();
export const logout  = () => keycloak.logout();
export const token   = () => keycloak.token;
export const hasRole = (r) => (keycloak?.tokenParsed?.realm_access?.roles || []).includes(r);

export async function authedFetch(url, opts = {}) {
  const t = token();
  const headers = { ...(opts.headers || {}) };
  if (t) headers.Authorization = `Bearer ${t}`;
  const res = await fetch(url, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}
