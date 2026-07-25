// /torre/cotizacion/[id]/document — a Mister Torre cotización as a print-ready
// page. Lives OUTSIDE the (shell) route group: no dark control-room chrome, a
// white A4 surface the operator prints or saves as the client's PDF. RLS-scoped
// read via getTorreCotizacionPrint; force-dynamic (prices/validity are live and
// this must never be statically cached). Internal-only (never indexed).
// `?lang=en` prints the client's language; Spanish is the default.
import type { Metadata } from 'next'
import { getTorreCotizacionPrint } from '@/lib/actions/torre-review'
import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import { CotizacionTorreDocument } from './CotizacionTorreDocument'
import { PrintBar } from './PrintBar'
import './document-page.css'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Cotización — Wings Global Trade',
  robots: { index: false, follow: false },
}

export default async function CotizacionTorreDocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ lang?: string }>
}) {
  const [{ id }, { lang }] = await Promise.all([params, searchParams])
  const locale: Locale = lang === 'en' ? 'en' : DEFAULT_LOCALE
  const result = await getTorreCotizacionPrint(id)

  if (result.error) {
    return (
      <div className="tcot-page" lang={locale}>
        <div className="tcot-error">
          <p>{t({ es: 'No se pudo cargar la cotización.', en: 'Could not load the quotation.' }, locale)}</p>
          <p className="tcot-error-sub">
            {t({ es: 'No existe o no tienes acceso a este documento.', en: 'It does not exist or you do not have access.' }, locale)}
          </p>
        </div>
      </div>
    )
  }

  const model = result.data
  return (
    <div className="tcot-page">
      <PrintBar
        label={`${model.title[locale]} · v${model.version}`}
        printLabel={t({ es: 'Imprimir / Guardar PDF', en: 'Print / Save PDF' }, locale)}
      />
      <CotizacionTorreDocument model={model} locale={locale} />
    </div>
  )
}
