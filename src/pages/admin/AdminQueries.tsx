// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 8;

const AdminQueries = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [queries, setQueries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const { data, error } = await supabase
          .from("queries")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setQueries(data || []);
      } catch (err) {
        console.error("Failed to load queries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const filtered = queries.filter((q) =>
    q.full_name.toLowerCase().includes(search.toLowerCase()) ||
    q.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">Queries</h1>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            Showing:
            <select className="border border-border rounded-md px-2 py-1 text-sm bg-background">
              <option>5</option><option>10</option><option>20</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 w-48" />
            </div>
            <Button variant="outline" size="icon" className="border-primary text-primary">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left px-4 py-3 font-semibold text-foreground">S. No</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Full Name</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Email Address</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Received On</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No queries found.</td></tr>
              ) : paginated.map((query, i) => (
                <tr key={query.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{String((currentPage - 1) * ITEMS_PER_PAGE + i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3 text-foreground">{query.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{query.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(query.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 hover:bg-muted rounded"><MoreVertical className="h-4 w-4 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/queries/${query.id}`)}>View</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">Showing {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} to {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Previous</Button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((page) => (
              <Button key={page} size="sm" variant={currentPage === page ? "default" : "ghost"} className={currentPage === page ? "btn-plum border-0" : ""} onClick={() => setCurrentPage(page)}>{page}</Button>
            ))}
            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQueries;
