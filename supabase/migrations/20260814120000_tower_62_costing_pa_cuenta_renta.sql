-- tower_62 · Costing: Pago a Cuenta del Impuesto a la Renta + supplier-offer link
-- Two additive changes to the costing module, decided against FORMULA_DE_COSTOS.xlsx
-- (the Prado reference sheet):
--   1. costing_config gets pa_cuenta_renta_bps (statutory default 1.77%) — the
--      engine's margenNetoCaja now deducts this real cash outflow, a gap versus
--      the Excel's "GANANCIA NETA WINGS" that the ported wings-operations engine
--      never modeled (see engine.ts's 2026-08-14 header note).
--   2. cost_calculations gets an optional supplier_offer_id — lets a cost sheet
--      trace back to the FOB price book entry (tower_60) it was costed from, so
--      any of the 76+ catalog models is one link away from a full landed cost.
set search_path to tower, public;

alter table costing_config
  add column if not exists pa_cuenta_renta_bps int not null default 177
    check (pa_cuenta_renta_bps >= 0 and pa_cuenta_renta_bps <= 10000);

alter table cost_calculations
  add column if not exists supplier_offer_id uuid references supplier_offers(id);

create index if not exists cost_calculations_supplier_offer_idx
  on cost_calculations (supplier_offer_id);
