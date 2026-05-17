
-- Storage bucket for videos
insert into storage.buckets (id, name, public) values ('moduler', 'moduler', false)
on conflict (id) do nothing;

-- moduler table
create table if not exists public.moduler (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  steg jsonb not null default '[]'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  transkription text,
  skapad_av text,
  kategori text,
  created_at timestamptz not null default now()
);

alter table public.moduler enable row level security;

create policy "Users can insert their own moduler"
  on public.moduler for insert to authenticated
  with check (skapad_av = auth.uid()::text);

create policy "Users can view their own moduler"
  on public.moduler for select to authenticated
  using (skapad_av = auth.uid()::text);

-- Storage policies for moduler bucket (per-user folder)
create policy "Users upload own moduler videos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'moduler' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users read own moduler videos"
  on storage.objects for select to authenticated
  using (bucket_id = 'moduler' and auth.uid()::text = (storage.foldername(name))[1]);
