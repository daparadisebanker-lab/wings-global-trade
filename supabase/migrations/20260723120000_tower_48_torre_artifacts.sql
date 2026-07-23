-- TOWER · Mister Torre (spec/contributions/mister-torre) — extend the ai_drafts
-- kind vocabulary with the Torre artifact types, ADDITIVELY (Directive 7 spine
-- unchanged). The existing kinds (TRIAGE/LEAD_SCORE/SPEC_EXTRACT/WEEKLY_BRIEF) and
-- every kind-filtered query keep working; Torre rows carry their own kinds and are
-- typed by lib/torre/*, so lib/ai/types.ts is untouched. RLS, audit trigger,
-- append-only, and the DRAFT→APPROVED/REJECTED review flow all apply for free.
--
-- Flagship (quote run) needs: HOJA_COSTOS (internal cost sheet), COTIZACION
-- (client-ready quote), COMUNICACION (cover message). The remaining Torre kinds
-- (REPORTE_ESTADO, BRIEF, CHECKLIST_DOCS, ACTA, SOP, WATCH_SIGNAL) are reserved
-- here so later phases don't re-alter the constraint.
set search_path to tower, public;

alter table tower.ai_drafts drop constraint if exists ai_drafts_kind_check;

alter table tower.ai_drafts
  add constraint ai_drafts_kind_check check (
    kind in (
      -- existing (Wave 4 intelligence)
      'TRIAGE', 'LEAD_SCORE', 'SPEC_EXTRACT', 'WEEKLY_BRIEF',
      -- Mister Torre artifacts (spec-torre/03)
      'HOJA_COSTOS', 'COTIZACION', 'COMUNICACION',
      'REPORTE_ESTADO', 'BRIEF', 'CHECKLIST_DOCS', 'ACTA', 'SOP', 'WATCH_SIGNAL'
    )
  );

comment on constraint ai_drafts_kind_check on tower.ai_drafts is
  'Draft/artifact kinds: Wave-4 intelligence + Mister Torre artifacts (tower_48).';
