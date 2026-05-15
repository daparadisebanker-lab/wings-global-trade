insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'listing-images' );

create policy "Authenticated users can upload images"
on storage.objects for insert
with check ( bucket_id = 'listing-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can update images"
on storage.objects for update
using ( bucket_id = 'listing-images' and auth.role() = 'authenticated' );

create policy "Authenticated users can delete images"
on storage.objects for delete
using ( bucket_id = 'listing-images' and auth.role() = 'authenticated' );
