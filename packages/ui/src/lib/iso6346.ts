// ISO 6346 — the container-marking check digit.
//
// The ecosystem borrows its lane-code grammar from container marking (BIC codes,
// ISO 6346), which is why a lane code looks like infrastructure rather than
// marketing. This computes the real check digit, so a lane stamp is *derived and
// verifiable* rather than typed. No lane ever writes its own check digit — that
// is the whole reason this lives in the shared package.
//
// The algorithm: each of the 10 characters maps to a value (digits are
// themselves; letters run A=10 upward, SKIPPING every multiple of 11), is
// multiplied by 2^position, and the sum is taken mod 11.

/** A=10, B=12, … skipping multiples of 11. Built once, not typed out. */
const LETTER_VALUES: Record<string, number> = (() => {
  const map: Record<string, number> = {}
  let n = 10
  for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    while (n % 11 === 0) n += 1
    map[ch] = n
    n += 1
  }
  return map
})()

/**
 * The check digit for a 10-character owner-code + serial string, e.g. `WGTU000002`.
 *
 * A remainder of 10 renders as `0` — that is the standard's own rule, not a
 * truncation, and it is why `WGTU000002` (sum 1473, 1473 mod 11 = 10) stamps a
 * zero. Getting this wrong would be invisible until someone who reads container
 * markings for a living looked at it.
 */
export function iso6346CheckDigit(ownerAndSerial: string): number {
  const code = ownerAndSerial.replace(/\s+/g, '').toUpperCase()
  if (code.length !== 10) {
    throw new Error(`ISO 6346 requires 10 characters, received ${code.length}: ${code}`)
  }
  let sum = 0
  for (let i = 0; i < 10; i += 1) {
    const ch = code[i]
    const value = /[0-9]/.test(ch) ? Number(ch) : LETTER_VALUES[ch]
    if (value === undefined) throw new Error(`ISO 6346: invalid character "${ch}" in ${code}`)
    sum += value * 2 ** i
  }
  return (sum % 11) % 10
}

/**
 * Turn an ecosystem lane code into its container-marking form.
 * `WGT/02` → `{ owner: 'WGTU', serial: '000002', check: 0 }`
 *
 * `U` is the ISO 6346 equipment category identifier for a freight container —
 * the lane IS the container in this grammar.
 */
export function laneUnitNumber(laneCode: string): {
  owner: string
  serial: string
  check: number
} {
  const [prefix, number] = laneCode.split('/')
  const owner = `${prefix.toUpperCase()}U`
  const serial = String(Number(number)).padStart(6, '0')
  return { owner, serial, check: iso6346CheckDigit(owner + serial) }
}
