import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category { id: string; category_name: string; }
interface SubCategory { id: string; sub_category_name: string; category_id: string; }
interface CompProduct { id: string; product_name: string; }

export default function AdminAddProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [allProducts, setAllProducts] = useState<CompProduct[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [stockAvailability, setStockAvailability] = useState("in_stock");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [catRes, prodRes] = await Promise.all([
        supabase.from("categories").select("id, category_name").eq("status", "active"),
        supabase.from("products").select("id, product_name").order("product_name"),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (prodRes.data) setAllProducts(prodRes.data);
    };
    load();
  }, []);

  useEffect(() => {
    if (!categoryId) { setSubcategories([]); return; }
    supabase.from("subcategories").select("id, sub_category_name, category_id").eq("category_id", categoryId).eq("status", "active").then(({ data }) => {
      setSubcategories(data || []);
    });
  }, [categoryId]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (!description.trim()) errs.description = "Product description is required";
    if (!categoryId) errs.category = "Please select a category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => { if (validate()) setConfirmOpen(true); };

  const confirmAdd = async () => {
    setConfirmOpen(false);
    setSaving(true);
    const { data: prod, error } = await supabase.from("products").insert({
      product_name: name,
      description,
      category_id: categoryId || null,
      sub_category_id: subCategoryId || null,
      stock_status: stockAvailability,
      status,
      comparison_products: selectedComparisons,
    }).select().single();

    if (error || !prod) {
      toast.error("Failed to add product");
      setSaving(false);
      return;
    }

    // Upload images
    for (const file of imageFiles) {
      const filePath = `${prod.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(filePath, file);
      if (!upErr) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
        await supabase.from("product_images").insert({ product_id: prod.id, image_url: urlData.publicUrl });
      }
    }

    setSaving(false);
    setSuccessOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    Array.from(files).forEach(file => {
      if (imageFiles.length + newFiles.length < 5) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });
    setImageFiles(prev => [...prev, ...newFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (idx: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const filteredSubs = subcategories.filter(s => s.category_id === categoryId);

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/products")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Add Product</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Name*</label>
            <Input placeholder="Enter Product Name" value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Description*</label>
            <textarea placeholder="Enter Product Description" value={description} onChange={(e) => { setDescription(e.target.value); setErrors(p => ({ ...p, description: "" })); }} rows={4} className={`w-full border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none ${errors.description ? "border-destructive" : "border-border"}`} />
            {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category*</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId(""); setErrors(p => ({ ...p, category: "" })); }} className={`w-full border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.category ? "border-destructive" : "border-border"}`}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
          </div>

          {filteredSubs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Sub-Category</label>
              <select value={subCategoryId} onChange={(e) => setSubCategoryId(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Select Sub-Category</option>
                {filteredSubs.map(sc => <option key={sc.id} value={sc.id}>{sc.sub_category_name}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Stock Availability*</label>
            <select value={stockAvailability} onChange={(e) => setStockAvailability(e.target.value)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="in_stock">In-Stock</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="limited_stock">Limited Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status*</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Product Comparison</label>
            <div className="relative">
              <button type="button" onClick={() => setComparisonOpen(!comparisonOpen)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-ring">
                <span className={selectedComparisons.length === 0 ? "text-muted-foreground" : "text-foreground"}>
                  {selectedComparisons.length === 0 ? "Select" : `${selectedComparisons.length} selected`}
                </span>
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

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Upload Images*</label>
            {imagePreviews.length > 0 && (
              <div className="flex gap-3 mb-3 flex-wrap">
                {imagePreviews.map((img, idx) => (
                  <div key={idx} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-sm flex items-center justify-center text-destructive-foreground"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-border rounded-lg py-8 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6" /><span className="text-sm">Upload File up to 5 images</span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          </div>

          <Button className="btn-plum border-0 px-8" onClick={handleSubmit} disabled={saving}>
            {saving ? "Saving..." : "Add Product"}
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Product?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Add The Product</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={confirmAdd}>Yes</Button>
            <Button variant="outline" className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setConfirmOpen(false)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(145_50%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(145_60%_35%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Product Has Been Added Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/products"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
