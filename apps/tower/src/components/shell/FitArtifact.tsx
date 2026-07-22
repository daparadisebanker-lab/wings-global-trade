import { DEFAULT_LOCALE, t, type Locale } from '@/lib/i18n'
import type { ContainerFitResult } from '@/lib/copilot/container-fit'
import { FitScene } from './FitScene'

/**
 * The container-fit "artifact" Mister renders inside its bubble — a computed
 * result, not prose: the unit count, a fill bar, and the numbers behind it.
 * Styled in mister-dock.css under .fit-*.
 */
export function FitArtifact({
  fit,
  locale = DEFAULT_LOCALE,
}: {
  fit: ContainerFitResult
  locale?: Locale
}) {
  const limited =
    fit.limitedBy === 'weight'
      ? t({ es: 'por peso', en: 'by weight' }, locale)
      : t({ es: 'por volumen', en: 'by volume' }, locale)

  return (
    <div className="fit-art">
      <div className="fit-label">
        <span className="g" aria-hidden="true" /> Container fit · {fit.containerLabel}
      </div>

      <div className="fit-top">
        <div className="fit-headline">
          <span className="fit-num">{fit.units}</span>
          <span className="fit-unit">
            {t({ es: 'unidades', en: 'units' }, locale)}
            <br />
            {limited}
          </span>
        </div>
        <div className="fit-figure">
          <FitScene pct={fit.cbmUsedPct} label={fit.containerLabel} />
        </div>
      </div>

      <div className="fit-bar" aria-hidden="true">
        <span className="fill" style={{ width: `${Math.min(100, fit.cbmUsedPct)}%` }} />
      </div>

      <div className="fit-stats">
        <span>
          CBM <b>{fit.cbmUsedPct}%</b>
        </span>
        {fit.totalWeightKg !== null ? (
          <span>
            {t({ es: 'Peso', en: 'Weight' }, locale)} <b>{(fit.totalWeightKg / 1000).toFixed(1)} t</b>
          </span>
        ) : null}
        <span>
          {t({ es: 'Por volumen', en: 'By volume' }, locale)} <b>{fit.unitsByVolume}</b>
        </span>
        {fit.unitsByWeight !== null ? (
          <span>
            {t({ es: 'Por peso', en: 'By weight' }, locale)} <b>{fit.unitsByWeight}</b>
          </span>
        ) : null}
      </div>

      {fit.requested ? (
        <p className="fit-req">
          {fit.requested.fitsInOne
            ? t(
                {
                  es: `Las ${fit.requested.quantity} caben en un contenedor.`,
                  en: `All ${fit.requested.quantity} fit in one container.`,
                },
                locale,
              )
            : t(
                {
                  es: `Para ${fit.requested.quantity}: necesitas ${fit.requested.containersNeeded} contenedores.`,
                  en: `For ${fit.requested.quantity}: you need ${fit.requested.containersNeeded} containers.`,
                },
                locale,
              )}
        </p>
      ) : null}
    </div>
  )
}
