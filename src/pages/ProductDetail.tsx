import { useParams, useNavigate } from "react-router-dom";
import { ProductDetailLayout } from "@/components/products/ProductDetailLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER = "/placeholder.svg";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<{ name: string; description: string; stock: string; images: string[] } | null>(null);
  const [relatedItems, setRelatedItems] = useState<{ id: string; name: string; image: string; isNew?: boolean; detailPath: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const titleSearch = slug.replace(/-/g, " ");
        const { data: prod } = await supabase
          .from("products")
          .select("id, product_name, description, stock_status, category_id, created_at")
          .ilike("product_name", `%${titleSearch}%`)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        if (!prod) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const { data: images } = await supabase
          .from("product_images")
          .select("image_url")
          .eq("product_id", prod.id);
        const imgUrls = (images || []).map((i) => i.image_url);

        setProduct({
          name: prod.product_name,
          description: prod.description || "Premium quality product from Han Cloud Co. Ltd.",
          stock: prod.stock_status,
          images: imgUrls.length > 0 ? imgUrls : [PLACEHOLDER],
        });

        const { data: related } = await supabase
          .from("products")
          .select("id, product_name, created_at")
          .neq("id", prod.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(4);

        const relatedIds = (related || []).map((p) => p.id);
        let imageMap: Record<string, string> = {};
        if (relatedIds.length > 0) {
          const { data: relatedImgs } = await supabase
            .from("product_images")
            .select("product_id, image_url")
            .in("product_id", relatedIds);
          (relatedImgs || []).forEach((img) => {
            if (!imageMap[img.product_id]) imageMap[img.product_id] = img.image_url;
          });
        }

        setRelatedItems(
          (related || []).map((p) => ({
            id: p.id,
            name: p.product_name,
            image: imageMap[p.id] || PLACEHOLDER,
            isNew: isNew(p.created_at),
            detailPath: `/products/${p.product_name.toLowerCase().replace(/\s+/g, "-")}`,
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
          <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/products")} className="btn-plum rounded-sm text-sm">
            Back to Products
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
      color="Natural"
      images={product.images}
      relatedTitle="You May Also Like"
      relatedItems={relatedItems}
      backPath="/products"
    />
  );
};

function isNew(createdAt: string): boolean {
  const created = new Date(createdAt);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return created > thirtyDaysAgo;
}

export default ProductDetail;
