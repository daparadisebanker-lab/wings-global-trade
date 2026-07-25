-- tower_59 · Client media (WhatsApp-import attachments)
-- The images/audio that ride inside a WhatsApp export zip, attached to a client.
-- Stored as a jsonb array of {path, kind, name} on tower.accounts (already
-- audited + RLS'd, so the column inherits both — no new policy/trigger), with the
-- bytes in a PRIVATE bucket. Access model mirrors tower_34 / trial-products:
-- reads/writes are brokered by a server action that authorizes the caller and
-- then mints a SERVICE-ROLE signed URL — no storage.objects policy is wanted.
set search_path to tower, public;

alter table tower.accounts
  add column if not exists media jsonb not null default '[]'::jsonb;

alter table tower.accounts
  add constraint accounts_media_arr check (jsonb_typeof(media) = 'array');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'client-media',
  'client-media',
  false,
  20971520, -- 20 MiB
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/heic',
    'audio/ogg','audio/opus','audio/mpeg','audio/mp4','audio/aac','audio/wav'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
