-- 1) Remove client-side INSERT policy on anvandare (signups happen server-side via admin client)
DROP POLICY IF EXISTS "skapa egen rad" ON public.anvandare;

-- 2) Tighten kurser write policies
DROP POLICY IF EXISTS "chefer kan skapa kurser" ON public.kurser;
DROP POLICY IF EXISTS "chefer kan uppdatera egna kurser" ON public.kurser;
DROP POLICY IF EXISTS "chefer kan radera egna kurser" ON public.kurser;

-- Add chef_id (creator) for accurate ownership
ALTER TABLE public.kurser
  ADD COLUMN IF NOT EXISTS chef_id uuid;

-- Backfill chef_id from foretag_id (in this app, the chef's user id equals foretag_id at chef registration)
UPDATE public.kurser SET chef_id = foretag_id WHERE chef_id IS NULL;
ALTER TABLE public.kurser ALTER COLUMN chef_id SET NOT NULL;

CREATE POLICY "chefer skapar kurs i eget foretag"
ON public.kurser FOR INSERT TO authenticated
WITH CHECK (
  chef_id = auth.uid()
  AND foretag_id = public.get_foretag_id(auth.uid())
  AND public.get_roll(auth.uid()) = 'chef'
);

CREATE POLICY "chef uppdaterar egen kurs"
ON public.kurser FOR UPDATE TO authenticated
USING (chef_id = auth.uid() AND public.get_roll(auth.uid()) = 'chef')
WITH CHECK (chef_id = auth.uid() AND foretag_id = public.get_foretag_id(auth.uid()));

CREATE POLICY "chef raderar egen kurs"
ON public.kurser FOR DELETE TO authenticated
USING (chef_id = auth.uid() AND public.get_roll(auth.uid()) = 'chef');

-- 3) Move quiz correct answers into a separate, server-only table
CREATE TABLE IF NOT EXISTS public.kurs_facit (
  kurs_id uuid PRIMARY KEY REFERENCES public.kurser(id) ON DELETE CASCADE,
  ratt_svar integer[] NOT NULL,
  skapad_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.kurs_facit ENABLE ROW LEVEL SECURITY;
-- No policies = no client access. Only service role (server admin client) can read/write.

-- Backfill existing answers from kurser.quiz into kurs_facit, then strip ratt_svar from quiz
INSERT INTO public.kurs_facit (kurs_id, ratt_svar)
SELECT k.id,
       ARRAY(
         SELECT COALESCE((q->>'ratt_svar')::int, 0)
         FROM jsonb_array_elements(k.quiz) q
       )
FROM public.kurser k
WHERE NOT EXISTS (SELECT 1 FROM public.kurs_facit f WHERE f.kurs_id = k.id)
  AND jsonb_typeof(k.quiz) = 'array';

UPDATE public.kurser
SET quiz = COALESCE((
  SELECT jsonb_agg(q - 'ratt_svar')
  FROM jsonb_array_elements(quiz) q
), '[]'::jsonb)
WHERE jsonb_typeof(quiz) = 'array';