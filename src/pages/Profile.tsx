import { useState, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, User as UserIcon, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const { user, updateUser, refreshProfile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit profile state
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [countryCode, setCountryCode] = useState("+1");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const fullPhone = `${countryCode}${phone}`;

      // Update profiles table
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone: fullPhone })
        .eq("user_id", user.id);
      if (error) throw error;

      // Also update auth metadata
      await supabase.auth.updateUser({
        data: { full_name: fullName, phone: fullPhone },
      });

      await refreshProfile();
      setEditOpen(false);
      setEditSuccess(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      // Verify current password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });
      if (signInError) {
        setPasswordError("Current password is incorrect.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      setPasswordOpen(false);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    toast.info("Uploading avatar…");
    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Add cache-buster
      const avatarUrl = `${publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);
      if (dbError) throw dbError;

      updateUser({ avatar: avatarUrl });
      await refreshProfile();
      toast.success("Avatar updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload avatar.");
    }
  };

  const displayName = user?.name || "User";
  const displayPhone = user?.phone || "—";
  const displayEmail = user?.email || "—";

  // Sync form state when dialog opens
  const openEditDialog = () => {
    setFirstName(user?.name?.split(" ")[0] || "");
    setLastName(user?.name?.split(" ").slice(1).join(" ") || "");
    setPhone(user?.phone?.replace(/^\+\d{1,3}/, "") || "");
    setEditOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-10 md:py-14">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">My Profile</h1>

        <div className="bg-[hsl(var(--plum-light))] rounded-lg p-6 md:p-10 max-w-4xl">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-36 h-36 rounded-full bg-muted overflow-hidden border-4 border-background">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <UserIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
                aria-label="Change avatar"
              >
                <Camera className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-5">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-4">
                <span className="text-sm font-semibold text-foreground">Full Name:</span>
                <span className="text-sm text-foreground">{displayName}</span>
                <span className="text-sm font-semibold text-foreground">Phone Number:</span>
                <span className="text-sm text-foreground">{displayPhone}</span>
                <span className="text-sm font-semibold text-foreground">Email:</span>
                <span className="text-sm text-foreground">{displayEmail}</span>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button className="btn-plum border-0 uppercase text-xs tracking-wider px-8" onClick={openEditDialog}>
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="uppercase text-xs tracking-wider px-8 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  onClick={() => { setPasswordError(""); setPasswordOpen(true); }}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <h2 className="font-display text-2xl font-semibold text-center text-foreground mb-6">Edit Profile</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">First Name<span className="text-destructive">*</span></Label>
              <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="px-3 text-muted-foreground"><UserIcon className="h-4 w-4" /></span>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="border-0 focus-visible:ring-0 shadow-none" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Last Name<span className="text-destructive">*</span></Label>
              <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="px-3 text-muted-foreground"><UserIcon className="h-4 w-4" /></span>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} className="border-0 focus-visible:ring-0 shadow-none" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-primary text-sm">Phone Number<span className="text-destructive">*</span></Label>
              <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                <span className="px-3 text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="bg-transparent text-sm outline-none">
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                </span>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="1234 567 8910" className="border-0 focus-visible:ring-0 shadow-none" required />
              </div>
            </div>
            <Button type="submit" className="btn-plum border-0 w-full mt-4" disabled={saving}>
              {saving ? "Updating…" : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Success Dialog */}
      <Dialog open={editSuccess} onOpenChange={setEditSuccess}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="hsl(142 71% 45%)"/><path d="M20 33l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="text-foreground font-medium text-lg mb-6">Profile Updated Successfully</p>
          <Button className="btn-plum border-0 w-full" onClick={() => setEditSuccess(false)}>OK</Button>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <h2 className="font-display text-2xl font-semibold text-center text-foreground mb-6">Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {[
              { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
              { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(!showNew) },
              { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label className="text-primary text-sm">{field.label}<span className="text-destructive">*</span></Label>
                <div className="flex items-center border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-primary">
                  <span className="px-3 text-muted-foreground"><Lock className="h-4 w-4" /></span>
                  <Input type={field.show ? "text" : "password"} value={field.value} onChange={(e) => field.set(e.target.value)} className="border-0 focus-visible:ring-0 shadow-none" required />
                  <button type="button" onClick={field.toggle} className="px-3 text-muted-foreground hover:text-foreground">
                    {field.show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ))}
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <Button type="submit" className="btn-plum border-0 w-full mt-4" disabled={savingPassword}>
              {savingPassword ? "Updating…" : "Update"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Success Dialog */}
      <Dialog open={passwordSuccess} onOpenChange={setPasswordSuccess}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <svg className="h-16 w-16" viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="hsl(142 71% 45%)"/><path d="M20 33l8 8 16-16" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="text-foreground font-medium text-lg mb-6">Password Updated Successfully</p>
          <Button className="btn-plum border-0 w-full" onClick={() => setPasswordSuccess(false)}>OK</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
