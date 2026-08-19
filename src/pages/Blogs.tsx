import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { BlogCard } from "@/components/blogs/BlogCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  type BlogPost,
  formatBlogDate,
  estimateReadTime,
  getExcerpt,
  getBlogUrl,
} from "@/lib/blog-utils";
import blogsHero from "@/assets/blogs_banner.jpg";

const ITEMS_PER_PAGE = 6;

const BLOG_SELECT =
  "id, title, slug, content, featured_image_url, status, is_featured, created_at";

const Blogs = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [featuredPost, setFeaturedPost] = useState<BlogPost | null>(null);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const { data: featuredData } = await supabase
          .from("blogs")
          .select(BLOG_SELECT)
          .eq("status", "published")
          .eq("is_featured", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const featured = currentPage === 1 ? (featuredData as BlogPost | null) : null;
        setFeaturedPost(featured);

        let countQuery = supabase
          .from("blogs")
          .select("id", { count: "exact", head: true })
          .eq("status", "published");
        if (featured) countQuery = countQuery.neq("id", featured.id);
        const { count } = await countQuery;
        setTotalCount(count || 0);

        const from = (currentPage - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        let listQuery = supabase
          .from("blogs")
          .select(BLOG_SELECT)
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .range(from, to);
        if (featured) listQuery = listQuery.neq("id", featured.id);

        const { data, error } = await listQuery;
        if (error) throw error;
        setArticles((data as BlogPost[]) || []);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const pageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [];
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    for (let i = 0; i < 5; i++) pages.push(start + i);
    return pages;
  };

  const featuredImage = featuredPost?.featured_image_url || blogsHero;

  return (
    <PageLayout
      title="Blogs"
      subtitle="We are a dedicated orchid grower supplying high-quality, consistent orchids to wholesalers, florists, and distributors."
      heroImage={blogsHero}
    >
      <section className="container py-10 md:py-14">
        {loading ? (
          <>
            <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
              <Skeleton className="aspect-[4/3] lg:min-h-[340px]" />
              <div className="border border-foreground bg-[#F2F0E4] p-8 shadow-[6px_6px_0_0_#000]">
                <Skeleton className="h-3 w-32 mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
            <Skeleton className="h-8 w-64 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="aspect-[4/3] rounded-lg mb-4" />
                  <Skeleton className="h-3 w-28 mb-2" />
                  <Skeleton className="h-5 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          </>
        ) : !featuredPost && articles.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No blog posts published yet.</p>
        ) : (
          <>
            {featuredPost && (
              <div className="mb-14 grid grid-cols-1 gap-6 overflow-visible pb-2 pr-2 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
                <Link to={getBlogUrl(featuredPost)} className="group block overflow-hidden">
                  <div className="aspect-[4/3] h-full min-h-[260px] lg:aspect-auto lg:min-h-[340px]">
                    <img
                      src={featuredImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex min-h-[260px] flex-col justify-center border border-foreground bg-[#F2F0E4] px-8 py-10 shadow-[6px_6px_0_0_#000] md:px-10 md:py-12 lg:min-h-[340px]">
                  <p className="mb-4 text-xs text-muted-foreground">
                    {formatBlogDate(featuredPost.created_at)} • {estimateReadTime(featuredPost.content)} min
                  </p>
                  <h2 className="font-display text-2xl md:text-[2rem] text-foreground mb-5 leading-tight">
                    {featuredPost.title}
                  </h2>
                  <p className="mb-8 text-sm leading-relaxed text-muted-foreground line-clamp-5">
                    {getExcerpt(featuredPost, 280)}
                  </p>
                  <Link
                    to={getBlogUrl(featuredPost)}
                    className="inline-flex w-fit items-center justify-center rounded-md border border-foreground px-8 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    Read More
                  </Link>
                </div>
              </div>
            )}

            {articles.length > 0 && (
              <>
                <h2 className="font-display italic text-[32.02px] leading-[100%] tracking-[-0.02em] font-normal text-foreground mb-8">
                  Weekly Most Read <span aria-hidden="true">🔥</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {articles.map((article, i) => (
                    <BlogCard
                      key={article.id}
                      article={article}
                      imageIndex={(currentPage - 1) * ITEMS_PER_PAGE + i}
                    />
                  ))}
                </div>
              </>
            )}

            {!featuredPost && articles.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No more posts yet.</p>
            )}

            {totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-between gap-4"
                aria-label="Blog pagination"
              >
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="text-sm font-medium text-foreground disabled:opacity-40 hover:text-primary transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2">
                  {pageNumbers().map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      aria-current={currentPage === page ? "page" : undefined}
                      className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="text-sm font-medium text-foreground disabled:opacity-40 hover:text-primary transition-colors"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </PageLayout>
  );
};

export default Blogs;
