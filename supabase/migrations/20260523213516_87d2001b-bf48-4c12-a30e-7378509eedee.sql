-- 1) Remove client-writable INSERT policy on resultat — server function will insert via service role
DROP POLICY IF EXISTS "spara eget resultat" ON public.resultat;

-- 2) Add UPDATE/DELETE storage policies on 'kurser' bucket (chef-only, own folder)
CREATE POLICY "chefer kan uppdatera egna kursvideor"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'kurser'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.get_roll(auth.uid()) = 'chef'
)
WITH CHECK (
  bucket_id = 'kurser'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.get_roll(auth.uid()) = 'chef'
);

CREATE POLICY "chefer kan radera egna kursvideor"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'kurser'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND public.get_roll(auth.uid()) = 'chef'
);

-- 3) Revoke EXECUTE on SECURITY DEFINER helpers from signed-in/public roles
--    They are used inside RLS policies, which run as table owner, so RLS still works.
REVOKE EXECUTE ON FUNCTION public.get_foretag_id(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_roll(uuid) FROM PUBLIC, anon, authenticated;