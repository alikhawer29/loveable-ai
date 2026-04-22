// @ts-nocheck
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, Upload, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminEditGuideline = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("published");
  const [existingImage, setExistingImage] = useState("");
  const [existingVideo, setExistingVideo] = useState("");
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newFilePreview, setNewFilePreview] = useState("");
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoPreview, setNewVideoPreview] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("guidelines_articles").select("*").eq("id", id).maybeSingle();
      if (data) {
        setTitle(data.title);
        setDetail(data.content || "");
        setStatus(data.status);
        if (data.image_url) setExistingImage(data.image_url);
        if (data.video_url) setExistingVideo(data.video_url);
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

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type.startsWith('video/')) {
      setNewVideoFile(selected);
      setNewVideoPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpdate = async () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Required";
    if (!detail.trim()) e.detail = "Required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSaving(true);
    try {
      let imageUrl = existingImage;
      let videoUrl = existingVideo;

      // Upload new image if selected
      if (newFile && id) {
        const ext = newFile.name.split(".").pop();
        const filePath = `${id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("guideline-media")
          .upload(filePath, newFile, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("guideline-media")
            .getPublicUrl(filePath);
          imageUrl = urlData.publicUrl;
        }
      }

      // Upload new video if selected
      if (newVideoFile && id) {
        const ext = newVideoFile.name.split(".").pop();
        const videoFilePath = `${id}-video.${ext}`;
        const { error: videoUploadErr } = await supabase.storage
          .from("guideline-media")
          .upload(videoFilePath, newVideoFile, { upsert: true });
        if (!videoUploadErr) {
          const { data: videoUrlData } = supabase.storage
            .from("guideline-media")
            .getPublicUrl(videoFilePath);
          videoUrl = videoUrlData.publicUrl;
        }
      }

      const { error } = await supabase.from("guidelines_articles")
        .update({
          title: title.trim(),
          content: detail.trim(),
          status,
          image_url: imageUrl || null,
          video_url: videoUrl || null
        })
        .eq("id", id);
      if (error) throw error;
      setSuccessOpen(true);
    } catch (err: any) {
      setErrors({ title: err.message || "Update failed" });
    } finally {
      setSaving(false);
    }
  };

  const displayImage = newFilePreview || existingImage;
  const displayVideo = newVideoPreview || existingVideo;

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">Edit Article</h1>
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 max-w-2xl">
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Article Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Article Detailed</label>
          <Textarea value={detail} onChange={(e) => setDetail(e.target.value)} rows={6} />
          {errors.detail && <p className="text-xs text-destructive mt-1">{errors.detail}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Status*</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground">
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">Upload Image (Optional)</label>
          {displayImage && (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img src={displayImage} alt="Current media" className="w-full aspect-video object-cover" />
              <button onClick={() => { setExistingImage(""); setNewFile(null); setNewFilePreview(""); }} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded hover:bg-background">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Upload className="h-5 w-5 text-primary/50" /> {displayImage ? "Replace Image" : "Upload Image"}
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">Upload Video (Optional)</label>
          {displayVideo && (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <video src={displayVideo} controls className="w-full aspect-video object-cover" />
              <button onClick={() => { setExistingVideo(""); setNewVideoFile(null); setNewVideoPreview(""); }} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded hover:bg-background">
                <Trash2 className="h-4 w-4 text-destructive" />
              </button>
            </div>
          )}
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Upload className="h-5 w-5 text-primary/50" /> {displayVideo ? "Replace Video" : "Upload Video"}
            <input type="file" className="hidden" accept="video/*" onChange={handleVideoChange} />
          </label>
        </div>
        <Button className="btn-plum border-0 px-10" onClick={handleUpdate} disabled={saving}>{saving ? "Updating..." : "Update"}</Button>
      </div>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(142_70%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(142_70%_45%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">Gardening Article Has Been Updated Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/guidelines"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminEditGuideline;
