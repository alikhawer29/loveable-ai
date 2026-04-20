
-- Fix queries INSERT policy to allow both anon and authenticated users
DROP POLICY IF EXISTS "Anyone can submit a query" ON public.queries;
CREATE POLICY "Anyone can submit a query" ON public.queries FOR INSERT TO public, authenticated WITH CHECK (true);
