// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminViewBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      setBlog(data);
      setLoading(false);
    };
    if (id) fetch();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Loading...</p>
      </AdminLayout>
    );
  }

  if (!blog) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Blog not found.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin/blogs")}
            className="text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="font-display text-[46px] font-semibold text-foreground">View Blog</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/blogs/${id}/edit`)}>
            Edit
          </Button>
          {blog.status === "published" && (
            <Button variant="outline" asChild>
              <Link to={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View on site
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 max-w-4xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Title</p>
            <p className="font-medium text-foreground">{blog.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Slug</p>
            <p className="font-mono text-sm text-foreground">/blog/{blog.slug}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <p className="font-medium text-foreground capitalize">{blog.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Featured Blog</p>
            <p className="font-medium text-foreground inline-flex items-center gap-1">
              {blog.is_featured ? (
                <>
                  <Star className="h-4 w-4 fill-primary text-primary" /> Yes
                </>
              ) : (
                "No"
              )}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-sm text-muted-foreground mb-1">Added On</p>
            <p className="font-medium text-foreground">
              {new Date(blog.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {blog.featured_image_url && (
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">Featured Image</p>
            <img
              src={blog.featured_image_url}
              alt={blog.title}
              className="max-w-2xl w-full rounded-lg aspect-video object-cover"
            />
          </div>
        )}

        <div>
          <p className="text-sm text-muted-foreground mb-2">Content</p>
          <div
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: blog.content || "" }}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminViewBlog;
