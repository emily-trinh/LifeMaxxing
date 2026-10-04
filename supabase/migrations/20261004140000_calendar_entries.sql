create table public.calendar_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  all_day boolean not null default false,
  kind text not null check (kind in ('personal', 'booking')),
  status text check (status in ('going', 'booked')),
  notes text,
  source_event_id text,
  event jsonb,
  created_at timestamptz default now(),
  check (ends_at >= starts_at)
);

create unique index calendar_entries_user_source_event_unique
  on public.calendar_entries (user_id, source_event_id)
  where source_event_id is not null;

alter table public.calendar_entries enable row level security;

create policy "Users can select their calendar entries"
  on public.calendar_entries for select to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their calendar entries"
  on public.calendar_entries for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their calendar entries"
  on public.calendar_entries for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their calendar entries"
  on public.calendar_entries for delete to authenticated
  using (user_id = auth.uid());