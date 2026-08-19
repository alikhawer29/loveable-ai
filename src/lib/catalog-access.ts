const STORAGE_KEY = "infinityfloral_catalog_access";

export function getCatalogPassword(): string {
  return (import.meta.env.VITE_CATALOG_PASSWORD as string | undefined)?.trim() || "";
}

export function hasCatalogAccess(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "granted";
}

export function grantCatalogAccess(): void {
  window.localStorage.setItem(STORAGE_KEY, "granted");
}

export function verifyCatalogPassword(input: string): boolean {
  const expected = getCatalogPassword();
  if (!expected) return false;
  return input.trim() === expected;
}
