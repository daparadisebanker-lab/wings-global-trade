// Shared theme flip — the single source of the data-theme + tower-theme write,
// consumed by both ThemeToggle (the visible control) and the ⌘K palette's
// "Toggle theme" action. Keeping one implementation stops the two from drifting;
// every ThemeToggle instance's MutationObserver re-syncs its icon/aria-pressed
// when the attribute changes here.

export type Theme = 'light' | 'dark'

/** The resolved theme, read from the DOM (the source of truth the no-FOUC
 *  bootstrap in layout.tsx sets before first paint). */
export function currentTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/** Apply a theme: flip the attribute (instant) and persist the choice. */
export function applyTheme(next: Theme): void {
  document.documentElement.setAttribute('data-theme', next)
  try {
    localStorage.setItem('tower-theme', next)
  } catch {
    /* private mode — a session-only theme is acceptable */
  }
}

/** Flip to the opposite of whatever is currently resolved. */
export function toggleTheme(): void {
  applyTheme(currentTheme() === 'dark' ? 'light' : 'dark')
}
