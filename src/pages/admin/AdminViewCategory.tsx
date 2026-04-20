import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminViewCategory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<any>(null);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [productCount, setProductCount] = useState(0);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<"active" | "inactive">("active");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const [catRes, subRes, prodRes] = await Promise.all([
        supabase.from("categories").select("*").eq("id", id).maybeSingle(),
        supabase.from("subcategories").select("id, sub_category_name").eq("category_id", id),
        supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
      ]);
      if (catRes.data) { setCategory(catRes.data); setStatus(catRes.data.status as "active" | "inactive"); }
      if (subRes.data) setSubcategories(subRes.data);
      setProductCount(prodRes.count || 0);
      setLoading(false);
    };
    load();
  }, [id]);

  const handleStatusToggle = () => {
    setPendingStatus(status === "active" ? "inactive" : "active");
    setConfirmOpen(true);
  };

  const confirmToggle = async () => {
    const { error } = await supabase.from("categories").update({ status: pendingStatus }).eq("id", id!);
    if (error) toast.error("Failed to update status");
    else setStatus(pendingStatus);
    setConfirmOpen(false);
    setSuccessOpen(true);
  };

  if (loading) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Loading...</div></AdminLayout>;
  if (!category) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Category not found.</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/categories")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">View Category</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row gap-8 md:gap-20">
            <div><p className="text-sm text-muted-foreground mb-1">Category Name:</p><p className="font-semibold text-foreground">{category.category_name}</p></div>
            <div><p className="text-sm text-muted-foreground mb-1">Total Products:</p><p className="font-semibold text-foreground">{String(productCount).padStart(2, "0")}</p></div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Status:</span>
            <button onClick={handleStatusToggle} className="flex items-center gap-1 cursor-pointer">
              <span className={`text-sm font-semibold ${status === "active" ? "text-[hsl(145_60%_35%)]" : "text-destructive"}`}>{status === "active" ? "Active" : "Inactive"}</span>
              <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-1">Sub Categories:</p>
          {subcategories.length > 0 ? (
            <div className="flex gap-2 flex-wrap">{subcategories.map(s => <span key={s.id} className="px-3 py-1 bg-muted rounded-full text-xs font-medium text-foreground">{s.sub_category_name}</span>)}</div>
          ) : <p className="text-sm text-muted-foreground">No sub-categories</p>}
        </div>

        <Button className="btn-plum border-0 px-8" onClick={() => navigate(`/admin/categories/${id}/edit`)}>Edit Category</Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">{pendingStatus === "inactive" ? "Inactivate Category?" : "Activate Category?"}</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To {pendingStatus === "inactive" ? "Inactivate" : "Activate"} This Category?</p>
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
          <p className="text-sm text-muted-foreground mb-6">Category Has Been {pendingStatus === "active" ? "Activated" : "Inactivated"} Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => setSuccessOpen(false)}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
