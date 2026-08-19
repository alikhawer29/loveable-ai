// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { ArrowLeft, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import guideRepot from "@/assets/guide-repot.png";

const AdminViewGuideline = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("guidelines_articles").select("*").eq("id", id).maybeSingle();
      setArticle(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) return <AdminLayout><p className="text-muted-foreground">Loading...</p></AdminLayout>;
  if (!article) return <AdminLayout><p className="text-muted-foreground">Article not found.</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate("/admin/guidelines")} className="text-foreground hover:text-primary"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-display text-[46px] font-semibold text-foreground">View Guideline</h1>
      </div>
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8">
        <div className="flex flex-wrap gap-x-16 gap-y-2 mb-8">
          <div><p className="text-sm text-muted-foreground mb-1">Article Title</p><p className="font-medium text-foreground">{article.title}</p></div>
          <div><p className="text-sm text-muted-foreground mb-1">Added On</p><p className="font-medium text-foreground">{new Date(article.created_at).toLocaleDateString()}</p></div>
        </div>
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">Article Detailed:</p>
          <p className="text-sm text-primary leading-relaxed">{article.content}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground mb-2">Article Media</p>
          <div className="relative aspect-video max-w-2xl rounded-lg overflow-hidden bg-muted">
            {article.video_url ? (
              <video
                src={article.video_url}
                controls
                className="h-full w-full object-cover"
              >
                Your browser does not support the video tag.
              </video>
            ) : article.image_url ? (
              <img src={article.image_url} alt="Article media" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                No media available
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewGuideline;
