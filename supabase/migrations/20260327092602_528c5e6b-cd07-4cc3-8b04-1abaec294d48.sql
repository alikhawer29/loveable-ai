
INSERT INTO storage.buckets (id, name, public) VALUES ('guideline-media', 'guideline-media', true);

CREATE POLICY "Anyone can view guideline media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guideline-media');

CREATE POLICY "Admins can upload guideline media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'guideline-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update guideline media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'guideline-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete guideline media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'guideline-media' AND public.has_role(auth.uid(), 'admin'));
