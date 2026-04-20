// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, MoreVertical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

export default function AdminCategories() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: cats, error } = await supabase.from("categories").select("*, subcategories(sub_category_name)").order("created_at", { ascending: false });
      if (error) throw error;
      setCategories(cats || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const flatRows = useMemo(() => {
    return categories.flatMap((cat) => {
      const subs = cat.subcategories || [];
      if (subs.length === 0) return [{ id: cat.id, name: cat.category_name, subCategory: "—", addedOn: new Date(cat.created_at).toLocaleDateString(), status: cat.status }];
      return subs.map((s: any) => ({ id: cat.id, name: cat.category_name, subCategory: s.sub_category_name, addedOn: new Date(cat.created_at).toLocaleDateString(), status: cat.status }));
    });
  }, [categories]);

  const filtered = useMemo(() => {
    let result = flatRows;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.subCategory.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") result = result.filter(c => c.status === statusFilter);
    return result;
  }, [flatRows, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Category Management</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate("/admin/categories/add-subcategory")}>Add Sub Category</Button>
          <Button className="btn-plum border-0" onClick={() => navigate("/admin/categories/add")}>Add Category</Button>
        </div>
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
              <th className="text-left px-4 py-3 font-semibold text-foreground">Category Name</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Sub-Category</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Added On</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-foreground">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No categories found.</td></tr>
            ) : paginated.map((cat, idx) => (
              <tr key={`${cat.id}-${idx}`} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-muted-foreground">{String((currentPage - 1) * perPage + idx + 1).padStart(2, "0")}</td>
                <td className="px-4 py-3 text-foreground font-medium">{cat.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{cat.subCategory}</td>
                <td className="px-4 py-3 text-muted-foreground">{cat.addedOn}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    cat.status === "active" ? "bg-[hsl(145_60%_90%)] text-[hsl(145_60%_30%)]" : "bg-[hsl(0_70%_93%)] text-[hsl(0_70%_40%)]"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cat.status === "active" ? "bg-[hsl(145_60%_40%)]" : "bg-[hsl(0_70%_50%)]"}`} />
                    {cat.status === "active" ? "Active" : "In Active"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Popover>
                    <PopoverTrigger>
                      <span className="cursor-pointer text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></span>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-24 p-1">
                      <button onClick={() => navigate(`/admin/categories/${cat.id}`)} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">View</button>
                      <button onClick={() => navigate(`/admin/categories/${cat.id}/edit`)} className="block w-full text-left px-3 py-2 text-sm hover:bg-muted rounded-md transition-colors">Edit</button>
                    </PopoverContent>
                  </Popover>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <p className="text-sm text-muted-foreground">Showing {filtered.length > 0 ? (currentPage - 1) * perPage + 1 : 0} to {Math.min(currentPage * perPage, filtered.length)} of {filtered.length} entries</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors">Previous</button>
          {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${currentPage === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"}`}>{page}</button>
          ))}
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1.5 text-sm border border-border rounded-md disabled:opacity-40 hover:bg-muted transition-colors">Next</button>
        </div>
      </div>
    </AdminLayout>
  );
}
