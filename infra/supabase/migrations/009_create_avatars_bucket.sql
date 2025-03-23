-- Create avatars bucket
insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 5242880); -- 5MB limit

-- Allow public access to avatars
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatars
create policy "Users can upload their own avatars"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update their own avatars
create policy "Users can update their own avatars"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
