import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminAddSubCategory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase.from("categories").select("id, category_name").order("category_name");
        if (error) throw error;
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        toast.error("Failed to load categories.");
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const validate = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Sub category name is required";
    if (!categoryId) errs.category = "Please select a category";

    if (!errs.name && !errs.category) {
      // Check for duplicate subcategory under the same parent
      const { data: existing } = await supabase
        .from("subcategories")
        .select("id")
        .eq("category_id", categoryId)
        .ilike("sub_category_name", name.trim())
        .maybeSingle();

      if (existing) {
        errs.name = "This sub-category already exists under the selected category.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    const valid = await validate();
    if (valid) setConfirmOpen(true);
  };

  const confirmAdd = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const { error } = await supabase
        .from("subcategories")
        .insert({ sub_category_name: name.trim(), category_id: categoryId, status });
      if (error) throw error;
      setSuccessOpen(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to add sub category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/categories")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Add Sub Category</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Sub Category Name*</label>
            <Input placeholder="Enter Sub Category Name" value={name} onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }} className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category*</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setErrors(prev => ({ ...prev, category: "" })); }} className={`w-full border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.category ? "border-destructive" : "border-border"} ${!categoryId ? "text-muted-foreground" : ""}`}>
              <option value="" disabled>{loadingCats ? "Loading…" : "Select Category"}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
            </select>
            {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status*</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "inactive")} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="inactive">Inactive</option><option value="active">Active</option>
            </select>
          </div>
          <Button className="btn-plum border-0 px-8" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Add Sub Category"}</Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Sub Category?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Add Sub Category?</p>
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
          <p className="text-sm text-muted-foreground mb-6">Sub Category Has Been Added Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/categories"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
