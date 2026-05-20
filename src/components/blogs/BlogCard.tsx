import { Link } from "react-router-dom";
import {
  type BlogPost,
  formatBlogDate,
  estimateReadTime,
  getExcerpt,
  getBlogImage,
  getBlogUrl,
} from "@/lib/blog-utils";

interface BlogCardProps {
  article: BlogPost;
  showReadMore?: boolean;
}

export function BlogCard({ article, showReadMore = true }: BlogCardProps) {
  const readMins = estimateReadTime(article.content);

  return (
    <article className="flex flex-col">
      <Link to={getBlogUrl(article)} className="group block">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted mb-4">
          <img
            src={getBlogImage(article)}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <p className="text-xs text-muted-foreground mb-2">
          {formatBlogDate(article.created_at)} • {readMins} min
        </p>
        <h3 className="font-display text-lg text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {getExcerpt(article)}
        </p>
      </Link>
      {showReadMore && (
        <Link
          to={getBlogUrl(article)}
          className="mt-4 inline-flex w-fit items-center justify-center rounded-sm border border-foreground/80 px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          Read More
        </Link>
      )}
    </article>
  );
}
