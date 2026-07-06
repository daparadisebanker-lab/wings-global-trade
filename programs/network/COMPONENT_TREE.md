# Wings Network — Component Tree

## Route Map
```
app/
├── (buyer)/                          EXISTING — zero regression
│   ├── red/                          Network catalog (flag: network_catalog)
│   │   ├── page.tsx                  badged grid + filters
│   │   └── [listing]/page.tsx        listing detail + blueprint SpecSheet
│   └── solicita/page.tsx             Request-a-product (Phase 0, LIVE)
├── vende/                            Phase 0, LIVE
│   ├── page.tsx                      landing (hero, demand receipts, tiers, founder offer)
│   └── aplicar/page.tsx              application form
├── portal/                           flag: portal · auth-gated layout
│   ├── layout.tsx                    PortalShell (nav, supplier ctx, locale)
│   ├── page.tsx                      Overview (fill participation, funnel, alerts)
│   ├── listings/  page + [id]/edit   ListingTable · ListingForm · PublishChecklist
│   ├── leads/     page               LeadInbox · LeadCard (archetype ctx, WhatsApp CTA)
│   ├── containers/page               LaneBoard · FillMeter(supplier) · SlotPicker
│   ├── shipments/ page               ShipmentTimeline (state machine viz)
│   └── billing/   page               StatementTable · TierCard · SubscribeButton*
└── (admin)/ops/                      service-role views: ApplicationQueue ·
                                      VerificationBoard · CategoryFlags · DisputeLog
```

## Shared Marketplace Components (`components/marketplace/`)
| Component | Notes |
|---|---|
| **FillMeter** | THE hero. One component, `variant: 'buyer' \| 'supplier'` — same visual, different CTA ("Trae tu grupo" / "Reserva tu slot"). Realtime via Supabase channel on `containers_fill_view`. GSAP fill animation, respects `prefers-reduced-motion`, skeleton on load, never blocks paint. |
| **VerifiedBadge** | Quiet mark + verification date tooltip + link to the published standard. States: verified / suspended (never rendered for unverified). |
| **ListingCard** | Supplier name ALWAYS visible (never disguised as first-party). Direct cards carry flagship weight; tie-order Direct-first is data-layer, not CSS. |
| **SpecSheet** | Blueprint spec-sheet format, templatized from existing Direct system; renders `listings.spec` jsonb; print/PDF-ready. |
| **TierCard / TierMatrix** | The Appendix-B matrix as UI; current tier highlighted. |
| **SlotPicker** | Capacity-aware (reads fill view), cutoff countdown, co-load hint. |
| **LeadInbox / LeadCard** | Archetype-lane chip, need summary, SLA timer, WhatsApp deep-link button (Wings CC), outcome buttons → `respondToLead`. |
| **StatementTable** | Money via `lib/money` formatters only; USD primary; single-invoice grouping; export CSV. |
| **DemandRequestForm** | Progressive: need text → optional category/volume → confirmation with "Mister will come back to you" promise. |
| **ApplicationForm** | RHF+Zod, WhatsApp-first field order, founder-offer banner. |
| **ShipmentTimeline** | Container-lifecycle stepper: announced→received→inspected→loaded→in transit→delivered. |

## Behavior Rules
- Buyer + Vende surfaces: brand-forward, GSAP/Lenis motion where it earns meaning, Spanish-first.
- Portal: data-forward, dense, motion minimal (state changes + SLA pulses only), bilingual next-intl.
- Every list: skeleton → empty-state (designed, with next action) → error (toast + retry). No raw spinners on hero surfaces.
- All money surfaces render through `lib/money`; no component ever does arithmetic on floats.
