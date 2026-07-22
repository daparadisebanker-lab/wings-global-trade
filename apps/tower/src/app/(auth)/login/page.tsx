'use client'

import { useEffect, useState } from 'react'
import { isSupabaseConfigured } from '@/lib/supabase/client'

/**
 * Login — email + shared-passcode sign-in (no magic link). The form POSTs to the
 * server route /auth/email-signin, which validates the passcode, checks the email
 * is a provisioned account, and mints the session server-side before redirecting
 * into the shell. Access is granted by an admin from Usuarios / Users; a brand-new
 * email gets a clean "ask an administrator" message rather than an empty shell.
 */
/** Bilingual copy for sign-in failures surfaced via ?error= from the sign-in route. */
const LOGIN_ERRORS: Record<string, string> = {
  passcode: 'Código de acceso incorrecto. / Incorrect access code.',
  denied:
    'Este correo no tiene acceso — pídeselo a un administrador. / This email has no access — ask an administrator.',
  email: 'Correo inválido. / Invalid email.',
  link: 'No se pudo iniciar la sesión — inténtalo de nuevo. / Could not start the session — try again.',
  config: 'Autenticación no configurada. / Authentication is not configured.',
}

export default function LoginPage() {
  const [message, setMessage] = useState<string | null>(null)

  // Surface a failure reported by the sign-in route (?error=). Read on mount, not
  // in the initializer — the page is prerendered and the URL only exists client-side.
  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get('error')
    if (error && LOGIN_ERRORS[error]) setMessage(LOGIN_ERRORS[error])
  }, [])

  const configured = isSupabaseConfigured()

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-0 px-6">
      {/* Wings brand hero — container yard at sunset, under a navy scrim so the
          sign-in card stays fully legible. Degrades to the scrim colour if the
          image is not present. */}
      <div aria-hidden className="login-hero absolute inset-0" />
      <div aria-hidden className="absolute inset-0" style={{ backgroundColor: 'var(--scrim)' }} />
      <div className="relative w-full max-w-sm rounded-card border border-line bg-surface-1 p-8">
        <div className="flex flex-col items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/wings-imagotipo.svg" alt="Wings Global Trade" className="h-9 w-auto" />
          <h1 className="font-display text-t3 leading-none text-ink-primary">Admin Portal</h1>
          <p className="flex items-center gap-2 font-mono text-label uppercase tracking-[0.16em] text-ink-secondary">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-gold" />
            Wings Global Trade · Acceso interno / Internal access
          </p>
        </div>

        {!configured ? (
          <p className="mt-6 font-ui text-t0 text-ink-secondary">
            Supabase no está configurado en este entorno. / Supabase is not configured in this
            environment.
          </p>
        ) : (
          <form method="post" action="/auth/email-signin" className="mt-6 flex flex-col gap-3">
            <label htmlFor="email" className="font-mono text-label uppercase tracking-[0.1em] text-ink-secondary">
              Correo / Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@wingsglobaltrade.com"
              className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary"
            />
            <label
              htmlFor="passcode"
              className="mt-1 font-mono text-label uppercase tracking-[0.1em] text-ink-secondary"
            >
              Código de acceso / Access code
            </label>
            <input
              id="passcode"
              name="passcode"
              type="password"
              required
              autoComplete="off"
              placeholder="••••••••"
              className="rounded-card border border-line bg-surface-0 px-3 py-2 font-ui text-t0 text-ink-primary outline-none focus-visible:border-lane-accent placeholder:text-ink-secondary"
            />
            <button
              type="submit"
              className="mt-1 rounded-card bg-accent px-4 py-2 font-mono text-label uppercase tracking-[0.1em] text-surface-0"
            >
              Entrar / Enter
            </button>
          </form>
        )}

        {message ? (
          <p role="status" className="mt-4 font-ui text-t0 text-negative">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  )
}
