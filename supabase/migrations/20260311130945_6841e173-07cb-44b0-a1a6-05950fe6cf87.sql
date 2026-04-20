
DROP POLICY IF EXISTS "Anyone can submit a query" ON public.queries;
CREATE POLICY "Anyone can submit a query" ON public.queries FOR INSERT TO anon, authenticated WITH CHECK (true);
