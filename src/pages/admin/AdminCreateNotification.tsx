import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserOption {
  user_id: string;
  full_name: string;
  email: string;
}

const AdminCreateNotification = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "specific">("all");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .order("full_name");
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Title and message are required.");
      return;
    }
    if (target === "specific" && !selectedUserId) {
      toast.error("Please select a user.");
      return;
    }

    setSubmitting(true);
    try {
      if (target === "all") {
        // Broadcast: insert one row with user_id = null
        const { error } = await supabase.from("notifications").insert({
          title,
          message,
          user_id: null,
        } as any);
        if (error) throw error;
      } else {
        // Specific user
        const { error } = await supabase.from("notifications").insert({
          title,
          message,
          user_id: selectedUserId,
        } as any);
        if (error) throw error;
      }
      toast.success("Notification sent successfully!");
      navigate("/admin/notifications");
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Create Notification">
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Notification title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Notification message…"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Send To</Label>
            <Select value={target} onValueChange={(v) => setTarget(v as "all" | "specific")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="specific">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {target === "specific" && (
            <div className="space-y-2">
              <Label>Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user…" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.user_id} value={u.user_id}>
                      {u.full_name || u.email} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Sending…" : "Send Notification"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/admin/notifications")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminCreateNotification;
