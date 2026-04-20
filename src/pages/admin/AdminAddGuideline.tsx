// @ts-nocheck
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminAddGuideline = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [status, setStatus] = useState("published");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = "Article title is required";
    if (!detail.trim()) e.detail = "Article detail is required";
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

  const handleSubmit = () => { if (validate()) setConfirmOpen(true); };

  const handleConfirm = async () => {
    setConfirmOpen(false);
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("guidelines_articles")
        .select("id")
        .ilike("title", title.trim())
        .maybeSingle();
      if (existing) {
        setErrors({ title: "An article with this title already exists" });
        return;
      }

      const { data: article, error } = await supabase.from("guidelines_articles").insert({
        title: title.trim(),
        content: detail.trim(),
        status,
      }).select("id").single();
      if (error) throw error;

      // Upload image if selected
      if (file && article) {
        const ext = file.name.split(".").pop();
        const filePath = `${article.id}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("guideline-media")
          .upload(filePath, file, { upsert: true });
        if (!uploadErr) {
          const { data: urlData } = supabase.storage
            .from("guideline-media")
            .getPublicUrl(filePath);
          await supabase.from("guidelines_articles")
            .update({ image_url: urlData.publicUrl })
            .eq("id", article.id);
        }
      }

      setSuccessOpen(true);
    } catch (err: any) {
      setErrors({ title: err.message || "Failed to save article" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-6">Create New Gardening Article</h1>
      <div className="bg-card rounded-xl border border-border p-6 lg:p-8 max-w-2xl">
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Article Title</label>
          <Input placeholder="Enter Article Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
        </div>
        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground mb-1.5">Article Detailed</label>
          <Textarea placeholder="Enter Article Detailed" value={detail} onChange={(e) => setDetail(e.target.value)} rows={6} />
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Upload Image*</label>
          {filePreview ? (
            <div className="relative rounded-lg overflow-hidden mb-3">
              <img src={filePreview} alt="Preview" className="w-full aspect-video object-cover" />
              <button onClick={() => { setFile(null); setFilePreview(""); }} className="absolute top-2 right-2 p-1.5 bg-background/80 rounded hover:bg-background">
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 rounded-lg p-10 cursor-pointer hover:bg-muted/50 transition-colors">
              <Upload className="h-8 w-8 text-primary/50 mb-2" />
              <span className="text-sm text-muted-foreground">Upload File</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>
        <Button className="btn-plum border-0 px-10" onClick={handleSubmit} disabled={saving}>{saving ? "Saving..." : "Add Article"}</Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(0_70%_93%)] flex items-center justify-center"><AlertCircle className="h-8 w-8 text-destructive" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Create New Gardening Article?</h3>
          <p className="text-sm text-muted-foreground mb-6">Are You Sure You Want To Add New Article</p>
          <div className="flex gap-4 justify-center">
            <Button className="btn-plum border-0 flex-1 max-w-[140px]" onClick={handleConfirm}>Yes</Button>
            <Button variant="outline" className="flex-1 max-w-[140px] border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => setConfirmOpen(false)}>No</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm p-8 text-center">
          <div className="flex justify-center mb-4"><div className="h-16 w-16 rounded-full bg-[hsl(142_70%_90%)] flex items-center justify-center"><CheckCircle2 className="h-8 w-8 text-[hsl(142_70%_45%)]" /></div></div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Successful</h3>
          <p className="text-sm text-muted-foreground mb-6">New Gardening Article Has Been Added Successfully.</p>
          <Button className="btn-plum border-0 px-10" onClick={() => { setSuccessOpen(false); navigate("/admin/guidelines"); }}>Okay</Button>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAddGuideline;
