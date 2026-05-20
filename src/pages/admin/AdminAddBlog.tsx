// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { slugify, ensureUniqueBlogSlug } from "@/lib/slug-utils";
import { uploadBlogFeaturedImage, setSingleFeaturedBlog } from "@/lib/blog-admin";

const AdminAddBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugManual && title) {
      setSlug(slugify(title));
    }
  }, [title, slugManual]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (!content.trim() || content === "<br>") e.content = "Content is required";
    if (!file) e.image = "Featured image is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = () => {
    if (validate()) setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const uniqueSlug = await ensureUniqueBlogSlug(slugify(slug.trim()));

      const { data: blog, error } = await supabase
        .from("blogs")
        .insert({
          title: title.trim(),
          slug: uniqueSlug,
          content: content.trim(),
          status,
          is_featured: isFeatured,
        })
        .select("id")
        .single();

      if (error) throw error;

      if (file && blog) {
        const imageUrl = await uploadBlogFeaturedImage(blog.id, file);
        if (imageUrl) {
          await supabase.from("blogs").update({ featured_image_url: imageUrl }).eq("id", blog.id);
        }
      }

      if (isFeatured && blog) {
        await setSingleFeaturedBlog(blog.id, true);
        await supabase.from("blogs").update({ is_featured: true }).eq("id", blog.id);
      }

      setSuccessOpen(true);
    } catch (err: any) {
      setErrors({ title: err.message || "Failed to save blog" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-[46px] font-semibold text-foreground mb-6">Add New Blog</h1>
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
          <Input placeholder="Enter blog title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Slug (auto-generated)</label>
          <Input
            placeholder="blog-post-slug"
            value={slug}
            onChange={(e) => {
              setSlugManual(true);
              setSlug(slugify(e.target.value));
            }}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">URL: /blog/{slug || "your-slug"}</p>
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Content *</label>
          <RichTextEditor value={content} onChange={setContent} placeholder="Write your blog content..." />
          {errors.content && <p className="text-xs text-destructive mt-1">{errors.content}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Featured Image *</label>
          {filePreview ? (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img src={filePreview} alt="Preview" className="w-full aspect-video object-cover" />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setFilePreview("");
                }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 rounded hover:bg-background"
              >
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg p-10 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-primary/50 mb-2" />
              <span className="text-sm text-muted-foreground">Upload featured image</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
          {errors.image && <p className="text-xs text-destructive mt-1">{errors.image}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Status *</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
          <div>
            <Label htmlFor="featured-blog" className="text-sm font-medium">
              Featured Blog
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show as the main featured post on the blogs page
            </p>
          </div>
          <Switch id="featured-blog" checked={isFeatured} onCheckedChange={setIsFeatured} />
        </div>

        <Button className="btn-plum border-0 px-10" onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Blog"}
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Add New Blog?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are you sure you want to save this blog post?</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={handleConfirm}>
              Yes
            </Button>
            <Button
              variant="outline"
              className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setConfirmOpen(false)}
            >
              No
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[hsl(142_70%_90%)] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-[hsl(142_70%_45%)]" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Blog has been added successfully.</p>
          <Button
            className="btn-plum border-0 px-10"
            onClick={() => {
              setSuccessOpen(false);
              navigate("/admin/blogs");
            }}
          >
            Okay
          </Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAddBlog;
