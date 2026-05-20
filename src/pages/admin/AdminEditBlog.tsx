// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { slugify, ensureUniqueBlogSlug } from "@/lib/slug-utils";
import { uploadBlogFeaturedImage, setSingleFeaturedBlog } from "@/lib/blog-admin";

const AdminEditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [existingImage, setExistingImage] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreview, setNewFilePreview] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("blogs").select("*").eq("id", id).maybeSingle();
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content || "");
        setStatus(data.status);
        setIsFeatured(data.is_featured);
        if (data.featured_image_url) setExistingImage(data.featured_image_url);
      }
    };
    if (id) fetch();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setNewFile(selected);
      setNewFilePreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdate = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Title is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (!content.trim() || content === "<br>") e.content = "Content is required";
    if (!existingImage && !newFile) e.image = "Featured image is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      const uniqueSlug = await ensureUniqueBlogSlug(slugify(slug.trim()), id);
      let imageUrl = existingImage;

      if (newFile && id) {
        const uploaded = await uploadBlogFeaturedImage(id, newFile);
        if (uploaded) imageUrl = uploaded;
      }

      const { error } = await supabase
        .from("blogs")
        .update({
          title: title.trim(),
          slug: uniqueSlug,
          content: content.trim(),
          status,
          is_featured: isFeatured,
          featured_image_url: imageUrl || null,
        })
        .eq("id", id);

      if (error) throw error;

      if (isFeatured && id) {
        await setSingleFeaturedBlog(id, true);
        await supabase.from("blogs").update({ is_featured: true }).eq("id", id);
      }

      setSuccessOpen(true);
    } catch (err: any) {
      setErrors({ title: err.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const displayImage = newFilePreview || existingImage;

  return (
    <AdminLayout>
      <h1 className="font-display text-[46px] font-semibold text-foreground mb-6">Edit Blog</h1>
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 max-w-3xl space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
          <Input
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">URL: /blog/{slug}</p>
          {errors.slug && <p className="text-xs text-destructive mt-1">{errors.slug}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Content *</label>
          <RichTextEditor value={content} onChange={setContent} />
          {errors.content && <p className="text-xs text-destructive mt-1">{errors.content}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Featured Image *</label>
          {displayImage && (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img src={displayImage} alt="Featured" className="w-full aspect-video object-cover" />
              <button
                type="button"
                onClick={() => {
                  setExistingImage("");
                  setNewFile(null);
                  setNewFilePreview("");
                }}
                className="absolute top-2 right-2 p-1.5 bg-background/80 rounded hover:bg-background"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Upload className="h-5 w-5 text-primary/50" />
            {displayImage ? "Replace image" : "Upload image"}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
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
            <Label htmlFor="featured-blog-edit" className="text-sm font-medium">
              Featured Blog
            </Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Show as the main featured post on the blogs page
            </p>
          </div>
          <Switch id="featured-blog-edit" checked={isFeatured} onCheckedChange={setIsFeatured} />
        </div>

        <Button className="btn-plum border-0 px-10" onClick={handleUpdate} disabled={saving}>
          {saving ? "Updating..." : "Update Blog"}
        </Button>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-[hsl(142_70%_90%)] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-[hsl(142_70%_45%)]" />
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Blog has been updated successfully.</p>
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

export default AdminEditBlog;
