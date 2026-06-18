'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMultiInquiry } from '@/hooks/useMultiInquiry'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'

interface FormState {
  full_name: string
  company: string
  email: string
  phone: string
  destination_country: string
  message: string
}

const EMPTY_FORM: FormState = {
  full_name: '',
  company: '',
  email: '',
  phone: '',
  destination_country: '',
  message: '',
}

export function MultiInquiryPanel() {
  const { items, remove, clear } = useMultiInquiry()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const count = items.length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.destination_country) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/leads/multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          products: items.map(({ id, name_es }) => ({ id, name_es })),
        }),
      })

      if (!res.ok) throw new Error('Error al enviar consulta')

      toast('Consulta enviada. Nos pondremos en contacto contigo pronto.', 'success')
      setForm(EMPTY_FORM)
      clear()
      setOpen(false)
    } catch {
      toast('No se pudo enviar la consulta. Inténtalo de nuevo.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (count === 0) return null

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 bg-navy px-4 py-3 font-mono text-[11px] uppercase tracking-nav text-warm-white shadow-card-hover transition-all hover:bg-navy-light"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold font-mono text-[10px] font-medium text-navy">
          {count}
        </span>
        Consulta grupal
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto bg-warm-white shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[rgba(0,30,80,0.08)] px-6 py-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Consulta múltiple
                  </p>
                  <h2 className="font-display text-xl font-light text-navy">
                    {count} {count === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-mono text-sm text-text-muted transition-colors hover:text-navy"
                  aria-label="Cerrar panel"
                >
                  ✕
                </button>
              </div>

              {/* Product list */}
              <div className="border-b border-[rgba(0,30,80,0.06)] px-6 py-4">
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                      <span className="font-body text-sm text-navy">{item.name_es}</span>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="font-mono text-[10px] text-text-muted transition-colors hover:text-red-500"
                      >
                        Quitar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4 px-6 py-6">
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Nombre completo *
                  </label>
                  <input
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    required
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Empresa
                  </label>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    País de destino *
                  </label>
                  <select
                    name="destination_country"
                    value={form.destination_country}
                    onChange={handleChange}
                    required
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  >
                    <option value="">Selecciona un país</option>
                    <option>Perú</option>
                    <option>Bolivia</option>
                    <option>Chile</option>
                    <option>Colombia</option>
                    <option>Ecuador</option>
                    <option>Paraguay</option>
                    <option>Uruguay</option>
                    <option>Argentina</option>
                    <option>México</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase tracking-widest-3 text-text-muted">
                    Mensaje adicional
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-[rgba(0,30,80,0.15)] bg-white px-3 py-2.5 font-body text-sm text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <Button type="submit" size="md" disabled={submitting} className="mt-2 w-full">
                  {submitting ? 'Enviando...' : `Solicitar cotización (${count} productos)`}
                </Button>
              </form>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
