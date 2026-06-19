interface TechnicalSilhouetteProps {
  categorySlug: string
  className?: string
}

const LINE = '#F8F6F0'

/**
 * Engineering-documentation silhouettes — 1.5px warm-white monoline on a navy
 * strip, drawn as recognizable side-elevation references, not placeholder shapes.
 * The product gains dimensional presence without 3D weight.
 */

function TractorSilhouette() {
  return (
    <svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" aria-label="Tractor — vista lateral, referencia técnica">
      {/* rear wheel — large drive wheel */}
      <circle cx="50" cy="90" r="40" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="90" r="14" stroke={LINE} strokeWidth="1" fill="none" />
      <circle cx="50" cy="90" r="4" stroke={LINE} strokeWidth="1" fill="none" />
      {/* front wheel — small steering wheel */}
      <circle cx="170" cy="100" r="20" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="170" cy="100" r="6" stroke={LINE} strokeWidth="1" fill="none" />
      {/* body trapezoid */}
      <polygon points="55,50 160,50 170,80 40,80" stroke={LINE} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* cab outline */}
      <polyline points="92,50 100,22 138,22 138,50" stroke={LINE} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      {/* cab roof overhang */}
      <line x1="96" y1="22" x2="142" y2="22" stroke={LINE} strokeWidth="1.5" />
      {/* exhaust stack */}
      <line x1="130" y1="30" x2="130" y2="55" stroke={LINE} strokeWidth="1.5" />
      <line x1="126" y1="30" x2="134" y2="30" stroke={LINE} strokeWidth="1.5" />
      {/* hood grille tick */}
      <line x1="160" y1="58" x2="160" y2="74" stroke={LINE} strokeWidth="1" />
      <line x1="153" y1="58" x2="153" y2="74" stroke={LINE} strokeWidth="1" />
      {/* axle connections */}
      <line x1="50" y1="80" x2="55" y2="80" stroke={LINE} strokeWidth="1" />
      <line x1="160" y1="80" x2="170" y2="84" stroke={LINE} strokeWidth="1" />
    </svg>
  )
}

function TruckSilhouette() {
  return (
    <svg viewBox="0 0 215 110" xmlns="http://www.w3.org/2000/svg" aria-label="Camión — vista lateral, referencia técnica">
      {/* cab */}
      <rect x="10" y="40" width="65" height="50" stroke={LINE} strokeWidth="1.5" fill="none" />
      {/* cab window */}
      <rect x="18" y="46" width="30" height="22" stroke={LINE} strokeWidth="1" fill="none" />
      {/* cargo box */}
      <rect x="75" y="30" width="130" height="60" stroke={LINE} strokeWidth="1.5" fill="none" />
      {/* cargo door seam */}
      <line x1="170" y1="30" x2="170" y2="90" stroke={LINE} strokeWidth="1" />
      {/* chassis baseline */}
      <line x1="10" y1="90" x2="205" y2="90" stroke={LINE} strokeWidth="1.5" />
      {/* front wheel */}
      <circle cx="40" cy="96" r="14" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="40" cy="96" r="4" stroke={LINE} strokeWidth="1" fill="none" />
      {/* rear wheel */}
      <circle cx="150" cy="96" r="14" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="150" cy="96" r="4" stroke={LINE} strokeWidth="1" fill="none" />
    </svg>
  )
}

function BusSilhouette() {
  return (
    <svg viewBox="0 0 260 120" xmlns="http://www.w3.org/2000/svg" aria-label="Bus — vista lateral, referencia técnica">
      {/* long body */}
      <rect x="10" y="30" width="240" height="70" rx="4" stroke={LINE} strokeWidth="1.5" fill="none" />
      {/* windscreen rake */}
      <line x1="10" y1="44" x2="22" y2="34" stroke={LINE} strokeWidth="1" />
      {/* passenger windows */}
      <rect x="70" y="40" width="38" height="26" rx="2" stroke={LINE} strokeWidth="1" fill="none" />
      <rect x="116" y="40" width="38" height="26" rx="2" stroke={LINE} strokeWidth="1" fill="none" />
      <rect x="162" y="40" width="38" height="26" rx="2" stroke={LINE} strokeWidth="1" fill="none" />
      <rect x="208" y="40" width="32" height="26" rx="2" stroke={LINE} strokeWidth="1" fill="none" />
      {/* door */}
      <rect x="30" y="48" width="26" height="52" stroke={LINE} strokeWidth="1" fill="none" />
      <line x1="43" y1="48" x2="43" y2="100" stroke={LINE} strokeWidth="0.75" />
      {/* front wheel */}
      <circle cx="64" cy="100" r="18" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="64" cy="100" r="5" stroke={LINE} strokeWidth="1" fill="none" />
      {/* rear wheel */}
      <circle cx="206" cy="100" r="18" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="206" cy="100" r="5" stroke={LINE} strokeWidth="1" fill="none" />
    </svg>
  )
}

function ForkliftSilhouette() {
  return (
    <svg viewBox="0 0 190 130" xmlns="http://www.w3.org/2000/svg" aria-label="Montacargas — vista lateral, referencia técnica">
      {/* base / chassis */}
      <rect x="50" y="62" width="95" height="38" stroke={LINE} strokeWidth="1.5" fill="none" />
      {/* operator overhead guard */}
      <polyline points="70,62 70,18 130,18 130,62" stroke={LINE} strokeWidth="1.5" fill="none" />
      <line x1="100" y1="18" x2="100" y2="62" stroke={LINE} strokeWidth="0.75" />
      {/* mast — two verticals with diagonal cross-braces */}
      <line x1="44" y1="14" x2="44" y2="100" stroke={LINE} strokeWidth="1.5" />
      <line x1="56" y1="14" x2="56" y2="100" stroke={LINE} strokeWidth="1.5" />
      <line x1="44" y1="22" x2="56" y2="40" stroke={LINE} strokeWidth="1" />
      <line x1="44" y1="58" x2="56" y2="76" stroke={LINE} strokeWidth="1" />
      {/* carriage */}
      <rect x="40" y="44" width="20" height="18" stroke={LINE} strokeWidth="1" fill="none" />
      {/* two forks extending left */}
      <line x1="44" y1="52" x2="12" y2="52" stroke={LINE} strokeWidth="1.5" />
      <line x1="44" y1="78" x2="12" y2="78" stroke={LINE} strokeWidth="1.5" />
      <line x1="12" y1="52" x2="12" y2="46" stroke={LINE} strokeWidth="1.5" />
      <line x1="12" y1="78" x2="12" y2="72" stroke={LINE} strokeWidth="1.5" />
      {/* rear wheels */}
      <circle cx="78" cy="106" r="14" stroke={LINE} strokeWidth="1.5" fill="none" />
      <circle cx="128" cy="106" r="14" stroke={LINE} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

function getSilhouette(categorySlug: string) {
  switch (categorySlug) {
    case 'maquinaria-agricola':
      return <TractorSilhouette />
    case 'camiones':
      return <TruckSilhouette />
    case 'buses':
      return <BusSilhouette />
    case 'equipo-industrial':
      return <ForkliftSilhouette />
    default:
      return <ForkliftSilhouette />
  }
}

export default function TechnicalSilhouette({ categorySlug, className }: TechnicalSilhouetteProps) {
  return (
    <div
      className={className}
      style={{
        backgroundColor: '#001E50',
        width: '100%',
        height: className ? undefined : '150px',
        minHeight: '80px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* gold baseline rule — the datum the silhouette rests on */}
      <div
        style={{
          position: 'absolute',
          bottom: '18px',
          left: '5%',
          right: '5%',
          height: '0.5px',
          backgroundColor: '#C4933F',
        }}
      />
      {/* baseline end-ticks */}
      <div style={{ position: 'absolute', bottom: '15px', left: '5%', width: '0.5px', height: '6px', backgroundColor: '#C4933F' }} />
      <div style={{ position: 'absolute', bottom: '15px', right: '5%', width: '0.5px', height: '6px', backgroundColor: '#C4933F' }} />

      {/* silhouette */}
      <div style={{ height: '108px', width: 'auto', maxWidth: '78%', marginBottom: '14px' }}>
        {getSilhouette(categorySlug)}
      </div>

      {/* documentation label */}
      <span
        style={{
          position: 'absolute',
          bottom: '6px',
          right: '5%',
          fontFamily: '"DM Mono", monospace',
          fontSize: '9px',
          textTransform: 'uppercase',
          color: '#F8F6F0',
          opacity: 0.4,
          letterSpacing: '0.08em',
        }}
      >
        Vista lateral · Referencia
      </span>
    </div>
  )
}
