// Warm ground for the group workspace — same rationale as /g/[token]/layout.tsx:
// the page's ink tokens are navy-on-warm and need the warm-white section ground
// plus clearance for the fixed SiteNav (solid on this route via forceSolid).
export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return <div className="section-warm min-h-screen pt-16 md:pt-18">{children}</div>
}
