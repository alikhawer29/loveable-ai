import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Flower2, BookOpen, Bell, CheckCircle, Circle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const quickActions = [
  {
    title: "Browse Products",
    description: "Explore our curated collection of orchids, flowers, and pots.",
    icon: Flower2,
    to: "/products",
    color: "bg-pink-50 text-pink-600",
  },
  {
    title: "View Guidelines",
    description: "Read care guides and tips to keep your plants thriving.",
    icon: BookOpen,
    to: "/guideline",
    color: "bg-emerald-50 text-emerald-600",
  },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("id, title, message, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    setNotifications((data as any) || []);
    setLoadingNotifs(false);
  };

  useEffect(() => {
    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel("dashboard-notifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleRead = async (id: string, currentlyRead: boolean) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: !currentlyRead } as any)
      .eq("id", id);
    if (error) {
      toast.error("Failed to update notification.");
      return;
    }
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !currentlyRead } : n))
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="font-display text-[46px] text-foreground">
            Welcome back, {user?.name || "there"}!
          </h1>
          <p className="mt-2 text-muted-foreground font-body">
            Here's what you can explore today.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex items-center justify-center rounded-lg p-3 mb-4 ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground font-body">
                {action.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">
              Recent Notifications
            </h2>
          </div>
          <div className="p-5">
            {loadingNotifs ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notifications yet.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
                      !n.is_read ? "bg-primary/5 border border-primary/10" : "border border-transparent"
                    }`}
                  >
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                        !n.is_read ? "bg-primary" : "bg-muted-foreground/20"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      {n.title && (
                        <p className={`text-sm font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                          {n.title}
                        </p>
                      )}
                      <p className="text-sm text-foreground font-body">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="shrink-0 text-xs gap-1"
                      onClick={() => toggleRead(n.id, n.is_read)}
                    >
                      {n.is_read ? (
                        <>
                          <Circle className="h-3.5 w-3.5" />
                          Mark Unread
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Mark Read
                        </>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
