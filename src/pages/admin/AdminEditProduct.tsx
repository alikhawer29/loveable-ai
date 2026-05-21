import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, CheckCircle2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductColorVariationsSection } from "@/components/admin/ProductColorVariationsSection";
import {
  createEmptyVariantStates,
  variantStatesFromRows,
  validateColorVariants,
  saveProductColorVariants,
  uploadProductImages,
  insertProductImageRows,
  type ColorVariantFormState,
  type ProductColorVariantRow,
} from "@/lib/product-color-variants";

interface Category { id: string; category_name: string; }
interface SubCategory { id: string; sub_category_name: string; category_id: string; }

export default function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [allProducts, setAllProducts] = useState<{ id: string; product_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [stockAvailability, setStockAvailability] = useState("in_stock");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [hasColorVariations, setHasColorVariations] = useState(false);
  const [colorVariants, setColorVariants] = useState<ColorVariantFormState[]>(createEmptyVariantStates);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [catRes, prodRes, productRes, imgRes, variantRes] = await Promise.all([
        supabase.from("categories").select("id, category_name"),
        supabase.from("products").select("id, product_name").order("product_name"),
        supabase.from("products").select("*, categories(category_name), subcategories(sub_category_name)").eq("id", id!).maybeSingle(),
        supabase.from("product_images").select("id, image_url").eq("product_id", id!),
        supabase.from("product_color_variants").select("*").eq("product_id", id!),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setAllProducts(prodRes.data.filter(p => p.id !== id));
      if (imgRes.data) setExistingImages(imgRes.data);
      if (productRes.data) {
        const p = productRes.data;
        setName(p.product_name);
        setDescription(p.description || "");
        setCategoryId(p.category_id || "");
        setSubCategoryId(p.sub_category_id || "");
        setStockAvailability(p.stock_status);
        setStatus(p.status as "active" | "inactive");
        setSelectedComparisons(p.comparison_products || []);
        setHasColorVariations(!!p.has_color_variations);
        if (variantRes.data?.length) {
          setColorVariants(variantStatesFromRows(variantRes.data as ProductColorVariantRow[]));
        }
      }
      setLoading(false);
    };
    load();
  }, [id]);

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); return; }
    supabase.from("subcategories").select("id, sub_category_name, category_id").eq("category_id", categoryId).then(({ data }) => setSubcategories(data || []));
  }, [categoryId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (!description.trim()) errs.description = "Product description is required";
    const colorErr = validateColorVariants(hasColorVariations, colorVariants);
    if (colorErr) errs.colorVariations = colorErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from("products").update({
      product_name: name, description, category_id: categoryId || null, sub_category_id: subCategoryId || null,
      stock_status: stockAvailability, status, comparison_products: selectedComparisons,
      has_color_variations: hasColorVariations,
    }).eq("id", id!);

    if (error) { toast.error("Failed to update product"); setSaving(false); return; }

    if (newFiles.length > 0) {
      const urls = await uploadProductImages(id!, newFiles);
      await insertProductImageRows(id!, urls);
    }
    await saveProductColorVariants(id!, hasColorVariations, colorVariants);
    setSaving(false);
    setSuccessOpen(true);
  };

  const removeExistingImage = async (imgId: string) => {
    await supabase.from("product_images").delete().eq("id", imgId);
    setExistingImages(prev => prev.filter(i => i.id !== imgId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const totalImages = existingImages.length + newFiles.length;
    const added: File[] = []; const previews: string[] = [];
    Array.from(files).forEach(f => { if (totalImages + added.length < 5) { added.push(f); previews.push(URL.createObjectURL(f)); } });
    setNewFiles(prev => [...prev, ...added]);
    setNewPreviews(prev => [...prev, ...previews]);
  };

  if (loading) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-[46px] font-semibold text-foreground">Edit Product</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Name*</label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Description*</label>
            <textarea value={description} onChange={(e) => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }} rows={4} className={`w-full border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.description ? "border-destructive" : "border-border"}`} />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); }} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Sub-Category</label>
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select Sub-Category</option>
                {subcategories.map(sc => <option key={sc.id} value={sc.id}>{sc.sub_category_name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Stock Availability*</label>
            <select value={stockAvailability} onChange={(e) => setStockAvailability(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="in_stock">In-Stock</option><option value="out_of_stock">Out of Stock</option><option value="limited_stock">Limited Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status*</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="inactive">Inactive</option><option value="active">Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Comparison</label>
            <div className="relative">
              <button type="button" onClick={() => setComparisonOpen(!comparisonOpen)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring">
                <span className={selectedComparisons.length === 0 ? "text-muted-foreground" : "text-foreground"}>{selectedComparisons.length === 0 ? "Select" : `${selectedComparisons.length} selected`}</span>
                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
              {comparisonOpen && (
                <div className="absolute z-10 mt-1 w-full bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {allProducts.map(cp => (
                    <label key={cp.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors">
                      <span className="flex-1 text-sm text-muted-foreground">{cp.product_name}</span>
                      <input type="checkbox" checked={selectedComparisons.includes(cp.id)} onChange={() => setSelectedComparisons(prev => prev.includes(cp.id) ? prev.filter(c => c !== cp.id) : [...prev, cp.id])} className="h-4 w-4 accent-primary rounded" />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <ProductColorVariationsSection
            hasColorVariations={hasColorVariations}
            onHasColorVariationsChange={setHasColorVariations}
            variants={colorVariants}
            onVariantsChange={setColorVariants}
            error={errors.colorVariations}
          />

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {hasColorVariations ? "Default product images (fallback)" : "Images"}
            </label>
            {hasColorVariations && (
              <p className="text-xs text-muted-foreground mb-2">
                Shown when a color has no images uploaded.
              </p>
            )}
            <div className="flex gap-3 mb-3 flex-wrap">
              {existingImages.map((img) => (
                <div key={img.id} className="relative h-28 w-28 rounded-lg overflow-hidden border border-border">
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {newPreviews.map((img, idx) => (
                <div key={`new-${idx}`} className="relative h-28 w-28 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button onClick={() => { setNewFiles(p => p.filter((_, i) => i !== idx)); setNewPreviews(p => p.filter((_, i) => i !== idx)); }} className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-muted-foreground text-sm hover:text-foreground transition-colors">
              <Upload className="h-4 w-4" /><span>Upload File up to 5 images</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <Button className="btn-plum border-0 px-8" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Update"}</Button>
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(145_50%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(145_60%_35%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Product Has Been Updated Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/products"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
