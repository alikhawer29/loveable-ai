
-- The "Anyone can submit a query" INSERT policy is intentionally permissive for anonymous contact forms.
-- Tighten storage policies to require admin role for uploads/deletes.
DROP POLICY IF EXISTS "Auth users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can delete product images" ON storage.objects;

CREATE POLICY "Admins can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'));
