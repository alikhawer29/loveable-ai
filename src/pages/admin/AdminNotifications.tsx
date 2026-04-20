import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Plus, Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationRow {
  id: string;
  title: string;
  message: string;
  user_id: string | null;
  is_read: boolean;
  created_at: string;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    setNotifications((data as any) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <AdminLayout title="Notification Management">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Manage and send notifications to users.
        </p>
        <Button asChild>
          <Link to="/admin/notifications/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Notification
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No notifications sent yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Message</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Target</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Sent</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary shrink-0" />
                    {n.title || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{n.message}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      n.user_id ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {n.user_id ? "Specific User" : "All Users"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
