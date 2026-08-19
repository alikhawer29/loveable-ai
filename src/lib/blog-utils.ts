import blog1 from "@/assets/blog-1.png";
import blog2 from "@/assets/blog-2.png";
import blog3 from "@/assets/blog-3.png";
import blog4 from "@/assets/blog-4.png";
import blog5 from "@/assets/blog-5.png";
import blog6 from "@/assets/blog-6.png";
import blog7 from "@/assets/blog-7.png";

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

const BLOG_CARD_IMAGES = [blog1, blog2, blog3, blog4, blog5, blog6, blog7];

/** Blog 1.png → index 0, Blog 2.png → index 1, … */
export function getBlogCardImage(index: number): string {
  const i = ((index % BLOG_CARD_IMAGES.length) + BLOG_CARD_IMAGES.length) % BLOG_CARD_IMAGES.length;
  return BLOG_CARD_IMAGES[i];
}

export function getBlogImage(article: Pick<BlogPost, "id" | "featured_image_url">): string {
  if (article.featured_image_url) return article.featured_image_url;
  const seed = article.id || "0";
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return getBlogCardImage(hash);
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
