// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminQueryDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [query, setQuery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuery = async () => {
      const { data } = await supabase.from("queries").select("*").eq("id", id).maybeSingle();
      setQuery(data);
      setLoading(false);
    };
    if (id) fetchQuery();
  }, [id]);

  if (loading) return <AdminLayout><p className="text-muted-foreground">Loading...</p></AdminLayout>;
  if (!query) return <AdminLayout><p className="text-muted-foreground">Query not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/queries")} className="text-foreground hover:text-primary">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Query Detail</h1>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
        <div className="space-y-5 max-w-2xl">
          <div className="flex gap-4">
            <span className="text-sm font-bold text-foreground w-36 shrink-0">Full Name:</span>
            <span className="text-sm text-foreground">{query.full_name}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-bold text-foreground w-36 shrink-0">Email Address:</span>
            <span className="text-sm text-foreground">{query.email}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-bold text-foreground w-36 shrink-0">Subject:</span>
            <span className="text-sm text-foreground">{query.subject || "—"}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-bold text-foreground w-36 shrink-0">Date:</span>
            <span className="text-sm text-foreground">{new Date(query.created_at).toLocaleDateString()}</span>
          </div>
          <div className="pt-2">
            <p className="text-sm font-bold text-foreground mb-2">Message:</p>
            <p className="text-sm text-foreground leading-relaxed">{query.message}</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQueryDetail;
