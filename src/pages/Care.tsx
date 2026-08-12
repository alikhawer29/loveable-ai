import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import aboutHero from "@/assets/about-hero.jpg";

interface CareArticle {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  image_url?: string | null;
  video_url?: string | null;
}

const ITEMS_PER_PAGE = 9;
const PLACEHOLDER = "/placeholder.svg";

const Care = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<CareArticle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { count } = await supabase
          .from("guidelines_articles")
          .select("id", { count: "exact", head: true })
          .eq("status", "published");
        setTotalCount(count || 0);

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        const { data, error } = await supabase
          .from("guidelines_articles")
          .select("id, title, image_url, video_url, content, created_at")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(from, to);
        if (error) throw error;
        setArticles(data || []);
      } catch (err) {
        console.error("Failed to fetch care guides:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [currentPage]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <PageLayout
      title="Care"
      subtitle="Your guide to orchid plant care — tips, videos, and advice to keep your orchids thriving."
      heroImage={aboutHero}
    >
      <section className="container py-10 md:py-14">
        <h2 className="font-display text-2xl text-primary md:text-3xl mb-8">
          Your Guide to Plant Care
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/3] rounded-lg mb-4" />
                <Skeleton className="h-5 w-48 mb-1" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No care guides published yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link key={article.id} to={`/guideline/${article.id}`} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-lg mb-4 relative bg-muted">
                  {article.video_url ? (
                    <video
                      src={article.video_url}
                      poster={article.image_url || undefined}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                        e.currentTarget.pause();
                        e.currentTarget.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={article.image_url || PLACEHOLDER}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                </div>
                <h3 className="font-display text-base md:text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {article.content?.slice(0, 100) || "Discover helpful tips and advice..."}
                </p>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-sm text-muted-foreground disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-8 w-8 rounded-full text-sm font-medium ${
                  currentPage === page ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 5 && <span className="text-muted-foreground">...</span>}
            {totalPages > 5 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`h-8 w-8 rounded-full text-sm font-medium ${
                  currentPage === totalPages ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="text-sm text-muted-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </PageLayout>
  );
};

export default Care;
