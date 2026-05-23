DROP POLICY IF EXISTS "uppdatera egen rad" ON public.anvandare;

CREATE POLICY "uppdatera egen rad utan privilegier"
  ON public.anvandare FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND foretag_id  = (SELECT foretag_id  FROM public.anvandare WHERE id = auth.uid())
    AND foretag_namn = (SELECT foretag_namn FROM public.anvandare WHERE id = auth.uid())
    AND roll        = (SELECT roll        FROM public.anvandare WHERE id = auth.uid())
  );