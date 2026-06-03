import { Link, useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface GuidelineArticle {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  video_url?: string | null;
}

const GuidelineDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<GuidelineArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<GuidelineArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // Try fetching by ID first, then by slug-like title match
        let { data, error } = await supabase
          .from("guidelines_articles")
          .select("id, title, video_url, content, created_at")
          .eq("id", slug)
          .maybeSingle();

        if (!data) {
          // Try matching by title slug
          const titleSearch = slug.replace(/-/g, " ");
          const { data: byTitle } = await supabase
            .from("guidelines_articles")
            .select("id, title, video_url, content, created_at")
            .ilike("title", `%${titleSearch}%`)
            .eq("status", "published")
            .limit(1)
            .maybeSingle();
          data = byTitle;
        }

        setArticle(data);

        // Fetch related articles
        const { data: related } = await supabase
          .from("guidelines_articles")
          .select("id, title, video_url, content, created_at")
          .eq("status", "published")
          .neq("id", data?.id || "")
          .order("created_at", { ascending: false })
          .limit(3);
        setRelatedArticles(related || []);
      } catch (err) {
        console.error("Failed to fetch article:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6 md:py-10 max-w-4xl">
          <Skeleton className="h-6 w-16 mb-6" />
          <Skeleton className="h-10 w-3/4 mx-auto mb-2" />
          <Skeleton className="h-4 w-32 mx-auto mb-6" />
          <Skeleton className="aspect-video rounded-lg mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <h1 className="font-display text-[46px] text-foreground mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The guideline you're looking for doesn't exist.</p>
          <button onClick={() => navigate("/guidelines")} className="btn-plum rounded-sm text-sm">
            Back to Guidelines
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-6 md:py-10 max-w-4xl">
        {/* Back */}
        <button onClick={() => navigate("/guidelines")} className="flex items-center gap-2 text-sm text-foreground mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Title */}
        <h1 className="font-display text-[46px] text-foreground mb-2 text-center leading-tight">{article.title}</h1>
        <p className="text-center text-xs text-primary mb-6">{formatDate(article.created_at)}</p>

        {/* Video */}
        {article.video_url ? (
          <div className="aspect-video overflow-hidden rounded-lg mb-8 relative bg-muted">
            <video
              src={article.video_url}
              controls
              className="h-full w-full object-cover"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="aspect-video overflow-hidden rounded-lg mb-8 relative bg-muted flex items-center justify-center">
            <p className="text-muted-foreground">No video available</p>
          </div>
        )}

        {/* Content */}
        <div className="prose prose-sm max-w-none space-y-4">
          {article.content?.split("\n").filter(Boolean).map((paragraph, i) => (
            <p key={i} className="text-sm text-muted-foreground leading-relaxed">{paragraph}</p>
          ))}
        </div>

        {/* Related guides */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 mb-10">
            <div className="flex items-end justify-between mb-8">
              <h2 className="font-display text-[46px] text-foreground leading-tight">More Guide to Plant Care</h2>
              <Link to="/guidelines" className="btn-plum rounded-sm text-xs uppercase tracking-wider px-6">Read More</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((g) => (
                <Link to={`/guideline/${g.id}`} key={g.id} className="group">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-3 bg-muted">
                    {g.video_url ? (
                      <video
                        src={g.video_url}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground text-sm">No video</div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{formatDate(g.created_at)}</p>
                  <h3 className="font-display text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{g.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {g.content?.slice(0, 120) || "Read more..."}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GuidelineDetail;
