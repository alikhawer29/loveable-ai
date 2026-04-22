import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Product {
  id: string;
  product_name: string;
  category_name: string;
  created_at: string;
  stock_status: string;
  status: string;
}

const stockLabel = (s: string) => {
  switch (s) {
    case "in_stock": return "In Stock";
    case "out_of_stock": return "Out Of Stock";
    case "limited_stock": return "Limited Stock";
    default: return s;
  }
};

const stockColors = (s: string) => {
  switch (s) {
    case "in_stock": return "bg-[hsl(145_60%_90%)] text-[hsl(145_60%_30%)]";
    case "out_of_stock": return "bg-[hsl(45_100%_90%)] text-[hsl(30_80%_35%)]";
    case "limited_stock": return "bg-[hsl(0_70%_93%)] text-[hsl(0_70%_40%)]";
    default: return "";
  }
};

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, product_name, stock_status, status, created_at, category_id, categories(category_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(
        (data || []).map((p: any) => ({
          id: p.id,
          product_name: p.product_name,
          category_name: p.categories?.category_name || "—",
          created_at: new Date(p.created_at).toLocaleDateString(),
          stock_status: p.stock_status,
          status: p.status,
        }))
      );
    } catch (err: any) {
      toast.error("Failed to load products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = products;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.product_name.toLowerCase().includes(q) || p.category_name.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(p => p.status === statusFilter);
    return result;
  }, [search, statusFilter, products]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-[46px] font-semibold text-foreground">Product Management</h1>
        <Button className="btn-plum border-0" onClick={() => navigate("/admin/products/add")}>Add Product</Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Showing:</span>
          <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-border rounded-md px-2 py-1 text-sm bg-background text-foreground">
            <option value={5}>5</option><option value={8}>8</option><option value={10}>10</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Input placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-3 pr-10 w-48" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Popover>
            <PopoverTrigger>
              <span className="h-10 w-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-2">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button key={s} onClick={() => { setStatusFilter(s); setCurrentPage(1); }} className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {s === "all" ? "All" : s === "active" ? "Active" : "Inactive"}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-semibold text-foreground">S. No</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Product Name</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Category</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Added On</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Product Status</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : paginated.map((prod, idx) => (
              <tr key={prod.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{String((currentPage - 1) * perPage + idx + 1).padStart(2, "0")}</td>
                <td className="px-4 py-3 text-foreground font-medium">{prod.product_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{prod.category_name}</td>
                <td className="px-4 py-3 text-muted-foreground">{prod.created_at}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${stockColors(prod.stock_status)}`}>
                    {stockLabel(prod.stock_status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${prod.status === "active" ? "bg-[hsl(145_60%_90%)] text-[hsl(145_60%_30%)]" : "bg-[hsl(0_70%_93%)] text-[hsl(0_70%_40%)]"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${prod.status === "active" ? "bg-[hsl(145_60%_40%)]" : "bg-[hsl(0_70%_50%)]"}`} />
                    {prod.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Popover>
                    <PopoverTrigger>
                      <span className="cursor-pointer text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></span>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-24 p-1">
                      <button onClick={() => navigate(`/admin/products/${prod.id}`)} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">View</button>
                      <button onClick={() => navigate(`/admin/products/${prod.id}/edit`)} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">Edit</button>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
            {!loading && paginated.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length > 0 ? (currentPage - 1) * perPage + 1 : 0} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries
        </p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors">Previous</button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>{page}</button>
          ))}
          {totalPages > 3 && <span className="px-1 text-muted-foreground">|</span>}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
        </div>
      </div>
    </AdminLayout>
  );
}
