import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User as UserIcon } from "lucide-react";

export default function AdminProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ full_name: string; email: string; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data } = await supabase
          .from("profiles")
          .select("full_name, email, avatar_url")
          .eq("user_id", session.user.id)
          .maybeSingle();

        setProfile(data || { full_name: session.user.email || "", email: session.user.email || "", avatar_url: null });
      } catch (err) {
        console.error("Failed to load admin profile:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="My Profile">
        <p className="text-muted-foreground">Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="My Profile">
      <div className="bg-card rounded-lg border border-border p-8 max-w-3xl">
        {/* Avatar */}
        <div className="mb-8">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="h-32 w-32 rounded-full object-cover" />
          ) : (
            <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Info rows */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-semibold text-foreground w-40">Full Name:</span>
            <span className="text-sm text-muted-foreground">{profile?.full_name || "—"}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm font-semibold text-foreground w-40">Email Address:</span>
            <span className="text-sm text-muted-foreground">{profile?.email || "—"}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4">
          <Button className="btn-plum border-0 px-10 py-3" onClick={() => navigate("/admin/profile/edit")}>
            Edit Profile
          </Button>
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-10 py-3"
            onClick={() => navigate("/admin/profile/change-password")}
          >
            Change Password
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
