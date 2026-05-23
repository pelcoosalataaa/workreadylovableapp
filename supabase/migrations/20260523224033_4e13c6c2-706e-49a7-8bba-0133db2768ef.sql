-- Fix resultat SELECT policy: use get_foretag_id() instead of comparing foretag_id to a user uuid
DROP POLICY IF EXISTS "se företagets resultat" ON public.resultat;
CREATE POLICY "se företagets resultat"
ON public.resultat
FOR SELECT
TO authenticated
USING (
  anvandare_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.kurser k
    WHERE k.id = resultat.kurs_id
      AND k.foretag_id = public.get_foretag_id(auth.uid())
  )
);

-- Restrict 'moduler' storage bucket writes to chefs
DROP POLICY IF EXISTS "Users upload own moduler videos" ON storage.objects;
DROP POLICY IF EXISTS "Users update own moduler videos" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own moduler videos" ON storage.objects;

CREATE POLICY "Chefs upload own moduler videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'moduler'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.get_roll(auth.uid()) = 'chef'
);

CREATE POLICY "Chefs update own moduler videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'moduler'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.get_roll(auth.uid()) = 'chef'
)
WITH CHECK (
  bucket_id = 'moduler'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.get_roll(auth.uid()) = 'chef'
);

CREATE POLICY "Chefs delete own moduler videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'moduler'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND public.get_roll(auth.uid()) = 'chef'
);