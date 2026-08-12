const STORAGE_KEY = "ifg_products_unlocked";

export const PRODUCTS_CONTACT_EMAIL = "infinityfloralgrower@gmail.com";

export function getProductsPassword(): string {
  return (import.meta.env.VITE_PRODUCTS_PASSWORD as string | undefined)?.trim() || "";
}

export function isProductsUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(STORAGE_KEY) === "1";
}

export function unlockProducts(): void {
  sessionStorage.setItem(STORAGE_KEY, "1");
}

export function verifyProductsPassword(input: string): boolean {
  const expected = getProductsPassword();
  if (!expected) return false;
  return input.trim() === expected;
}
