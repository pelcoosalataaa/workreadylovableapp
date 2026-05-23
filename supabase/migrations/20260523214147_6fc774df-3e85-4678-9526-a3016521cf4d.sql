-- Explicit deny-all policy on kurs_facit. Service role bypasses RLS, so server functions still work.
CREATE POLICY "ingen klientåtkomst"
ON public.kurs_facit FOR ALL TO authenticated, anon
USING (false) WITH CHECK (false);