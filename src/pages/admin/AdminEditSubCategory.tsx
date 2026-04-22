import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminEditSubCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [categories, setCategories] = useState<{ id: string; category_name: string }[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [catRes, subRes] = await Promise.all([
        supabase.from("categories").select("id, category_name").order("category_name"),
        supabase.from("subcategories").select("*").eq("id", id!).maybeSingle(),
      ]);
      if (catRes.data) setCategories(catRes.data);
      if (subRes.data) {
        setName(subRes.data.sub_category_name);
        setCategoryId(subRes.data.category_id);
        setStatus(subRes.data.status as "active" | "inactive");
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Sub category name is required";
    if (!categoryId) errs.category = "Please select a category";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from("subcategories").update({ sub_category_name: name, category_id: categoryId, status }).eq("id", id!);
    setSaving(false);
    if (error) { toast.error("Failed to update sub category"); return; }
    setSuccessOpen(true);
  };

  if (loading) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Loading...</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-[46px] font-semibold text-foreground">Edit Sub Category</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Sub Category Name*</label>
            <Input value={name} onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: "" })); }} className={errors.name ? "border-destructive" : ""} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category*</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setErrors(prev => ({ ...prev, category: "" })); }} className={`w-full border rounded-md px-3 py-2.5 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring ${errors.category ? "border-destructive" : "border-border"}`}>
              <option value="" disabled>Select Category</option>
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
          <Button className="btn-plum border-0 px-8" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Edit Sub Category"}</Button>
        </div>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(145_50%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(145_60%_35%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Sub Category Has Been Updated Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/categories"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
