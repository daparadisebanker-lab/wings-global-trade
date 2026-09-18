// src/components/features/automoviles/SpecTable.tsx
//
// Shared spec presentation for the ficha técnica page: a grouped
// label/value spec block, and a horizontally-scrollable trim/version table
// with a frozen first column. Grouping is real, not decorative — every
// group below maps to fields `ficha.ts` actually carries (Segmento/Plazas
// vs. Motor/Transmisión/Tracción). No "Dimensiones"/"Equipamiento" group:
// this catalog has no dimension or equipment-feature data per nameplate,
// and root CLAUDE.md is explicit that a missing group renders honestly
// empty rather than getting invented content to fill a template shape.
//
// TrimTable is deliberately NOT a per-trim spec matrix: the catalog has one
// engine/transmission/traction spec per NAMEPLATE, not per named trim (the
// fleet sheet doesn't carry that granularity — see data/automoviles-
// catalog.ts's header). Showing the shared spec against each trim name is
// the honest shape of the real data; inventing per-trim differentiation
// the source data doesn't have would be exactly the fabrication root
// CLAUDE.md refuses.
import { Fragment } from 'react'

export interface SpecRow {
  label: string
  value: string
}

export interface SpecGroup {
  label: string
  rows: SpecRow[]
}

export function SpecTable({ groups }: { groups: SpecGroup[] }) {
  const nonEmpty = groups.filter((g) => g.rows.length > 0)

  if (nonEmpty.length === 0) {
    return <p className="text-body-md text-[color:var(--ink-decoration)]">Sin especificaciones registradas.</p>
  }

  return (
    <div className="divide-y divide-[color:var(--ink-decoration)]">
      {nonEmpty.map((group) => (
        <div key={group.label} className="py-6 first:pt-0 last:pb-0">
          <h3 className="font-mono text-[11px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]">
            {group.label}
          </h3>
          <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {group.rows.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-[color:var(--ink-decoration)]/40 pb-2"
              >
                <dt className="text-body-sm text-[color:var(--ink-secondary)]">{row.label}</dt>
                <dd className="text-right font-mono text-[13px] text-[color:var(--ink-primary)]">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  )
}

export function TrimTable({ trims, commonSpecs }: { trims: string[]; commonSpecs: SpecRow[] }) {
  if (trims.length === 0) {
    return <p className="text-body-md text-[color:var(--ink-decoration)]">Sin versiones registradas.</p>
  }

  return (
    <div>
      <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[color:var(--ink-decoration)]">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[color:var(--ink-decoration)]">
              <th
                scope="col"
                className="sticky left-0 z-10 min-w-[220px] bg-[color:var(--surface-1)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)]"
              >
                Versión
              </th>
              {commonSpecs.map((s) => (
                <th
                  key={s.label}
                  scope="col"
                  className="bg-[color:var(--surface-1)] px-4 py-3 font-mono text-[10px] uppercase tracking-widest-2 text-[color:var(--ink-decoration)] whitespace-nowrap"
                >
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trims.map((trim, i) => (
              <Fragment key={trim}>
                <tr className={i % 2 === 1 ? 'bg-[color:var(--surface-1)]' : undefined}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 min-w-[220px] border-t border-[color:var(--ink-decoration)] bg-[color:var(--surface-0)] px-4 py-3 text-left text-body-sm font-normal text-[color:var(--ink-primary)]"
                  >
                    {trim}
                  </th>
                  {commonSpecs.map((s) => (
                    <td
                      key={s.label}
                      className="border-t border-[color:var(--ink-decoration)] px-4 py-3 font-mono text-[12px] whitespace-nowrap text-[color:var(--ink-secondary)]"
                    >
                      {s.value}
                    </td>
                  ))}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {commonSpecs.length > 0 && (
        <p className="mt-3 text-[11px] text-[color:var(--ink-decoration)]">
          Motor, transmisión y tracción aplican a toda la línea salvo diferencia indicada en el nombre de la
          versión. Configuración final se confirma al cotizar.
        </p>
      )}
    </div>
  )
}
