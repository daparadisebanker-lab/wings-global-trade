// src/components/features/mister/MisterMessage.tsx
// REBUILT v2 — Document Entry Format with turn indices + 2px gold left rule.
// Kills all chatbot conventions: no rounded bubbles, no avatar, no ellipsis.
// Source: ENRICHED_SPEC §2.3, designer.md §4, animator.md §7
'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { MisterEntry } from '@/components/features/mister/MisterProvider'
import {
  assistantMessageVariants,
  userMessageVariants,
  surfaceCardVariants,
} from '@/lib/mister/motion'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SurfaceRenderer } from '@/components/features/mister/surfaces/SurfaceRenderer'

interface Props {
  entry: MisterEntry
}

// Internal Wings paths the model references in prose (e.g. /catalogo/maquinaria-agricola/new-holland-snh704)
// and bare https URLs. Matches greedily but stops at whitespace/punctuation that isn't part of a slug.
const LINKIFY_PATTERN =
  /(https?:\/\/[^\s]+[^\s.,;:!?)\]]|\/(?:catalogo|repuestos|cotizar|mister|contacto|nosotros)(?:\/[\w-]+)*)/g

const LINK_CLASSNAME =
  'text-[var(--mister-gold)] underline underline-offset-2 transition-[filter] duration-150 hover:brightness-125'

/**
 * Splits message text on internal Wings paths and https URLs, rendering the
 * former as next/link Links and the latter as external anchors. Everything
 * else stays as plain text nodes so the parent <p whitespace-pre-wrap> keeps
 * its layout semantics.
 */
export function linkifyContent(content: string): React.ReactNode[] {
  const parts = content.split(LINKIFY_PATTERN)
  return parts.map((part, i) => {
    if (!part) return null
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK_CLASSNAME}
        >
          {part}
        </a>
      )
    }
    if (/^\/(catalogo|repuestos|cotizar|mister|contacto|nosotros)(\/[\w-]+)*$/.test(part)) {
      return (
        <Link key={i} href={part} className={LINK_CLASSNAME}>
          {part}
        </Link>
      )
    }
    return <Fragment key={i}>{part}</Fragment>
  })
}

// Inline emphasis: **bold** and *italic* (asterisk forms only — underscores
// stay literal so slugs and file_names never trigger emphasis). Bold first,
// then italic inside the remainder; the inner text must start and end on a
// non-space so arithmetic like "3 * 4" stays literal.
const BOLD_PATTERN = /\*\*(\S(?:[^*\n]*\S)?)\*\*/g
const ITALIC_PATTERN = /\*(\S(?:[^*\n]*\S)?)\*/g

function renderItalicAndLinks(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  ITALIC_PATTERN.lastIndex = 0
  while ((m = ITALIC_PATTERN.exec(text)) !== null) {
    if (m.index > last) nodes.push(...linkifyContent(text.slice(last, m.index)))
    nodes.push(
      <em key={`${keyBase}-i${m.index}`} className="not-italic font-[500]">
        {m[1]}
      </em>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(...linkifyContent(text.slice(last)))
  return nodes
}

/**
 * Full inline pipeline for Mister prose: markdown emphasis rendered as real
 * typography (semibold <strong>, gold <em>) with linkification inside the
 * plain segments — asterisks never reach the reader. `streaming` trims a
 * dangling emphasis marker mid-stream so a half-arrived `**` never flashes.
 */
export function renderMisterContent(content: string, streaming = false): React.ReactNode[] {
  let text = content
  if (streaming) text = text.replace(/\*{1,2}(\S[^*\n]*)?$/, '$1')

  const nodes: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  BOLD_PATTERN.lastIndex = 0
  while ((m = BOLD_PATTERN.exec(text)) !== null) {
    if (m.index > last) nodes.push(...renderItalicAndLinks(text.slice(last, m.index), `s${last}`))
    nodes.push(
      <strong key={`b${m.index}`} className="font-[600] text-[var(--mister-text-primary)]">
        {m[1]}
      </strong>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) nodes.push(...renderItalicAndLinks(text.slice(last), `s${last}`))
  return nodes
}

function formatTime(iso: string): string {
  // Rehydrated history entries carry no timestamp — render nothing rather
  // than the literal "Invalid Date" (which doesn't throw, so catch won't fire).
  if (!iso) return ''
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return ''
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  } catch {
    return ''
  }
}

export function MisterMessage({ entry }: Props) {
  const reduced = useReducedMotion()
  const isUser = entry.role === 'user'

  if (isUser) {
    return (
      <motion.div
        key={entry.id}
        variants={userMessageVariants}
        initial="hidden"
        animate={reduced ? 'visibleReduced' : 'visible'}
        className="group flex justify-end"
      >
        <div className="relative max-w-[72%] rounded-none bg-[var(--mister-bg-message-user)] px-4 py-2.5">
          <p className="font-body text-[14px] font-[400] leading-[1.50] text-[var(--mister-text-user)] whitespace-pre-wrap">
            {entry.content}
          </p>
          <p className="mt-1 text-right font-mono text-[9px] font-[300] tracking-[0.04em] text-[var(--mister-text-user-muted)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {formatTime(entry.timestamp)}
          </p>
        </div>
      </motion.div>
    )
  }

  // Assistant message — Document Entry Format
  return (
    <motion.div
      key={entry.id}
      variants={assistantMessageVariants}
      initial="hidden"
      animate={reduced ? 'visibleReduced' : 'visible'}
      className="mister-message-assistant group relative w-full"
    >
      {/* Left margin column: 32px with turn index + 2px gold rule */}
      <div
        className="absolute left-0 top-0 w-[var(--mister-margin-column)] flex flex-col items-center"
        aria-hidden
      >
        {/* Turn index — margin note scale, not punctuation */}
        <span className="mt-4 font-mono text-[10px] font-[300] leading-none tracking-[0.06em] text-[var(--mister-text-ghost)] opacity-40">
          {String(entry.turnIndex).padStart(2, '0')}
        </span>
        {/* 2px gold left rule — runs full height of message, at x=24px */}
        <div
          className="mister-rule-left absolute left-6 top-0 h-full w-0.5 bg-[var(--mister-rule-assistant)]"
        />
      </div>

      {/* Message content — offset by margin column */}
      <div className="min-w-0 pl-[var(--mister-margin-column)]">
        <div className="pb-3 pr-5 pt-4">
          <p className="font-body text-[15px] font-[400] leading-[1.75] text-[var(--mister-text-primary)] whitespace-pre-wrap">
            {renderMisterContent(entry.content)}
          </p>
          <p className="mt-1 text-right font-mono text-[9px] font-[300] tracking-[0.04em] text-[var(--mister-text-ghost)] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {formatTime(entry.timestamp)}
          </p>
        </div>

        {/* Surface cards — appear after message content */}
        <AnimatePresence>
          {entry.surfaces.map((surface, i) => (
            <motion.div
              key={`${entry.id}-surface-${i}`}
              variants={surfaceCardVariants}
              initial="hidden"
              animate={reduced ? 'visibleReduced' : 'visible'}
              className="mb-3 pr-5"
            >
              <SurfaceRenderer surface={surface} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
