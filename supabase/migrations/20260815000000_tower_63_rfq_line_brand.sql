-- TOWER migration 63 · rfq_lines gains an optional brand label.
-- Threaded through to the quotation document so a multi-brand bundled quote
-- (createRFQ + upsertLines from several saved cost calculations, one per
-- model/brand) can label each line's brand instead of relying on the buyer
-- recognizing the brand from the model name alone. Nullable, no backfill —
-- existing lines simply render without a brand tag, same as today.
alter table tower.rfq_lines add column brand text;
