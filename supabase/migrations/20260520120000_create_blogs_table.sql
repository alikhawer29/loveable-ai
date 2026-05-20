-- Blogs (separate from guidelines_articles)
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  featured_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX blogs_status_idx ON public.blogs (status);
CREATE INDEX blogs_slug_idx ON public.blogs (slug);
CREATE INDEX blogs_is_featured_idx ON public.blogs (is_featured) WHERE is_featured = true;

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs"
  ON public.blogs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage blogs"
  ON public.blogs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Blog media storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-media', 'blog-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view blog media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-media');

CREATE POLICY "Admins can upload blog media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog media"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog media"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-media' AND public.has_role(auth.uid(), 'admin'));
