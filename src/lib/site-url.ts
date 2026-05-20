/** Canonical site URL for auth email links (set VITE_SITE_URL in production). */
export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}

export function getAuthRedirectUrl(path = "/login"): string {
  const base = getSiteUrl();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
