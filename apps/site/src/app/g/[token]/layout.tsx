// Warm ground for the invite landing. The page's ink tokens
// (--color-text-primary et al.) are navy-on-warm; without this wrapper they
// inherit the navy body and disappear. pt clears the fixed SiteNav (h-16/h-18),
// which goes solid on this route (see SiteNav forceSolid).
export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return <div className="section-warm min-h-screen pt-16 md:pt-18">{children}</div>
}
