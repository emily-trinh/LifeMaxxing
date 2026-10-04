create or replace function public.add_friend(friend uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if friend is null or friend = auth.uid() then
    raise exception 'You cannot add yourself as a friend';
  end if;

  insert into public.friendships (user_id, friend_id)
  values (auth.uid(), friend)
  on conflict (user_id, friend_id) do nothing;

  insert into public.friendships (user_id, friend_id)
  values (friend, auth.uid())
  on conflict (user_id, friend_id) do nothing;
end;
$$;

grant execute on function public.add_friend(uuid) to authenticated;

create or replace function public.remove_friend(friend uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  delete from public.friendships
  where (user_id = auth.uid() and friend_id = friend)
     or (user_id = friend and friend_id = auth.uid());
end;
$$;

grant execute on function public.remove_friend(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.friendships enable row level security;

drop policy if exists "Authenticated users can view profiles" on public.profiles;
create policy "Authenticated users can view profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can view own friendships" on public.friendships;
create policy "Users can view friendships"
on public.friendships
for select
to authenticated
using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Users can insert own friendships" on public.friendships;
create policy "Users can insert friendships"
on public.friendships
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete friendships" on public.friendships;
create policy "Users can delete friendships"
on public.friendships
for delete
to authenticated
using (auth.uid() = user_id or auth.uid() = friend_id);

notify pgrst, 'reload schema';
