// @ts-nocheck
// Navigation with role-based link visibility and real-time notifications
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, User, LogOut, AlertCircle, LayoutDashboard } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import logoImage from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent } from
"@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger } from
"@/components/ui/popover";

const publicLinks = [
{ label: "Home", path: "/" },
{ label: "About", path: "/about" },
{ label: "Contact Us", path: "/contact" }];


const authLinks = [
{ label: "Home", path: "/" },
{ label: "About", path: "/about" },
{ label: "Flowers", path: "/flowers" },
{ label: "Pots", path: "/pots" },
{ label: "Guidelines", path: "/guidelines" },
{ label: "Contact Us", path: "/contact" }];


interface NavNotification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; name: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [navNotifications, setNavNotifications] = useState<NavNotification[]>([]);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    const q = query.trim();
    const [prodRes, guideRes] = await Promise.all([
      supabase.from("products").select("id, product_name").ilike("product_name", `%${q}%`).limit(5),
      supabase.from("guidelines_articles").select("id, title").ilike("title", `%${q}%`).eq("status", "published").limit(5),
    ]);
    const results: { type: string; id: string; name: string }[] = [];
    (prodRes.data || []).forEach((p) => results.push({ type: "product", id: p.id, name: p.product_name }));
    (guideRes.data || []).forEach((g) => results.push({ type: "guideline", id: g.id, name: g.title }));
    setSearchResults(results);
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifs = async () => {
      const { data } = await supabase.
      from("notifications").
      select("id, title, message, is_read, created_at").
      order("created_at", { ascending: false }).
      limit(5);
      setNavNotifications(data as any || []);
    };
    fetchNotifs();

    const channel = supabase.
    channel("navbar-notifications").
    on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => fetchNotifs()).
    subscribe();
    return () => {supabase.removeChannel(channel);};
  }, [isAuthenticated]);
  const isActive = (path: string) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
  const navLinks = isAuthenticated ? authLinks : publicLinks;

  const handleLogout = async () => {
    setLogoutOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  const unreadCount = navNotifications.filter((n) => !n.is_read).length;

  return (
    <>
      {/*
        Client requested to hide this promotional strip for now.
        Keeping it commented instead of deleting so it can be restored quickly.
      */}
      {/*
      {!isAuthenticated && (
        <div className="bg-secondary text-secondary-foreground text-center py-2 text-xs tracking-wide">
          <span>
            Get 15% off your first purchase{" "}
            <Link to="/register" className="font-semibold border border-foreground px-2 py-0.5 ml-1 hover:bg-foreground/10 transition-colors">
              Sign Up
            </Link>
          </span>
        </div>
      )}
      */}

      {/* Main navbar */}
      <header className="section-dark sticky top-0 z-50 border-b border-[hsl(0_0%_100%_/_0.1)]">
        <nav className="container flex h-16 items-center justify-between bg-[#713271]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5" aria-label="Infinity Floral home">
            <img src={logoImage} alt="Infinity Floral" className="h-14 my-3 object-contain" />
            {/*<div className="flex flex-col leading-none">
               <span className="font-display text-sm font-semibold tracking-wider uppercase text-[hsl(0_0%_100%)]">
                 Infinity
               </span>
               <span className="font-display text-[10px] tracking-[0.3em] uppercase text-[hsl(0_0%_100%_/_0.7)]">
                 Floral
               </span>
              </div>*/}
          </Link>

          {/* Desktop links */}
          <ul className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) =>
            <li key={link.path}>
                <Link
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                isActive(link.path) ?
                "text-[hsl(0_0%_100%)]" :
                "text-[hsl(0_0%_100%_/_0.7)] hover:text-[hsl(0_0%_100%)]"}`
                }>
                
                  {link.label}
                </Link>
              </li>
            )}
          </ul>

          {/* Desktop icons */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="h-9 w-9 rounded-md border border-[hsl(0_0%_100%_/_0.3)] flex items-center justify-center text-[hsl(0_0%_100%_/_0.7)] hover:text-[hsl(0_0%_100%)] hover:border-[hsl(0_0%_100%_/_0.5)] transition-colors">
              
              <Search className="h-4 w-4" />
            </button>

            {isAuthenticated ?
            <>
                {/* Notifications */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                    aria-label="Notifications"
                    className="h-9 w-9 rounded-md flex items-center justify-center text-[hsl(0_0%_100%_/_0.7)] hover:text-[hsl(0_0%_100%)] transition-colors relative">
                    
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 &&
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-semibold">
                          {unreadCount}
                        </span>
                    }
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-80 p-0">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="font-display text-sm font-semibold text-foreground">Notifications</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {navNotifications.length === 0 ?
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">No notifications</div> :
                    navNotifications.map((n) =>
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-border last:border-0 flex items-start gap-3 ${
                      !n.is_read ? "bg-primary/5" : ""}`
                      }>
                      
                          <span
                        className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                        !n.is_read ? "bg-primary" : "bg-transparent"}`
                        } />
                      
                          <div className="flex-1 min-w-0">
                            {n.title && <p className={`text-xs font-semibold ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>}
                            <p className={`text-sm leading-snug ${!n.is_read ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {n.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
                          </div>
                        </div>
                    )}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                    aria-label="User menu"
                    className="flex items-center gap-2 h-9 px-3 rounded-full bg-[hsl(0_0%_100%_/_0.15)] text-[hsl(0_0%_100%)] hover:bg-[hsl(0_0%_100%_/_0.25)] transition-colors">
                    
                      <User className="h-4 w-4" />
                      <span className="text-sm font-medium">{user?.name?.split(" ")[0] || "User"} {user?.name?.split(" ")[1]?.charAt(0) ? `${user.name.split(" ")[1].charAt(0)}.` : ""}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setLogoutOpen(true)} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </> :

            <Link
              to="/login"
              className="flex items-center gap-2 h-9 px-4 rounded-md border border-[hsl(0_0%_100%_/_0.3)] text-sm font-medium text-[hsl(0_0%_100%_/_0.9)] hover:bg-[hsl(0_0%_100%_/_0.1)] transition-colors">
              
                <User className="h-4 w-4" />
                Log In
              </Link>
            }
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden p-2 text-[hsl(0_0%_100%)]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen &&
        <div className="lg:hidden border-t border-[hsl(0_0%_100%_/_0.1)] animate-fade-in">
            <div className="container py-4 space-y-1">
              {navLinks.map((link) =>
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block py-2.5 text-sm font-medium ${
              isActive(link.path) ?
              "text-[hsl(0_0%_100%)]" :
              "text-[hsl(0_0%_100%_/_0.7)]"}`
              }>
              
                  {link.label}
                </Link>
            )}
              <div className="pt-3 border-t border-[hsl(0_0%_100%_/_0.1)] flex flex-col gap-2">
                {isAuthenticated ?
              <>
                    <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[hsl(0_0%_100%_/_0.7)]">
                  
                      Dashboard
                    </Link>
                    <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-[hsl(0_0%_100%_/_0.7)]">
                  
                      My Profile
                    </Link>
                    <button
                  onClick={() => {
                    setMobileOpen(false);
                    setLogoutOpen(true);
                  }}
                  className="text-sm text-[hsl(0_0%_100%_/_0.7)] text-left">
                  
                      Logout
                    </button>
                  </> :

              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="text-sm text-[hsl(0_0%_100%_/_0.7)]">
                
                    Sign In
                  </Link>
              }
              </div>
            </div>
          </div>
        }
      </header>

      {/* Logout confirmation dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-destructive flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive-foreground" />
            </div>
          </div>
          <p className="text-foreground font-medium text-lg mb-6">Are You Sure You Want To Logout?</p>
          <div className="flex gap-4">
            <Button className="btn-plum border-0 flex-1" onClick={handleLogout}>Yes</Button>
            <Button variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setLogoutOpen(false)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search dialog */}
      <Dialog open={searchOpen} onOpenChange={(open) => { setSearchOpen(open); if (!open) { setSearchQuery(""); setSearchResults([]); } }}>
        <DialogContent className="sm:max-w-lg p-0">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, guidelines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchLoading && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Searching...</p>}
            {!searchLoading && searchQuery && searchResults.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">No results found</p>
            )}
            {!searchLoading && searchResults.map((r) => (
              <button
                key={`${r.type}-${r.id}`}
                className="w-full px-4 py-3 text-left hover:bg-muted/50 flex items-center gap-3 border-b border-border last:border-0"
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  setSearchResults([]);
                  if (!isAuthenticated) { navigate("/login"); return; }
                  navigate(r.type === "product" ? `/flowers/${r.name.toLowerCase().replace(/\s+/g, "-")}` : `/blog/${r.id}`);
                }}
              >
                <span className="text-xs font-medium uppercase text-muted-foreground w-16">{r.type === "product" ? "Product" : "Guide"}</span>
                <span className="text-sm text-foreground">{r.name}</span>
              </button>
            ))}
            {!searchQuery && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Type to search...</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>);

}