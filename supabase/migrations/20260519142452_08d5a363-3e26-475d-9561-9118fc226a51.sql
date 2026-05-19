
CREATE TABLE public.foretag (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namn text NOT NULL,
  organisationsnummer text,
  epost text,
  telefon text,
  adress text,
  bransch text DEFAULT 'Betong & Prefab',
  skapad_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.avdelningar (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foretag_id uuid REFERENCES public.foretag(id) ON DELETE CASCADE,
  namn text NOT NULL,
  farg text,
  skapad_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.personal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foretag_id uuid REFERENCES public.foretag(id) ON DELETE CASCADE,
  avdelning_id uuid REFERENCES public.avdelningar(id) ON DELETE SET NULL,
  fornamn text NOT NULL,
  efternamn text NOT NULL,
  roll text,
  telefon text,
  epost text,
  anstallningstyp text,
  bemanningsbolag text,
  startdatum date,
  framsteg integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ej_paborjat',
  skapad_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.certifikat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personal_id uuid REFERENCES public.personal(id) ON DELETE CASCADE,
  foretag_id uuid REFERENCES public.foretag(id) ON DELETE CASCADE,
  certifikattyp text NOT NULL,
  utfardat date,
  utgaar date,
  status text,
  skapad_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.bemanningspartners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  foretag_id uuid REFERENCES public.foretag(id) ON DELETE CASCADE,
  namn text NOT NULL,
  ort text,
  epost text,
  telefon text,
  skapad_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.foretag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avdelningar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifikat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bemanningspartners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth read foretag" ON public.foretag FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write foretag" ON public.foretag FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update foretag" ON public.foretag FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete foretag" ON public.foretag FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth read avdelningar" ON public.avdelningar FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write avdelningar" ON public.avdelningar FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update avdelningar" ON public.avdelningar FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete avdelningar" ON public.avdelningar FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth read personal" ON public.personal FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write personal" ON public.personal FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update personal" ON public.personal FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete personal" ON public.personal FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth read certifikat" ON public.certifikat FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write certifikat" ON public.certifikat FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update certifikat" ON public.certifikat FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete certifikat" ON public.certifikat FOR DELETE TO authenticated USING (true);

CREATE POLICY "auth read bemanningspartners" ON public.bemanningspartners FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth write bemanningspartners" ON public.bemanningspartners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update bemanningspartners" ON public.bemanningspartners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth delete bemanningspartners" ON public.bemanningspartners FOR DELETE TO authenticated USING (true);
