-- ============================================================
-- Leads — buyer_type (dual-buyer support, automóviles category)
-- ------------------------------------------------------------
-- Optional signal distinguishing personal-use from business/fleet
-- buyers on the catalog RFQ flow. Nullable — only surfaced by the
-- UI for categories where the distinction matters (automóviles
-- today, via RFQFlow's showBuyerType prop); other flows leave it
-- null and are unaffected.
-- ============================================================

create type lead_buyer_type as enum ('personal', 'empresa');

alter table public.leads
  add column buyer_type lead_buyer_type;
