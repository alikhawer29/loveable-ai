import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ProductDetailLayout } from "@/components/products/ProductDetailLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchActiveProductDetail, type ProductDetailData } from "@/lib/product-detail-fetch";

const PLACEHOLDER = "/placeholder.svg";

const ProductDetailContent = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isCatalog = location.pathname.startsWith("/catalog");
  const basePath = isCatalog ? "/catalog" : "/products";
  const backLabel = isCatalog ? "Back to Catalog" : "Back to Products";
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [relatedItems, setRelatedItems] = useState<{ id: string; name: string; image: string; isNew?: boolean; detailPath: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const result = await fetchActiveProductDetail(slug);
        if (!result) {
          setProduct(null);
          setLoading(false);
          return;
        }

        setProduct(result.product);

        const { data: related } = await supabase
          .from("products")
          .select("id, product_name, created_at")
          .neq("id", result.productId)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4);

        const relatedIds = (related || []).map((p) => p.id);
        let imageMap: Record<string, string> = {};
        if (relatedIds.length > 0) {
          const { data: imgs } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", relatedIds);
          (imgs || []).forEach((img) => {
            if (!imageMap[img.product_id]) imageMap[img.product_id] = img.image_url;
          });
        }

        setRelatedItems(
          (related || []).map((p) => ({
            id: p.id,
            name: p.product_name,
            image: imageMap[p.id] || PLACEHOLDER,
            isNew: isNew(p.created_at),
            detailPath: `${basePath}/${p.product_name.toLowerCase().replace(/\s+/g, "-")}`,
          }))
        );
      } catch (err) {
        console.error("Failed to fetch product detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-10 max-w-6xl">
          <Skeleton className="h-6 w-16 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <h1 className="font-display text-[46px] text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">The product you&apos;re looking for doesn&apos;t exist.</p>
          <button onClick={() => navigate(basePath)} className="btn-plum rounded-sm text-sm">
            {backLabel}
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProductDetailLayout
      name={product.name}
      description={product.description}
      additionalDescription=""
      stock={product.stock === "in_stock" ? 500 : 0}
      images={product.images}
      fallbackImages={product.fallbackImages}
      designVariations={product.designVariations}
      showDesignPicker={product.showDesignPicker}
      relatedTitle="You May Also Like"
      relatedItems={relatedItems}
      backPath={basePath}
    />
  );
};

const ProductDetail = () => <ProductDetailContent />;

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}

export default ProductDetail;
