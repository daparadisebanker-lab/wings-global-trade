import { redirect } from 'next/navigation'

// The room's front door → Catalog Studio. Unauthenticated users are bounced to
// /login by the middleware before this resolves.
export default function Home() {
  redirect('/catalog')
}
