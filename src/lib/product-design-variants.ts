import { supabase } from "@/integrations/supabase/client";

export interface DesignVariantFormState {
  id?: string;
  designName: string;
  imageUrls: string[];
  pendingFiles: File[];
  pendingPreviews: string[];
  stock: string;
  isDefault: boolean;
}

export interface ProductDesignVariantRow {
  id: string;
  product_id: string;
  design_name: string;
  images: string[];
  stock: number | null;
  is_default: boolean;
  sort_order: number;
}

export function createEmptyDesignVariant(): DesignVariantFormState {
  return {
    designName: "",
    imageUrls: [],
    pendingFiles: [],
    pendingPreviews: [],
    stock: "",
    isDefault: false,
  };
}

export function variantStatesFromRows(rows: ProductDesignVariantRow[]): DesignVariantFormState[] {
  const sorted = [...rows].sort((a, b) => a.sort_order - b.sort_order);
  return sorted.map((row) => ({
    id: row.id,
    designName: row.design_name,
    imageUrls: row.images || [],
    pendingFiles: [],
    pendingPreviews: [],
    stock: row.stock != null ? String(row.stock) : "",
    isDefault: row.is_default,
  }));
}

function designStorageSlug(name: string, id?: string): string {
  const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "design";
  return id ? `${id.slice(0, 8)}-${base}` : base;
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
  files: File[],
  subPath?: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const url = await uploadProductImage(productId, file, subPath);
    if (url) urls.push(url);
  }
  return urls;
}

export async function insertProductImageRows(productId: string, urls: string[]) {
  for (const image_url of urls) {
    await supabase.from("product_images").insert({ product_id: productId, image_url });
  }
}

export function validateDesignVariants(
  hasDesignVariations: boolean,
  variants: DesignVariantFormState[]
): string | null {
  if (!hasDesignVariations) return null;
  if (variants.length === 0) return "Add at least one pod design for this product.";
  for (let i = 0; i < variants.length; i++) {
    if (!variants[i].designName.trim()) {
      return `Design #${i + 1} needs a name.`;
    }
    const imageCount = variants[i].imageUrls.length + variants[i].pendingFiles.length;
    if (imageCount === 0) {
      return `"${variants[i].designName.trim() || `Design #${i + 1}`}" needs at least one image.`;
    }
  }
  const defaults = variants.filter((v) => v.isDefault);
  if (defaults.length !== 1) return "Mark exactly one design as default.";
  return null;
}

export async function saveProductDesignVariants(
  productId: string,
  hasDesignVariations: boolean,
  variants: DesignVariantFormState[]
) {
  await supabase
    .from("products")
    .update({ has_design_variations: hasDesignVariations })
    .eq("id", productId);

  if (!hasDesignVariations) {
    await supabase.from("product_design_variants").delete().eq("product_id", productId);
    return;
  }

  const keptIds: string[] = [];

  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const subPath = `designs/${designStorageSlug(v.designName, v.id)}`;
    const newUrls = await uploadProductImages(productId, v.pendingFiles, subPath);
    const images = [...v.imageUrls, ...newUrls];
    const stock = v.stock.trim() ? parseInt(v.stock, 10) : null;

    const payload = {
      product_id: productId,
      design_name: v.designName.trim(),
      images,
      stock: Number.isFinite(stock) ? stock : null,
      is_default: v.isDefault,
      sort_order: i,
    };

    if (v.id) {
      await supabase.from("product_design_variants").update(payload).eq("id", v.id);
      keptIds.push(v.id);
    } else {
      const { data: inserted } = await supabase
        .from("product_design_variants")
        .insert(payload)
        .select("id")
        .single();
      if (inserted?.id) keptIds.push(inserted.id);
    }
  }

  const { data: allRows } = await supabase
    .from("product_design_variants")
    .select("id")
    .eq("product_id", productId);

  const toDelete = (allRows || []).filter((r) => !keptIds.includes(r.id));
  for (const row of toDelete) {
    await supabase.from("product_design_variants").delete().eq("id", row.id);
  }
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
