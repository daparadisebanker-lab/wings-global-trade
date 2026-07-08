import { useEffect, useRef } from 'react'
import { ToastProvider, useToast } from '@wings/trade-ui'

// Capture-determinism patch (preview pages only, never ships in the bundle):
// the toast's mount transition (opacity/y over 0.3s) races the screenshot.
// On this component the race is specifically a fonts-ready vs. transition-
// duration timing coincidence: package-capture's settle() awaits
// document.fonts.ready before shooting, and on a component's FIRST navigation
// in a session that resolves slowly enough (real font fetch) that the 0.3s
// transition has already finished — but on every navigation after, fonts are
// warm-cached and fonts.ready resolves in a few ms, well before the
// transition completes, so the shot lands mid-fade (verified by sampling
// computed opacity over time: 0 at capture, ~0.5 at +200ms, 1 at +400ms).
// Toast.tsx has no internal reduced-motion branch (unlike SpecSheet) and
// framer-motion's MotionConfig reducedMotion="always" only neutralizes
// transform-based motion, not opacity fades — verified it alone does not
// fix this. The only preview-side lever left is a stylesheet rule with
// !important, which is the one thing that outranks framer-motion's inline
// style on the toast element, forcing it to its settled end state
// regardless of where the transition actually is when the shot fires.
const forceSettled = (
  <style>{'[role="status"]{opacity:1 !important;transform:none !important}'}</style>
)

function Fire({ message, type }: { message: string; type?: 'success' | 'error' | 'info' }) {
  const { toast } = useToast()
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    toast(message, type)
  }, [message, type, toast])
  return null
}

export function Success() {
  return (
    <div style={{ minHeight: 160, padding: 24, background: '#001E50' }}>
      {forceSettled}
      <ToastProvider>
        <Fire message="Cotización WGT-2026-0312 enviada a operaciones@transandinos.pe" type="success" />
      </ToastProvider>
    </div>
  )
}

export function ErrorToast() {
  return (
    <div style={{ minHeight: 160, padding: 24, background: '#001E50' }}>
      {forceSettled}
      <ToastProvider>
        <Fire message="No se pudo enviar el RFQ — verifique el RUC ingresado" type="error" />
      </ToastProvider>
    </div>
  )
}

export function Info() {
  return (
    <div style={{ minHeight: 160, padding: 24, background: '#001E50' }}>
      {forceSettled}
      <ToastProvider>
        <Fire message="Su contenedor 40HQ está a 3 días de arribar al Callao" type="info" />
      </ToastProvider>
    </div>
  )
}
