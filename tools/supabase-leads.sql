-- Hanflux Design Menu: lead inbox (run once in the Hanflux Supabase project).
create table if not exists public.design_menu_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  business text check (char_length(business) <= 200),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 200),
  timeline text check (char_length(timeline) <= 60),
  budget text check (char_length(budget) <= 60),
  notes text check (char_length(notes) <= 4000),
  websites text[] not null default '{}',
  agents text[] not null default '{}',
  addons text[] not null default '{}',
  primary_site text,
  estimate_usd integer,
  monthly_usd integer,
  via text check (via in ('whatsapp', 'email')),
  page text,
  message text check (char_length(message) <= 8000)
);
alter table public.design_menu_leads enable row level security;
drop policy if exists "menu visitors can send a request" on public.design_menu_leads;
create policy "menu visitors can send a request" on public.design_menu_leads for insert to anon with check (true);
-- No select, update or delete policy: only the owner (dashboard / service role) can read leads.
