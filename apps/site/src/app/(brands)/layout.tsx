// src/app/(brands)/layout.tsx
// Represented Brands route group (root law §5-bis, program law in
// programs/represented-brands/SPEC.md). Sets the white brand canvas —
// deliberately NOT the Wings warm-white: partner palettes need a neutral
// ground. Scoped here only; nav/footer chrome above and below is untouched.
import './rb-canvas.css'

export default function BrandsLayout({ children }: { children: React.ReactNode }) {
  return <div data-canvas="brand">{children}</div>
}
