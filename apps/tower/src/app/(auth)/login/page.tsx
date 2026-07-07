'use client'

import { useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * Login — magic link + Google OAuth (ARCHITECTURE Auth). This is an auth handoff
 * to Supabase, not a domain mutation, so it runs the SDK client-side; the session
 * cookie is then refreshed by the middleware. Async errors are handled explicitly
 * and shown as a contained message — never a raw error.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  const configured = isSupabaseConfigured()
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/catalog` : undefined

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!configured) return
    setStatus('sending')
    setMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) {
        setStatus('error')
        setMessage('No se pudo enviar el enlace / Could not send the link')
        return
      }
      setStatus('sent')
      setMessage('Revisa tu correo / Check your email')
    } catch (err) {
      console.error('[login:magic-link]', err)
      setStatus('error')
      setMessage('Error inesperado / Unexpected error')
    }
  }

  async function signInWithGoogle() {
    if (!configured) return
    setMessage(null)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        setStatus('error')
        setMessage('No se pudo iniciar con Google / Google sign-in failed')
      }
    } catch (err) {
      console.error('[login:google]', err)
      setStatus('error')
      setMessage('Error inesperado / Unexpected error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-6">
      <div className="w-full max-w-sm rounded-card border border-line bg-surface-1 p-8">
        <span className="font-mono text-t1 tracking-[0.22em] text-ink-primary">ADMIN PORTAL</span>
        <p className="mt-2 font-ui text-t0 text-ink-secondary">
          Wings Global Trade · Acceso interno / Internal access
        </p>

        {!configured ? (
          <p className="mt-6 font-ui text-t0 text-ink-secondary">
            Supabase no está configurado en este entorno. / Supabase is not configured in this
            environment.
          </p>
        ) : (
          <>
            <form onSubmit={sendMagicLink} className="mt-6 flex flex-col gap-3">
              <label htmlFor="email" className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
                Correo / Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@wingsglobaltrade.com"
                className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none placeholder:text-ink-secondary"
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                className="rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0 disabled:opacity-50"
              >
                {status === 'sending'
                  ? 'Enviando… / Sending…'
                  : 'Enviar enlace / Send link'}
              </button>
            </form>

            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-3 w-full rounded-card border border-line px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary hover:text-ink-primary"
            >
              Continuar con Google / Continue with Google
            </button>

            {message ? (
              <p
                role="status"
                className={
                  status === 'error'
                    ? 'mt-4 font-ui text-t0 text-negative'
                    : 'mt-4 font-ui text-t0 text-positive'
                }
              >
                {message}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
