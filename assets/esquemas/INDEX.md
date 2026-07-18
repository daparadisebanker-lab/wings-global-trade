# Esquema library — status index

Per `WINGS_ESQUEMA_LIBRARY_SPEC.md` Part III. One row per ID: pregunta, status, surfaces.
Statuses: FICHA → GENERATED (raw candidates exist) → CLEANUP → GATES → CANON → LIVE.
Raw candidates live in `assets/image-generation/raw/` (git-ignored); filenames + executed
prompts in `BUILD-LOG-2026-07-09-IMP.md`. Nothing here has passed gates yet.

> **2026-07-09 direction change:** all 13 IDs regenerated in the **poster
> register** (Muaaz's reference style, custom styleID — see GENERATION.md).
> Current deliverables: `posters/ESQ-IMP-0NN-{a,b}.png`, two candidates per ID,
> awaiting Muaaz's pick per ID. The wave-1 verdicts in the table below refer to
> the superseded navy/paper batch and are kept only as build history.

| ID | Pregunta | Q | Status | Notes |
|---|---|---|---|---|
| ESQ-IMP-001 | ¿Cómo funciona importar con Wings? | Q-SEQ | GENERATED (weak) | All 3 invented airplanes + garbled text; regenerate with hardened negatives or compose from 009/013 station art |
| ESQ-IMP-002 | ¿Cómo se calcula mi CIF? | Q-SEQ | GENERATED | Best base `3141bf15`; CIF three-block chain reconstructed in cleanup |
| ESQ-IMP-003 | ¿Por qué ZOFRATACNA reduce mi costo? | Q-MECH | GENERATED (strong) | `3d5de960` compound+gate+truck is the pick; `0c993a6e` REJECTED (invented US flag) |
| ESQ-IMP-004 | ¿Zona franca → territorio nacional? | Q-CONN | GENERATED | `7367188b` has the elements + a gold line to reassign; two-zone gate composed in cleanup |
| ESQ-IMP-005 | ¿Qué documentos viajan con mi carga? | Q-SEQ | GENERATED (partial) | Document + port art present; the four-doc row itself gets assembled in vector |
| ESQ-IMP-006 | ¿Dónde termina la responsabilidad del proveedor? | Q-CONN | GENERATED (strong) | `cb87c116` stacked bars + gold marks — closest structural match; EXW/FOB/CIF/DDP labels in cleanup |
| ESQ-IMP-007 | ¿Qué cabe en un contenedor? | Q-DIM | COMPONENTS ONLY | Model refuses side-by-side comparison; build manually from container plates (`7feb2287` set) + `b145840d` dimension-line grammar |
| ESQ-IMP-008 | ¿FCL o LCL? | Q-COMP | COMPONENTS ONLY | Same refusal; manual comparative plate from container + crate art |
| ESQ-IMP-009 | ¿Qué pasa en el puerto? | Q-SEQ | GENERATED (strong scenes) | Three clean port scenes; five-station row assembled in cleanup |
| ESQ-IMP-010 | ¿Cómo se asegura mi carga? | Q-CONN | COMPONENTS ONLY | Interior-lashing scene refused twice; crate/pallet plates (`53b042e8` set) are the component art; straps + gold rings drawn in vector |
| ESQ-IMP-011 | ¿Por qué varían los tiempos de tránsito? | Q-MECH | GENERATED | `7b53bc69` route+hub grammar; world-map coastlines simplified to schematic in cleanup |
| ESQ-IMP-012 | ¿Cómo es un contenedor por dentro? | Q-ANAT | GENERATED (strong) | Side-opened views `569a4f6b`/`cf98240d`; corner castings present → recolor gold |
| ESQ-IMP-013 | ¿Cómo se inspecciona mi pedido? | Q-SEQ | GENERATED (best of wave) | `639411f5` + `209daef2`: gold landed on the approval/report mark, register right |

Next step for every row: vector cleanup (tiers, 3:1 stroke ratio, single gold ΔE-matched,
DM Mono labels ES) → gates X1–X7 → CANON filing + MANIFEST row → variants.
