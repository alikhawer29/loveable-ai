import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [confirmDialog, setConfirmDialog] = useState<"activate" | "inactivate" | null>(null);
  const [successDialog, setSuccessDialog] = useState<"activated" | "inactivated" | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("profiles").select("*").eq("user_id", id).maybeSingle().then(({ data }) => {
      if (data) { setProfile(data); setStatus(data.status as "active" | "inactive"); }
      setLoading(false);
    });
  }, [id]);

  if (loading) return <AdminLayout><div className="text-center py-20 text-muted-foreground">Loading...</div></AdminLayout>;
  if (!profile) return <AdminLayout><div className="text-center py-20 text-muted-foreground">User not found.</div></AdminLayout>;

  const handleStatusChange = (newStatus: "active" | "inactive") => {
    if (newStatus === status) return;
    setConfirmDialog(newStatus === "active" ? "activate" : "inactivate");
  };

  const confirmChange = async () => {
    const newStatus = confirmDialog === "activate" ? "active" : "inactive";
    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("user_id", id!);
    if (error) { toast.error("Failed to update status"); setConfirmDialog(null); return; }
    setStatus(newStatus);
    setConfirmDialog(null);
    setSuccessDialog(confirmDialog === "activate" ? "activated" : "inactivated");
  };

  // Split full_name into first/last
  const nameParts = (profile.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/users")} className="text-foreground hover:text-primary transition-colors"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">User Details</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-6 md:p-10">
        <div className="flex justify-end mb-4">
          <Popover>
            <PopoverTrigger>
              <span className="flex items-center gap-1.5 text-sm cursor-pointer">
                <span className="text-foreground font-medium">Status:</span>
                <span className={status === "active" ? "text-[hsl(145_60%_35%)] font-semibold" : "text-destructive font-semibold"}>{status === "active" ? "Active" : "Inactive"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-32 p-1">
              <button onClick={() => handleStatusChange("active")} className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${status === "active" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Active</button>
              <button onClick={() => handleStatusChange("inactive")} className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${status === "inactive" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>Inactive</button>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mb-8">
          <div className="h-32 w-32 rounded-full bg-muted overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">{firstName.charAt(0)}{lastName.charAt(0)}</div>
            )}
          </div>
        </div>

        <div className="space-y-5 max-w-lg">
          <div className="flex gap-4"><span className="text-sm font-bold text-foreground w-36 shrink-0">First Name:</span><span className="text-sm text-muted-foreground">{firstName}</span></div>
          <div className="flex gap-4"><span className="text-sm font-bold text-foreground w-36 shrink-0">Last Name:</span><span className="text-sm text-muted-foreground">{lastName}</span></div>
          <div className="flex gap-4"><span className="text-sm font-bold text-foreground w-36 shrink-0">Email Address:</span><span className="text-sm text-muted-foreground">{profile.email}</span></div>
          <div className="flex gap-4"><span className="text-sm font-bold text-foreground w-36 shrink-0">Phone no:</span><span className="text-sm text-muted-foreground">{profile.phone || "—"}</span></div>
        </div>
      </div>

      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">{confirmDialog === "activate" ? "Activate" : "Inactivate"}</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To {confirmDialog === "activate" ? "Activate" : "Inactivate"} This {profile.full_name} User?</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={confirmChange}>Yes</Button>
            <Button variant="outline" className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setConfirmDialog(null)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!successDialog} onOpenChange={() => setSuccessDialog(null)}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(145_50%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(145_60%_35%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">{profile.full_name} User {successDialog === "activated" ? "Activated" : "Inactivated"} Successfully</p>
          <Button className="btn-plum border-0 px-10" onClick={() => setSuccessDialog(null)}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
