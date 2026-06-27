-- Add session_ref to accio_projects
-- Persists the WGT-YYYYMM-XXXXXX reference shown to users in the exit ceremony,
-- so ops can look up a project by the reference number the user received.
ALTER TABLE accio_projects ADD COLUMN IF NOT EXISTS session_ref text;
CREATE INDEX IF NOT EXISTS accio_projects_session_ref_idx ON accio_projects(session_ref);
