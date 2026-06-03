-- Replace color variations with pod design variations
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_design_variations BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.product_design_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  design_name TEXT NOT NULL,
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_design_variants_product_id
  ON public.product_design_variants(product_id);

CREATE TRIGGER update_product_design_variants_updated_at
  BEFORE UPDATE ON public.product_design_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_design_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product design variants"
  ON public.product_design_variants FOR SELECT USING (true);

CREATE POLICY "Admins can manage product design variants"
  ON public.product_design_variants FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Migrate existing color variant data when present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'product_color_variants'
  ) THEN
    INSERT INTO public.product_design_variants (
      product_id, design_name, images, stock, is_default, sort_order
    )
    SELECT
      pcv.product_id,
      COALESCE(NULLIF(trim(pcv.color_label), ''), pcv.color_hex),
      pcv.images,
      pcv.stock,
      pcv.is_default,
      ROW_NUMBER() OVER (PARTITION BY pcv.product_id ORDER BY pcv.is_default DESC, pcv.created_at) - 1
    FROM public.product_color_variants pcv;

    UPDATE public.products p
    SET has_design_variations = true
    WHERE p.has_color_variations = true;

    DROP TABLE public.product_color_variants;
  END IF;
END $$;

ALTER TABLE public.products DROP COLUMN IF EXISTS has_color_variations;
