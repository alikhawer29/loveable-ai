import { supabase } from "@/integrations/supabase/client";

export async function uploadBlogFeaturedImage(blogId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const filePath = `${blogId}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from("blog-media")
    .upload(filePath, file, { upsert: true });
  if (uploadErr) {
    console.error("Blog image upload failed:", uploadErr);
    return null;
  }
  const { data: urlData } = supabase.storage.from("blog-media").getPublicUrl(filePath);
  return urlData.publicUrl;
}

export async function setSingleFeaturedBlog(blogId: string, isFeatured: boolean) {
  if (!isFeatured) return;
  await supabase.from("blogs").update({ is_featured: false }).neq("id", blogId);
}
