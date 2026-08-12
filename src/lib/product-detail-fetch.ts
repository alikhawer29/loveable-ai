import { supabase } from "@/integrations/supabase/client";
import { resolveGalleryImages } from "@/lib/product-design-variants";
import type { ProductDesignOption } from "@/components/products/ProductDetailLayout";

const PLACEHOLDER = "/placeholder.svg";

export interface ProductDetailData {
  name: string;
  description: string;
  stock: string;
  images: string[];
  fallbackImages: string[];
  designVariations: ProductDesignOption[];
  showDesignPicker: boolean;
}

export async function fetchActiveProductDetail(
  slug: string
): Promise<{ product: ProductDetailData; productId: string } | null> {
  const titleSearch = slug.replace(/-/g, " ");
  const { data: prod } = await supabase
    .from("products")
    .select("id, product_name, description, stock_status, has_design_variations")
    .ilike("product_name", `%${titleSearch}%`)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!prod) return null;

  const [{ data: images }, { data: variants }] = await Promise.all([
    supabase.from("product_images").select("image_url").eq("product_id", prod.id),
    prod.has_design_variations
      ? supabase
          .from("product_design_variants")
          .select("id, design_name, images, is_default, sort_order")
          .eq("product_id", prod.id)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] }),
  ]);

  const fallbackImages = (images || []).map((i) => i.image_url);
  const variantRows = (variants || []) as {
    id: string;
    design_name: string;
    images: string[];
    is_default: boolean;
  }[];

  const designVariations: ProductDesignOption[] = variantRows.map((v) => {
    const imgs = v.images || [];
    const thumb = imgs[0] || fallbackImages[0] || PLACEHOLDER;
    return {
      id: v.id,
      name: v.design_name,
      thumbnail: thumb,
      images: imgs,
      isDefault: v.is_default,
    };
  });

  const showDesignPicker = !!prod.has_design_variations && designVariations.length > 0;

  const defaultVariant =
    variantRows.find((v) => v.is_default) ?? variantRows[0];
  const initialImages =
    showDesignPicker && defaultVariant
      ? resolveGalleryImages(defaultVariant.images || [], fallbackImages, PLACEHOLDER)
      : resolveGalleryImages(fallbackImages, [], PLACEHOLDER);

  return {
    productId: prod.id,
    product: {
      name: prod.product_name,
      description: prod.description || "Premium quality product from Infinity Floral Grower.",
      stock: prod.stock_status,
      images: initialImages,
      fallbackImages,
      designVariations,
      showDesignPicker,
    },
  };
}
