-- Product color variations
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_color_variations BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.product_color_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color_hex TEXT NOT NULL CHECK (color_hex IN ('#89512a', '#ffffff', '#ede8d0', '#fb13d2')),
  color_label TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (product_id, color_hex)
);

CREATE INDEX IF NOT EXISTS idx_product_color_variants_product_id
  ON public.product_color_variants(product_id);

CREATE TRIGGER update_product_color_variants_updated_at
  BEFORE UPDATE ON public.product_color_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_color_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product color variants"
  ON public.product_color_variants FOR SELECT USING (true);

CREATE POLICY "Admins can manage product color variants"
  ON public.product_color_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
