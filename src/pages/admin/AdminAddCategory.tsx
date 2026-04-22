// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export default function AdminAddCategory() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { setError("Category name is required"); return; }
    setError("");

    // Check for duplicates
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .ilike("category_name", name.trim())
      .maybeSingle();

    if (existing) {
      setError("A category with this name already exists.");
      return;
    }

    setConfirmOpen(true);
  };

  const confirmAdd = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const { error: dbError } = await supabase
        .from("categories")
        .insert({ category_name: name.trim(), status });
      if (dbError) throw dbError;
      setSuccessOpen(true);
    } catch (err: any) {
      setError(err.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/categories")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-[46px] font-semibold text-foreground">Add Category</h1>
      </div>
      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="max-w-lg space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Category Name*</label>
            <Input placeholder="Enter Category Name" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} className={error ? "border-destructive" : ""} />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Status*</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background text-foreground">
              <option value="inactive">Inactive</option>
              <option value="active">Active</option>
            </select>
          </div>
          <Button className="btn-plum border-0 px-8" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Add Category"}</Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Add Category?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Add The Category</p>
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
          <p className="text-sm text-muted-foreground mb-6">Category Has Been Added Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/categories"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
