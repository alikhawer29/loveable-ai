import { Link, useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BlogCard } from "@/components/blogs/BlogCard";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type BlogPost,
  formatBlogDateShort,
  estimateReadTime,
  getBlogImage,
} from "@/lib/blog-utils";

const BLOG_SELECT =
  "id, title, slug, content, featured_image_url, status, is_featured, created_at";

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const { data } = await supabase
          .from("blogs")
          .select(BLOG_SELECT)
          .eq("slug", slug)
          .eq("status", "published")
          .maybeSingle();

        const post = data as BlogPost | null;
        setArticle(post);

        if (post) {
          const { data: related } = await supabase
            .from("blogs")
            .select(BLOG_SELECT)
            .eq("status", "published")
            .neq("id", post.id)
            .order("created_at", { ascending: false })
            .limit(2);
          setRelatedArticles((related as BlogPost[]) || []);
        }
      } catch (err) {
        console.error("Failed to fetch blog post:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <div className="container py-6 md:py-10">
            <div className="mx-auto w-full max-w-4xl">
              <Skeleton className="h-6 w-16 mb-8" />
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-4 w-40 mx-auto mb-8" />
              <Skeleton className="aspect-[16/9] rounded-lg mb-10" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
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
          <div className="mx-auto max-w-4xl">
            <h1 className="font-display text-3xl md:text-[46px] text-foreground mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <button type="button" onClick={() => navigate("/blogs")} className="btn-plum rounded-sm text-sm">
              Back to Blogs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readMins = estimateReadTime(article.content);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-6 md:py-10">
        {/* Back */}
        <button onClick={() => navigate("/blogs")} className="flex items-center gap-2 text-sm text-foreground mb-6 hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Blog detail */}
        <article className="mx-auto w-full max-w-4xl">
          <header className="mb-8 text-center">
            <h1 className="font-display text-3xl md:text-[46px] text-foreground mb-3 leading-tight">
              {article.title}
            </h1>
            <p className="text-xs text-primary">
              {formatBlogDateShort(article.created_at)} — {readMins} min read
            </p>
          </header>

          <div className="mb-10 overflow-hidden rounded-lg bg-muted">
            <img
              src={getBlogImage(article)}
              alt={article.title}
              className="w-full aspect-[16/9] object-cover"
            />
          </div>

          <div
            className="prose prose-sm md:prose-base max-w-none text-foreground/90 prose-headings:font-display prose-headings:text-foreground prose-p:leading-relaxed prose-a:text-primary prose-img:rounded-lg prose-img:w-full"
            dangerouslySetInnerHTML={{ __html: article.content || "" }}
          />
        </article>

        {relatedArticles.length > 0 && (
          <section className="container mx-auto pb-14 md:pb-20 max-w-6xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
              <h2 className="font-display text-2xl md:text-[46px] text-foreground leading-tight">
                More News And Events
              </h2>
              <Link to="/blogs" className="btn-plum rounded-sm text-xs uppercase tracking-wider px-6 shrink-0">
                Read More
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
              {relatedArticles.map((post) => (
                <BlogCard key={post.id} article={post} showReadMore={false} />
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetail;
