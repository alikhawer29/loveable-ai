import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getColorDisplayLabel } from "@/lib/product-color-variants";

export default function AdminViewProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [colorVariants, setColorVariants] = useState<{ color_hex: string; color_label: string | null; images: string[]; is_default: boolean }[]>([]);
  const [compNames, setCompNames] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error } = await supabase.from("products")
        .select("*, categories(category_name), subcategories(sub_category_name)")
        .eq("id", id).maybeSingle();
      if (error || !data) { toast.error("Product not found"); setLoading(false); return; }
      setProduct(data);
      setStatus(data.status as "active" | "inactive");

      const [{ data: imgs }, { data: variants }] = await Promise.all([
        supabase.from("product_images").select("image_url").eq("product_id", id),
        data.has_color_variations
          ? supabase.from("product_color_variants").select("color_hex, color_label, images, is_default").eq("product_id", id)
          : Promise.resolve({ data: [] }),
      ]);
      setImages((imgs || []).map((i: any) => i.image_url));
      setColorVariants((variants || []) as typeof colorVariants);

      if (data.comparison_products?.length) {
        const { data: comps } = await supabase.from("products").select("product_name").in("id", data.comparison_products);
        setCompNames((comps || []).map((c: any) => c.product_name));
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleStatusToggle = () => {
    const newStatus = status === "active" ? "inactive" : "active";
    setPendingStatus(newStatus);
    setConfirmOpen(true);
  };

  const confirmToggle = async () => {
    const { error } = await supabase.from("products").update({ status: pendingStatus }).eq("id", id!);
    if (error) { toast.error("Failed to update status"); }
    else { setStatus(pendingStatus); }
    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  if (loading) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Loading...</div></AdminLayout>;
  if (!product) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Product not found.</div></AdminLayout>;

  const stockLabel = product.stock_status === "in_stock" ? "In-Stock" : product.stock_status === "out_of_stock" ? "Out of Stock" : "Limited Stock";

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-[46px] font-semibold text-foreground">View Product Details</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-3">
            {images.length > 0 ? images.map((img, idx) => (
              <div key={idx} className="h-32 w-36 rounded-lg overflow-hidden border border-border">
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
            )) : <p className="text-muted-foreground text-sm">No images uploaded</p>}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <button onClick={handleStatusToggle} className="flex items-center gap-1 cursor-pointer">
              <span className={`text-sm font-semibold ${status === "active" ? "text-[hsl(145_60%_35%)]" : "text-destructive"}`}>
                {status === "active" ? "Active" : "Inactive"}
              </span>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-4 mb-6">
          <div><p className="text-sm text-muted-foreground mb-1">Product Name:</p><p className="font-semibold text-foreground">{product.product_name}</p></div>
          <div><p className="text-sm text-muted-foreground mb-1">Stock Availability:</p><p className="font-semibold text-[hsl(145_60%_35%)]">{stockLabel}</p></div>
          <div><p className="text-sm text-muted-foreground mb-1">Category:</p><p className="font-semibold text-foreground">{product.categories?.category_name || "—"}</p></div>
          <div><p className="text-sm text-muted-foreground mb-1">Sub-Category:</p><p className="font-semibold text-foreground">{product.subcategories?.sub_category_name || "—"}</p></div>
        </div>

        {compNames.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Product Comparison:</p>
            <div className="flex gap-2 flex-wrap">
              {compNames.map((comp, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-medium">{comp}</span>
              ))}
            </div>
          </div>
        )}

        {product.has_color_variations && colorVariants.length > 0 && (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-3">Color Variations:</p>
            <div className="space-y-4">
              {colorVariants.map((v) => (
                <div key={v.color_hex} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ backgroundColor: v.color_hex }}
                    />
                    <span className="text-sm font-semibold text-foreground">
                      {getColorDisplayLabel(v.color_hex, v.color_label)}
                      {v.is_default && (
                        <span className="ml-2 text-xs text-muted-foreground font-normal">(Default)</span>
                      )}
                    </span>
                  </div>
                  {v.images?.length > 0 ? (
                    <div className="flex gap-2 flex-wrap">
                      {v.images.map((url, i) => (
                        <div key={i} className="h-20 w-20 rounded overflow-hidden border border-border">
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Uses fallback product images</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8"><p className="text-sm text-muted-foreground mb-1">Product Description:</p><p className="text-sm text-foreground leading-relaxed">{product.description || "—"}</p></div>
        <Button className="btn-plum border-0 px-8" onClick={() => navigate(`/admin/products/${id}/edit`)}>Edit Product</Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">{pendingStatus === "inactive" ? "Inactivate Product?" : "Activate Product?"}</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To {pendingStatus === "inactive" ? "Inactivate" : "Activate"} This Product?</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={confirmToggle}>Yes</Button>
            <Button variant="outline" className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setConfirmOpen(false)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(145_50%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(145_60%_35%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Product Has Been {pendingStatus === "active" ? "Activated" : "Inactivated"} Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => setSuccessOpen(false)}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
