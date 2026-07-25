// Minimal ZIP reader for WhatsApp exports — a phone hands you a .zip (_chat.txt +
// media), not a bare .txt. Uses the platform-native DecompressionStream
// ('deflate-raw'), so NO dependency. Reads the central directory (authoritative
// sizes, unlike streamed local headers) and inflates stored (0) / deflate (8)
// entries; other methods are skipped. Runs in the browser (the import component)
// and in Node ≥18 (tests) — both expose DecompressionStream.

export interface ZipEntry {
  name: string
  data: Uint8Array
}

const EOCD_SIG = 0x06054b50
const CEN_SIG = 0x02014b50

/** Parse a ZIP byte array into its entries (filename + bytes). Throws on a file
 *  that has no End-Of-Central-Directory record (i.e. not a zip). */
export async function unzip(bytes: Uint8Array): Promise<ZipEntry[]> {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)

  // Find the EOCD by scanning back from the end (comment is usually empty).
  let eocd = -1
  const minEocd = Math.max(0, bytes.length - 22 - 0xffff)
  for (let i = bytes.length - 22; i >= minEocd; i--) {
    if (dv.getUint32(i, true) === EOCD_SIG) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('Not a ZIP file')

  const count = dv.getUint16(eocd + 10, true)
  let p = dv.getUint32(eocd + 16, true) // offset of the central directory

  const out: ZipEntry[] = []
  const dec = new TextDecoder()
  for (let n = 0; n < count && p + 46 <= bytes.length; n++) {
    if (dv.getUint32(p, true) !== CEN_SIG) break
    const method = dv.getUint16(p + 10, true)
    const compSize = dv.getUint32(p + 20, true)
    const nameLen = dv.getUint16(p + 28, true)
    const extraLen = dv.getUint16(p + 30, true)
    const commentLen = dv.getUint16(p + 32, true)
    const localOffset = dv.getUint32(p + 42, true)
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen))

    // The local header repeats name/extra lengths; data starts after them.
    const lNameLen = dv.getUint16(localOffset + 26, true)
    const lExtraLen = dv.getUint16(localOffset + 28, true)
    const dataStart = localOffset + 30 + lNameLen + lExtraLen
    const comp = bytes.subarray(dataStart, dataStart + compSize)

    if (method === 0) out.push({ name, data: comp })
    else if (method === 8) out.push({ name, data: await inflateRaw(comp) })
    // else: unsupported compression — skip this entry.

    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

async function inflateRaw(comp: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream('deflate-raw')
  const stream = new Blob([comp as BlobPart]).stream().pipeThrough(ds)
  const buf = await new Response(stream).arrayBuffer()
  return new Uint8Array(buf)
}

// ── Classifying a zip's contents ─────────────────────────────────────────────

export type MediaKind = 'image' | 'audio' | 'video' | 'file'

const EXT_KIND: Record<string, MediaKind> = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  webp: 'image',
  gif: 'image',
  heic: 'image',
  opus: 'audio',
  mp3: 'audio',
  m4a: 'audio',
  aac: 'audio',
  ogg: 'audio',
  wav: 'audio',
  mp4: 'video',
  '3gp': 'video',
  mov: 'video',
}

export function baseName(name: string): string {
  const parts = name.split('/')
  return parts[parts.length - 1]
}

export function extOf(name: string): string {
  const b = baseName(name)
  const dot = b.lastIndexOf('.')
  return dot >= 0 ? b.slice(dot + 1).toLowerCase() : ''
}

export function mediaKind(name: string): MediaKind {
  return EXT_KIND[extOf(name)] ?? 'file'
}

/** The chat transcript entry: WhatsApp's `_chat.txt` (iOS) or the first `.txt`
 *  (Android names it "WhatsApp Chat with X.txt"). Null when the zip has none. */
export function findChatEntry(entries: ZipEntry[]): ZipEntry | null {
  return (
    entries.find((e) => baseName(e.name).toLowerCase() === '_chat.txt') ??
    entries.find((e) => extOf(e.name) === 'txt') ??
    null
  )
}

/** The non-transcript, non-hidden media entries, classified by kind. */
export function mediaEntries(entries: ZipEntry[]): { entry: ZipEntry; kind: MediaKind }[] {
  return entries
    .filter((e) => {
      const b = baseName(e.name)
      return extOf(e.name) !== 'txt' && b.length > 0 && !b.startsWith('.')
    })
    .map((e) => ({ entry: e, kind: mediaKind(e.name) }))
}
