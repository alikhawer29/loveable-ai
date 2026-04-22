// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, MoreVertical, ChevronUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_PER_PAGE = 8;

const AdminGuidelines = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("guidelines_articles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setArticles(data || []);
    } catch (err) {
      console.error("Failed to load guidelines:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  const filtered = articles.filter((g) => g.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDelete = async () => {
    if (deleteId) {
      await supabase.from("guidelines_articles").delete().eq("id", deleteId);
    }
    setDeleteId(null);
    setDeleteSuccess(true);
    fetchArticles();
  };

  const statusColor = (s: string) => {
    if (s === "published") return "bg-[hsl(142_70%_45%)] text-white";
    if (s === "draft") return "bg-[hsl(40_90%_55%)] text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Guidelines</h1>
        <Button className="btn-plum border-0" onClick={() => navigate("/admin/guidelines/add")}>Create New Gardening Article</Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-foreground font-medium">
            Showing:
            <select className="border border-border rounded-md px-2 py-1 text-sm bg-background"><option>5</option><option>10</option><option>20</option></select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="pl-9 w-48" />
            </div>
            <Button variant="outline" size="icon" className="border-primary text-primary"><SlidersHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/10">
                <th className="text-left px-4 py-3 font-semibold text-foreground">S. No</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Title</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Media</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Added On</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No articles found.</td></tr>
              ) : paginated.map((guide, i) => (
                <tr key={guide.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-muted-foreground">{String((currentPage - 1) * ITEMS_PER_PAGE + i + 1).padStart(2, "0")}</td>
                  <td className="px-4 py-3 text-foreground">{guide.title}</td>
                  <td className="px-4 py-3">
                    {guide.video_url ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs">V</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Video</span>
                      </div>
                    ) : guide.image_url ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <span className="text-green-600 text-xs">I</span>
                        </div>
                        <span className="text-xs text-muted-foreground">Image</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No media</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(guide.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor(guide.status)}`}>
                      {guide.status}
                      <ChevronUp className="h-3 w-3" />
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><button className="p-1 hover:bg-muted rounded"><MoreVertical className="h-4 w-4 text-muted-foreground" /></button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/admin/guidelines/${guide.id}`)}>View</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/admin/guidelines/${guide.id}/edit`)}>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(guide.id)}>Delete</DropdownMenuItem>
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

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Delete Guideline?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Delete This Guideline?</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={handleDelete}>Yes</Button>
            <Button variant="outline" className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setDeleteId(null)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteSuccess} onOpenChange={setDeleteSuccess}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(142_70%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(142_70%_45%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Guideline Has Been Deleted Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => setDeleteSuccess(false)}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGuidelines;
