-- Create a new bucket for item images
insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', false);

-- Policy: Authenticated users can upload images
create policy "Authenticated users can upload images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'item-images'
);

-- Policy: Users can view their own images
create policy "Users can view their own images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own images
create policy "Users can delete their own images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'item-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);
