// src/lib/claude.client.ts
// Client-safe Mister constants. No Anthropic SDK import here — safe to import
// into client components and hooks.

// Mister greeting — renders at page load with zero API latency (hardcoded, not an API call).
export const ACCIO_GREETING =
  `Hola, soy Mister — tu asistente de importación de Wings Global Trade.

Me especializo en importaciones desde China: cotizaciones CIF, selección de zona franca, aranceles, documentación y nacionalización en destino.

¿Qué quieres importar?`
