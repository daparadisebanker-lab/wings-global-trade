// src/app/accio/page.tsx — permanent redirect to /mister
import { redirect } from 'next/navigation'

export default function AccioRedirectPage() {
  redirect('/mister')
}
