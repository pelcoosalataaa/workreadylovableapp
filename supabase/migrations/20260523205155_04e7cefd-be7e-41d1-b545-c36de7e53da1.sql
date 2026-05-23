
drop table if exists public.certifikat cascade;
drop table if exists public.bemanningspartners cascade;
drop table if exists public.personal cascade;
drop table if exists public.avdelningar cascade;
drop table if exists public.foretag cascade;
drop table if exists public.moduler cascade;

create table public.anvandare (
  id uuid primary key references auth.users(id) on delete cascade,
  foretag_id uuid not null,
  foretag_namn text not null,
  namn text not null,
  epost text not null,
  roll text not null check (roll in ('chef','anstalld')),
  skapad_at timestamptz not null default now()
);
alter table public.anvandare enable row level security;

create or replace function public.get_foretag_id(_uid uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select foretag_id from public.anvandare where id = _uid
$$;

create or replace function public.get_roll(_uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select roll from public.anvandare where id = _uid
$$;

create policy "se egen + företagets användare" on public.anvandare
for select to authenticated
using (id = auth.uid() or foretag_id = public.get_foretag_id(auth.uid()));

create policy "skapa egen rad" on public.anvandare
for insert to authenticated with check (id = auth.uid());

create policy "uppdatera egen rad" on public.anvandare
for update to authenticated using (id = auth.uid());

create table public.kurser (
  id uuid primary key default gen_random_uuid(),
  foretag_id uuid not null,
  titel text not null,
  steg jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  transkription text,
  skapad_at timestamptz not null default now()
);
alter table public.kurser enable row level security;

create policy "se företagets kurser" on public.kurser
for select to authenticated
using (foretag_id = public.get_foretag_id(auth.uid()));

create policy "chefer kan skapa kurser" on public.kurser
for insert to authenticated
with check (foretag_id = auth.uid() and public.get_roll(auth.uid()) = 'chef');

create policy "chefer kan uppdatera egna kurser" on public.kurser
for update to authenticated
using (foretag_id = auth.uid());

create policy "chefer kan radera egna kurser" on public.kurser
for delete to authenticated
using (foretag_id = auth.uid());

create table public.resultat (
  id uuid primary key default gen_random_uuid(),
  kurs_id uuid not null references public.kurser(id) on delete cascade,
  anvandare_id uuid not null references auth.users(id) on delete cascade,
  godkand boolean not null,
  poang integer not null,
  skapad_at timestamptz not null default now()
);
alter table public.resultat enable row level security;

create policy "se företagets resultat" on public.resultat
for select to authenticated
using (
  anvandare_id = auth.uid()
  or exists (
    select 1 from public.kurser k
    where k.id = kurs_id and k.foretag_id = auth.uid()
  )
);

create policy "spara eget resultat" on public.resultat
for insert to authenticated
with check (anvandare_id = auth.uid());

insert into storage.buckets (id, name, public) values ('kurser', 'kurser', false)
on conflict (id) do nothing;

create policy "chefer kan ladda upp videor" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'kurser'
  and public.get_roll(auth.uid()) = 'chef'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "chefer ser egna videor" on storage.objects
for select to authenticated
using (
  bucket_id = 'kurser'
  and (storage.foldername(name))[1] = auth.uid()::text
);

revoke execute on function public.get_foretag_id(uuid) from public, anon;
revoke execute on function public.get_roll(uuid) from public, anon;
grant execute on function public.get_foretag_id(uuid) to authenticated;
grant execute on function public.get_roll(uuid) to authenticated;
