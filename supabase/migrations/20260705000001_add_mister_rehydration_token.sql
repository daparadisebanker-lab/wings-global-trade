-- 20260705000001_add_mister_rehydration_token.sql
-- M2 (mister-intelligence-audit review): the session id is printed in the UI
-- and WhatsApp handoff, so it cannot act as the sole rehydration credential.
-- The client now holds a random secret; only its SHA-256 hash is stored here.
-- Set-once by POST /api/mister on the first turn; required (constant-time
-- compare) by GET /api/mister/session. Rows without a hash (legacy sessions)
-- can never rehydrate — the client falls back to a fresh session.
-- Service-role access only; no RLS policy change required.

ALTER TABLE mister_projects
  ADD COLUMN IF NOT EXISTS rehydration_token_hash text;
