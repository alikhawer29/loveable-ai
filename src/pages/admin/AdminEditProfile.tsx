import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, User as UserIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminEditProfile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userId, setUserId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        setUserId(session.user.id);
        setEmail(session.user.email || "");

        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (data) {
          setName(data.full_name || "");
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: name.trim() })
        .eq("user_id", userId);
      if (error) throw error;

      await supabase.auth.updateUser({ data: { full_name: name.trim() } });
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    toast.info("Uploading avatar…");
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: newUrl })
        .eq("user_id", userId);
      if (dbError) throw dbError;

      setAvatarUrl(newUrl);
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header with back arrow */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/profile")} className="text-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Edit Profile</h1>
      </div>

      <div className="bg-card rounded-lg border border-border p-8 max-w-3xl">
        {/* Avatar with camera icon */}
        <div className="mb-8 relative inline-block">
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="h-32 w-32 rounded-full object-cover" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md hover:bg-primary/90 transition-colors"
          >
            <Camera className="h-4 w-4" />
          </button>
        </div>

        {/* Name input */}
        <div className="mb-6 max-w-md">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name" />
        </div>

        {/* Email (read-only) */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm font-semibold text-foreground w-40">Email Address:</span>
          <span className="text-sm text-muted-foreground">{email}</span>
        </div>

        {/* Update button */}
        <Button className="btn-plum border-0 px-10 py-3" onClick={handleUpdate} disabled={saving}>
          {saving ? "Updating…" : "Update"}
        </Button>
      </div>

      {/* Success popup */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[hsl(145_60%_90%)] flex items-center justify-center">
              <svg className="h-8 w-8 text-[hsl(145_60%_40%)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Your Profile Has Been Updated Successfully.</p>
          <Button
            className="btn-plum border-0 px-10 py-3 w-full max-w-[200px] mx-auto"
            onClick={() => { setShowSuccess(false); navigate("/admin/profile"); }}
          >
            Okay
          </Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
