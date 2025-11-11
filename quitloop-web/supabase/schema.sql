-- supabase/schema.sql  (run this in Supabase SQL editor)
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table public.waitlist enable row level security;
create policy "insert_any" on public.waitlist for insert with check (true);
create policy "select_none" on public.waitlist for select using (false);
