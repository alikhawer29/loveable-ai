// @ts-nocheck
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import logoImage from "@/assets/logo.png";
import {
  Dialog,
  DialogContent
} from
  "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

/** All header links (matches client header design). */
const headerNavLinks = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
  { label: "Products", path: "/products" },
  { label: "Blogs", path: "/blogs" },
  { label: "Contact Us", path: "/contact" },
];

interface NavbarProps {
  /** Overlay on hero video — transparent until scrolled */
  overlay?: boolean;
}

export function Navbar({ overlay = false }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ type: string; id: string; name: string }[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearchLoading(true);
    const q = query.trim();
    const [prodRes, guideRes, blogRes] = await Promise.all([
      supabase.from("products").select("id, product_name").ilike("product_name", `%${q}%`).limit(5),
      supabase.from("guidelines_articles").select("id, title").ilike("title", `%${q}%`).eq("status", "published").limit(5),
      supabase.from("blogs").select("slug, title").ilike("title", `%${q}%`).eq("status", "published").limit(5),
    ]);
    const results: { type: string; id: string; name: string }[] = [];
    (prodRes.data || []).forEach((p) => results.push({ type: "product", id: p.id, name: p.product_name }));
    (guideRes.data || []).forEach((g) => results.push({ type: "guideline", id: g.id, name: g.title }));
    (blogRes.data || []).forEach((b) => results.push({ type: "blog", id: b.slug, name: b.title }));
    setSearchResults(results);
    setSearchLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (!overlay) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overlay]);

  const isOverlayActive = overlay && !scrolled;

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/blogs") {
      return (
        location.pathname === "/blogs" ||
        location.pathname.startsWith("/blog/")
      );
    }
    if (path === "/products") {
      return (
        location.pathname === "/products" ||
        location.pathname.startsWith("/products/") ||
        location.pathname.startsWith("/flowers") ||
        location.pathname.startsWith("/pots")
      );
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleSearchResultClick = (result: { type: string; id: string; name: string }) => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    if (result.type === "product") {
      navigate(`/products/${result.name.toLowerCase().replace(/\s+/g, "-")}`);
    } else if (result.type === "blog") {
      navigate(`/blog/${result.id}`);
    } else {
      navigate(`/blog/${result.id}`);
    }
  };

  return (
    <>
      <header
        className={`z-50 transition-colors duration-300 ${isOverlayActive
            ? "fixed inset-x-0 top-0 border-b border-white/10 bg-transparent shadow-none"
            : "sticky top-0 border-b border-border/80 bg-white shadow-sm"
          }`}
      >
        <nav className="container flex h-[4.5rem] items-center gap-4">
          <Link
            to="/"
            className="flex shrink-0 items-center overflow-visible"
            aria-label="Han Cloud Co. Ltd home"
          >
            <img
              src={logoImage}
              alt="Han Cloud Co. Ltd"
              className="h-[4.25rem] w-auto origin-left scale-[1.35] object-contain object-left sm:scale-[1.45]"
            />
          </Link>

          <ul className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:gap-2 lg:flex xl:gap-3">
            {headerNavLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`whitespace-nowrap rounded-md px-2.5 py-2 text-sm font-medium transition-colors md:px-3 ${isActive(link.path)
                      ? isOverlayActive
                        ? "bg-white/20 text-white shadow-sm backdrop-blur-sm"
                        : "bg-primary text-primary-foreground shadow-sm"
                      : isOverlayActive
                        ? "text-white/90 hover:bg-white/10 hover:text-white"
                        : "text-foreground/90 hover:bg-muted hover:text-primary"
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden shrink-0 items-center gap-2.5 lg:flex">
            <button
              type="button"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md bg-action-surface text-white transition-opacity hover:opacity-90"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>

          <button
            className={`ml-auto rounded-md p-2 lg:ml-0 lg:hidden ${isOverlayActive ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
              }`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileOpen && (
          <div
            className={`border-t animate-fade-in lg:hidden ${isOverlayActive
                ? "border-white/20 bg-black/80 backdrop-blur-md"
                : "border-border/80 bg-white"
              }`}
          >
            <div className="container space-y-1 py-4">
              {headerNavLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block rounded-md py-2.5 pl-2 text-sm font-medium ${isActive(link.path)
                      ? isOverlayActive
                        ? "bg-white/20 text-white"
                        : "bg-primary text-primary-foreground"
                      : isOverlayActive
                        ? "text-white/90 hover:bg-white/10"
                        : "text-foreground hover:bg-muted"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setSearchOpen(true); }}
                  className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground"
                >
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <Dialog open={searchOpen} onOpenChange={(open) => { setSearchOpen(open); if (!open) { setSearchQuery(""); setSearchResults([]); } }}>
        <DialogContent className="sm:max-w-lg p-0">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products, blogs, guidelines..."
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
                onClick={() => handleSearchResultClick(r)}
              >
                <span className="text-xs font-medium uppercase text-muted-foreground w-16">
                  {r.type === "product" ? "Product" : r.type === "blog" ? "Blog" : "Guide"}
                </span>
                <span className="text-sm text-foreground">{r.name}</span>
              </button>
            ))}
            {!searchQuery && <p className="px-4 py-6 text-center text-sm text-muted-foreground">Type to search...</p>}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
