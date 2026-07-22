import { redirect } from 'next/navigation'

// The room's front door → the Signal Deck operations cockpit. Unauthenticated
// users are bounced to /login by the middleware before this resolves.
export default function Home() {
  redirect('/signals')
}
