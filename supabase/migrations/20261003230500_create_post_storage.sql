insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do update set public = true;

create policy "Authenticated users can upload post media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'posts' and (storage.foldername(name))[1] = (select auth.uid()::text));
