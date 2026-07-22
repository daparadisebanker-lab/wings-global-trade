import { EmptyState } from '@/components/ui/EmptyState'
import { RepProfileForm } from '@/components/perfil/RepProfileForm'
import { getMyRepProfile, getRepSignatureUrl } from '@/lib/actions/rep-profile'
import { createServerSupabase } from '@/lib/supabase/server'

// Self-serve rep onboarding / profile screen (under the (shell) IA, so the
// middleware already gates it on a session). A rep edits their display name,
// title and WhatsApp, and uploads a signature. The foundation actions
// (rep-profile.ts) do the RLS-scoped work; this page just resolves the initial
// state (own profile + a short-lived signature preview URL) and hands it to the
// client form.
export default async function PerfilPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } }

  if (!user) {
    return (
      <EmptyState
        tag="PERFIL · Profile"
        title={{ es: 'Sesión requerida', en: 'Sign-in required' }}
        description={{ es: 'Inicia sesión para editar tu perfil.', en: 'Sign in to edit your profile.' }}
      />
    )
  }

  const profileResult = await getMyRepProfile()
  const profile = profileResult.error ? null : profileResult.data

  // A short-lived signed READ url for an already-stored signature (own row).
  let initialSignatureUrl: string | null = null
  if (profile?.signaturePath) {
    const signed = await getRepSignatureUrl(user.id)
    initialSignatureUrl = signed.error ? null : signed.data
  }

  return (
    <RepProfileForm
      userId={user.id}
      initialProfile={profile}
      initialSignatureUrl={initialSignatureUrl}
    />
  )
}
