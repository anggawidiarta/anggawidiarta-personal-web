-- Naming: the public site calls it the Journal. The bucket was empty and nothing
-- referenced it, so renaming it moves no files and breaks no stored URLs.
update storage.buckets
set id = 'journal-media', name = 'journal-media'
where id = 'blog-media';

drop policy "admins read blog media" on storage.objects;
drop policy "admins upload blog media" on storage.objects;
drop policy "admins update blog media" on storage.objects;
drop policy "admins delete blog media" on storage.objects;

create policy "admins read journal media" on storage.objects
  for select to authenticated
  using (bucket_id = 'journal-media' and (select private.is_admin()));

create policy "admins upload journal media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'journal-media' and (select private.is_admin()));

create policy "admins update journal media" on storage.objects
  for update to authenticated
  using (bucket_id = 'journal-media' and (select private.is_admin()))
  with check (bucket_id = 'journal-media' and (select private.is_admin()));

create policy "admins delete journal media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'journal-media' and (select private.is_admin()));
