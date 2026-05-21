import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_COLOR_OPTIONS = [
  { hex: "#89512a", defaultLabel: "Brown" },
  { hex: "#ffffff", defaultLabel: "White" },
  { hex: "#ede8d0", defaultLabel: "Cream" },
  { hex: "#fb13d2", defaultLabel: "Pink" },
] as const;

export type ProductColorHex = (typeof PRODUCT_COLOR_OPTIONS)[number]["hex"];

export interface ColorVariantFormState {
  colorHex: ProductColorHex;
  selected: boolean;
  colorLabel: string;
  imageUrls: string[];
  pendingFiles: File[];
  pendingPreviews: string[];
  stock: string;
  isDefault: boolean;
}

export interface ProductColorVariantRow {
  id: string;
  product_id: string;
  color_hex: string;
  color_label: string | null;
  images: string[];
  stock: number | null;
  is_default: boolean;
}

export function createEmptyVariantStates(): ColorVariantFormState[] {
  return PRODUCT_COLOR_OPTIONS.map((c) => ({
    colorHex: c.hex,
    selected: false,
    colorLabel: c.defaultLabel,
    imageUrls: [],
    pendingFiles: [],
    pendingPreviews: [],
    stock: "",
    isDefault: false,
  }));
}

export function variantStatesFromRows(rows: ProductColorVariantRow[]): ColorVariantFormState[] {
  const base = createEmptyVariantStates();
  for (const row of rows) {
    const idx = base.findIndex((v) => v.colorHex === row.color_hex);
    if (idx === -1) continue;
    base[idx] = {
      colorHex: row.color_hex as ProductColorHex,
      selected: true,
      colorLabel: row.color_label || PRODUCT_COLOR_OPTIONS[idx].defaultLabel,
      imageUrls: row.images || [],
      pendingFiles: [],
      pendingPreviews: [],
      stock: row.stock != null ? String(row.stock) : "",
      isDefault: row.is_default,
    };
  }
  return base;
}

export function getColorDisplayLabel(hex: string, label?: string | null): string {
  if (label?.trim()) return label.trim();
  const found = PRODUCT_COLOR_OPTIONS.find((c) => c.hex === hex);
  return found?.defaultLabel ?? hex;
}

export async function uploadProductImage(
  productId: string,
  file: File,
  subPath?: string
): Promise<string | null> {
  const prefix = subPath ? `${productId}/${subPath}` : productId;
  const filePath = `${prefix}/${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from("product-images").upload(filePath, file);
  if (error) return null;
  const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
  return data.publicUrl;
}

export async function uploadProductImages(
  productId: string,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadProductImage(productId, file);
    if (url) urls.push(url);
  }
  return urls;
}

export async function insertProductImageRows(productId: string, urls: string[]) {
  for (const image_url of urls) {
    await supabase.from("product_images").insert({ product_id: productId, image_url });
  }
}

export function validateColorVariants(
  hasColorVariations: boolean,
  variants: ColorVariantFormState[]
): string | null {
  if (!hasColorVariations) return null;
  const selected = variants.filter((v) => v.selected);
  if (selected.length === 0) return "Select at least one color for this product.";
  const defaults = selected.filter((v) => v.isDefault);
  if (defaults.length !== 1) return "Mark exactly one selected color as default.";
  return null;
}

export async function saveProductColorVariants(
  productId: string,
  hasColorVariations: boolean,
  variants: ColorVariantFormState[]
) {
  await supabase.from("products").update({ has_color_variations: hasColorVariations }).eq("id", productId);

  if (!hasColorVariations) {
    await supabase.from("product_color_variants").delete().eq("product_id", productId);
    return;
  }

  const selected = variants.filter((v) => v.selected);

  for (const v of selected) {
    const newUrls = await uploadProductImages(
      productId,
      v.pendingFiles,
      `colors/${v.colorHex.replace("#", "")}`
    );
    const images = [...v.imageUrls, ...newUrls];
    const stock = v.stock.trim() ? parseInt(v.stock, 10) : null;

    const { data: existing } = await supabase
      .from("product_color_variants")
      .select("id")
      .eq("product_id", productId)
      .eq("color_hex", v.colorHex)
      .maybeSingle();

    const payload = {
      product_id: productId,
      color_hex: v.colorHex,
      color_label: v.colorLabel.trim() || null,
      images,
      stock: Number.isFinite(stock) ? stock : null,
      is_default: v.isDefault,
    };

    if (existing?.id) {
      await supabase.from("product_color_variants").update(payload).eq("id", existing.id);
    } else {
      await supabase.from("product_color_variants").insert(payload);
    }
  }

  const selectedHexes = selected.map((v) => v.colorHex);
  const { data: allRows } = await supabase
    .from("product_color_variants")
    .select("id, color_hex")
    .eq("product_id", productId);

  const toDelete = (allRows || []).filter((r) => !selectedHexes.includes(r.color_hex as ProductColorHex));
  for (const row of toDelete) {
    await supabase.from("product_color_variants").delete().eq("id", row.id);
  }
}

export interface StorefrontColorVariant {
  hex: string;
  label: string;
  images: string[];
  isDefault: boolean;
}

export function resolveGalleryImages(
  variantImages: string[],
  fallbackImages: string[],
  placeholder = "/placeholder.svg"
): string[] {
  if (variantImages.length > 0) return variantImages;
  if (fallbackImages.length > 0) return fallbackImages;
  return [placeholder];
}
