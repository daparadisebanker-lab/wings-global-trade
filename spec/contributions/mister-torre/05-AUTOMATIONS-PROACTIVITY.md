# 05 — Automations & Proactivity: The Watch

Proactivity is Mister Torre's second superpower (artifacts are the first). It is governed by one law:

> **Mister may look, think, draft, and flag on his own. He may never send, pay, commit, or delete on his own.**

## The Watch (continuous monitoring)

A scheduled engine (cron/edge functions, 15-min cycle + event webhooks) that evaluates **watch rules** over tower state and feeds a triage model (Haiku-class) that ranks by **cost-of-inaction**.

### v1 watch rules (shipped, editable in Ajustes)
| Rule | Trigger | Mister's autonomous action |
|------|---------|---------------------------|
| ETA slip | vessel/tracking ETA moves >48h | update timeline, draft client `comunicacion`, flag ops |
| Doc deadline | required doc missing < X days before need-by | draft the request comms to whoever owes it |
| Demurrage risk | container discharged, free days countdown ≤3 | escalation card w/ per-day cost, draft broker instruction |
| Rate expiry | quoted rate validity lapses while quote pending | recompute `hoja_costos` delta, draft revalidation note |
| Payment milestone | contract milestone reaches due window | draft finanzas reminder w/ amounts + refs |
| Quote gone quiet | client no reply > N days | draft follow-up in account's tone history |
| Margin drift | actuals deviate >Y% from quoted | analista explains the delta, flags finanzas |
| Stale import | no state change > N days | one-line "¿qué falta aquí?" card with likely blocker |

### Triage & delivery
- Every catch gets: severity (`inmediato / hoy / brief`), cost-of-inaction estimate, and the prepared draft.
- `inmediato` (demurrage, cutoff today) → real-time card in-module + optional WhatsApp ping. Everything else batches into the **Morning Brief** (01). Interruption budget is sacred: >2 real-time pings/day/operator = tune the rules, not the team.
- Every alert carries its **one-tap resolution**: the drafted artifact, pre-linked. An alert without a prepared action is a bug.

## Scheduled productions (artifact calendar)
| When | What |
|------|------|
| Daily 07:30 | Morning Brief per role |
| Fri 16:00 | Weekly ops report (drafted for review) |
| Month-end | Margin & pipeline report for dirección |
| On approval events | Corpus ingestion + learning pass (02) |
| Nightly | Watch-rule backtest: yesterday's misses/false alarms → tuning suggestions |

## Human-in-the-loop constitution
1. **Approval gates on all side effects** — send/pay/file-to-client/delete require `approved` (03). The approve button always names the side effect precisely.
2. **Drafts are cheap, sends are sacred** — Mister may over-draft (discard is one key); he may never over-send.
3. **Attribution** — everything Mister did autonomously is labeled "Mister · borrador/vigilancia" in feeds and audit; a human name is attached to everything that leaves.
4. **Kill switch** — Ajustes has a per-category pause (watches, drafts, briefs) and a global one. Trust is easier to keep than rebuild.
5. **Learning loop** — dismissed alerts and heavily-edited drafts are negative signals collected weekly into tuning suggestions (surfaced to Muaaz, applied by humans).

## n8n / external orchestration note
If the Wings ecosystem already runs n8n: webhooks in/out live at `automations/` boundaries — n8n handles third-party event capture (carrier tracking, email-in, WhatsApp provider) and delivery of approved sends; **decision logic and drafting stay in Mister's orchestrator** (02), never in n8n branches. n8n moves messages; Mister thinks.
