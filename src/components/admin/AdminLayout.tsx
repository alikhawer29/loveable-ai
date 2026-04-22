// @ts-nocheck
import { type ReactNode, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Bell, ChevronDown, LogOut, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import adminAvatar from "@/assets/admin-avatar.jpg";

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const { adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);

  const handleLogout = async () => {
    setLogoutOpen(false);
    await adminLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 flex items-center justify-between border-b border-border px-6 bg-primary">
          <div />
          <div className="flex items-center gap-4">
            <button className="text-primary-foreground hover:text-primary-foreground/80 relative">
              <Bell className="h-5 w-5" />
            </button>
            <Popover>
              <PopoverTrigger>
                <span className="flex items-center gap-2 text-primary-foreground text-sm font-medium cursor-pointer">
                  <img src={adminAvatar} alt="Tom Albert" className="h-8 w-8 rounded-full object-cover" />
                  <span className="hidden sm:inline">Tom Albert</span>
                  <ChevronDown className="h-4 w-4" />
                </span>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-44 p-1">
                <button
                  onClick={() => navigate("/admin/profile")}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors text-foreground"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => setLogoutOpen(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </PopoverContent>
            </Popover>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8">
          {title && (
            <h1 className="font-display text-[46px] font-semibold text-foreground mb-6 leading-tight">{title}</h1>
          )}
          {children}
        </main>
      </div>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Logout</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Logout?</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={handleLogout}>Yes</Button>
            <Button
              variant="outline"
              className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setLogoutOpen(false)}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
