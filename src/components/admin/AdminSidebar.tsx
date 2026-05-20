import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderTree,
  Package,
  BookOpen,
  Newspaper,
  MessageSquareText,
  Bell,
} from "lucide-react";
import logoImg from "@/assets/logo.png";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "User Management", url: "/admin/users", icon: Users },
  { title: "Category Management", url: "/admin/categories", icon: FolderTree },
  { title: "Product Management", url: "/admin/products", icon: Package },
  { title: "Guidelines", url: "/admin/guidelines", icon: BookOpen },
  { title: "Blogs", url: "/admin/blogs", icon: Newspaper },
  { title: "Queries", url: "/admin/queries", icon: MessageSquareText },
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 shrink-0 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border bg-primary">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <img
            src={logoImg}
            alt="Han Cloud Co. Ltd"
            className="h-14 w-auto my-2 object-contain brightness-0 invert"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url || location.pathname.startsWith(item.url + "/");
          return (
            <Link
              key={item.title}
              to={item.url}
              className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${isActive
                ? "bg-primary text-primary-foreground"
                : "text-foreground hover:bg-muted"
                }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
