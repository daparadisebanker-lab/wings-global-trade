# Wings Global Trade — Nosotros CTA Architecture

## CTA Inventory (Current Page)

| Location | CTA | Destination | Problem |
|---|---|---|---|
| Final section | "Hablar con Mister" | /mister | Correctly primary, but appears too late — after 4 sections with no interim signal |
| Final section | "Ver catálogo" | /catalogo | Wrong secondary — buyer on Nosotros is not in browse mode |

---

## CTA Architecture (Recommended)

### Principle: earn the CTA, then offer it twice

Trust pages have a specific CTA cadence: one soft anchor mid-page (when confidence begins building), one strong CTA at close (when confidence is established). Never open cold with a CTA, never end without one.

---

### CTA 1 — Mid-page anchor (after operational proof section)
**Placement:** After free zone infrastructure + capability stats, before markets section.
**Trigger logic:** Buyer has confirmed Wings is real and operates at scale. First CTA window opens.
**CTA text:** "Hablar con Mister"
**CTA type:** Text link with monospace label or ghost button — not the gold primary. Buyer is not yet at full commitment.
**Behavioral principle:** Fogg Model — motivation is building, ability is always present (Mister is low-friction), this is the moment to place the trigger.

### CTA 2 — Page close (primary conversion moment)
**Placement:** Final section, full-weight.
**Trigger logic:** Buyer has completed the trust loop. Full gold primary button appropriate here.
**Primary CTA:** "Hablar con Mister" → /mister
**Secondary CTA:** "Explorar catálogo" → /catalogo (not "Ver catálogo" — "explorar" implies agency, not browsing)
**Tertiary signal:** Direct WhatsApp number visible as plain text (not a button) — for buyers who want to skip the AI layer entirely. This is especially important for older or more conservative B2B buyers in LATAM.

### No form on this page
Contact forms belong on /contacto. Nosotros is a trust-building page, not a capture page. Introducing a form here breaks the page's single job and signals either desperation or poor UX architecture. The conversion on Nosotros is measured by exit-to-Mister rate, not form submissions.

---

## CTA Sequencing Logic

```
Hero → [no CTA, let narrative breathe]
         ↓
Legitimacy block (free zones + proof) → [no CTA]
         ↓
Capability block (scale + categories) → [soft mid-page anchor: Hablar con Mister]
         ↓
Markets block → [no CTA, informational]
         ↓
Differentiation block (why Wings) → [no CTA, let the argument close]
         ↓
Closing CTA section → [PRIMARY: Hablar con Mister] [SECONDARY: Explorar catálogo]
                       [TERTIARY: WhatsApp number as plain text]
```

---

## Hick's Law Application

At the final CTA, maximum 3 options. They must be ordered by commitment level ascending:
1. Mister (lowest friction — AI guided, anonymous, no phone required)
2. Catálogo (medium — browse mode, still anonymous)
3. WhatsApp direct (highest intent signal — they're willing to call)

This ordering maps to the full spectrum of buyer readiness on a trust page.
