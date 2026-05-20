export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  featured_image_url: string | null;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

/** @deprecated Use BlogPost — kept for gradual migration */
export type BlogArticle = BlogPost & {
  image_url?: string | null;
  video_url?: string | null;
};

const PLACEHOLDER = "/placeholder.svg";

export function getBlogImage(article: Pick<BlogPost, "featured_image_url">): string {
  return article.featured_image_url || PLACEHOLDER;
}

export function getBlogUrl(article: Pick<BlogPost, "slug">): string {
  return `/blog/${article.slug}`;
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function formatBlogDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
}

export function formatBlogDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function estimateReadTime(content: string | null | undefined): number {
  const text = stripHtml(content || "");
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function getExcerpt(
  post: Pick<BlogPost, "content">,
  maxLength = 140
): string {
  const text = stripHtml(post.content || "");
  if (!text) return "Read more about plants, care tips, and the latest from our team.";
  return text.length <= maxLength ? text : `${text.slice(0, maxLength).trim()}…`;
}
