import Link from 'next/link'
import { DEFAULT_LOCALE, t, type Localized } from '@/lib/i18n'

// Admin index (COMPONENT_TREE §6). Module cards for the five admin surfaces.
// Users / Lanes / Brands are built in this wave; Audit / Webhooks routes are a
// parallel agent's ownership — linked here, not implemented.
interface AdminModuleCard {
  href: string
  tag: string
  title: Localized
  description: Localized
}

const CARDS: AdminModuleCard[] = [
  {
    href: '/admin/users',
    tag: 'USR',
    title: { es: 'Usuarios y accesos', en: 'Users & access' },
    description: {
      es: 'Invitar usuarios y editar la matriz de memberships por lane y rol.',
      en: 'Invite users and edit the membership matrix by lane and role.',
    },
  },
  {
    href: '/admin/lanes',
    tag: 'LNE',
    title: { es: 'Registro de lanes', en: 'Lane registry' },
    description: {
      es: 'Registrar lanes con códigos append-only y controlar OPENING → ACTIVE → ARCHIVED.',
      en: 'Register lanes with append-only codes and drive OPENING → ACTIVE → ARCHIVED.',
    },
  },
  {
    href: '/admin/brands',
    tag: 'BRD',
    title: { es: 'Marcas', en: 'Brands' },
    description: {
      es: 'Tenants aislados (Wings, Áladín, …). Crear y retirar, nunca eliminar.',
      en: 'Isolated tenants (Wings, Áladín, …). Create and retire, never delete.',
    },
  },
  {
    href: '/admin/audit',
    tag: 'AUD',
    title: { es: 'Auditoría', en: 'Audit' },
    description: {
      es: 'Registro append-only, filtrable (solo administradores del grupo).',
      en: 'Filterable append-only log (group admin only).',
    },
  },
  {
    href: '/admin/webhooks',
    tag: 'WHK',
    title: { es: 'Webhooks', en: 'Webhooks' },
    description: {
      es: 'Estado de revalidación y de las pipelines n8n.',
      en: 'Revalidation and n8n pipeline status.',
    },
  },
]

export default function AdminPage() {
  const locale = DEFAULT_LOCALE
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">ADM · Admin</span>
        <h1 className="font-ui text-t3 text-ink-primary">Administración / Administration</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group flex flex-col gap-3 rounded-card border border-line bg-surface-1 p-4 transition-colors hover:border-lane-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lane-accent"
          >
            <span className="font-mono text-label uppercase tracking-[0.15em] text-lane-accent">{card.tag}</span>
            <span className="font-ui text-t2 text-ink-primary">{t(card.title, locale)}</span>
            <span className="font-ui text-t0 leading-relaxed text-ink-secondary">{t(card.description, locale)}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
