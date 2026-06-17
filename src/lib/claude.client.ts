// src/lib/claude.client.ts
// Client-safe Accio constants. No Anthropic SDK import here — safe to import
// into client components and hooks.

// Phase 2A — updated opening message per /spec/ENRICHED_SPEC.md Section 3.
// This renders at page load with zero API latency (hardcoded, not an API call).
export const ACCIO_GREETING =
  `Soy el Motor Accio de Wings Global Trade.

Te ayudo a estructurar tu Requisito Técnico de Producto y a calcular un estimado CIF real vía zona franca — ZOFRATACNA (Tacna, Perú) o ZOFRI (Iquique, Chile).

Para comenzar: ¿qué categoría de producto buscas importar?

(Puedes mencionarme el tipo de maquinaria, el código HS si lo tienes, o describir el uso que le darás — lo que te resulte más fácil.)`
