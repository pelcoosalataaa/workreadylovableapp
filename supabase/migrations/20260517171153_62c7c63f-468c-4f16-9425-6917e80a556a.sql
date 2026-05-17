CREATE POLICY "Public can view moduler"
ON public.moduler
FOR SELECT
TO anon, authenticated
USING (true);