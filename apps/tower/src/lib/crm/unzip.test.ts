import { describe, it, expect } from 'vitest'
import zlib from 'node:zlib'
import { unzip, findChatEntry, mediaEntries, mediaKind, baseName, extOf } from './unzip'

// Minimal ZIP builder (local headers + central directory + EOCD) so we can test
// both STORED (0) and DEFLATE (8) entries without a fixture or a dependency.
function u16(n: number) {
  const b = Buffer.alloc(2)
  b.writeUInt16LE(n)
  return b
}
function u32(n: number) {
  const b = Buffer.alloc(4)
  b.writeUInt32LE(n >>> 0)
  return b
}
function makeZip(files: { name: string; data: string; method: 0 | 8 }[]): Uint8Array {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8')
    const data = Buffer.from(f.data, 'utf8')
    const comp = f.method === 8 ? zlib.deflateRawSync(data) : data
    const local = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(f.method), u16(0), u16(0),
      u32(0), u32(comp.length), u32(data.length), u16(name.length), u16(0), name, comp,
    ])
    const central = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(f.method), u16(0), u16(0),
      u32(0), u32(comp.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(offset), name,
    ])
    locals.push(local)
    centrals.push(central)
    offset += local.length
  }
  const localsBuf = Buffer.concat(locals)
  const cd = Buffer.concat(centrals)
  const eocd = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length),
    u32(cd.length), u32(localsBuf.length), u16(0),
  ])
  return new Uint8Array(Buffer.concat([localsBuf, cd, eocd]))
}

const dec = (u: Uint8Array) => new TextDecoder().decode(u)

describe('unzip', () => {
  it('extracts stored (0) and deflate (8) entries', async () => {
    const zip = makeZip([
      { name: '_chat.txt', data: 'Hola, quiero importar una retroexcavadora', method: 8 },
      { name: '00000031-PHOTO.jpg', data: 'JPEGDATA', method: 0 },
    ])
    const entries = await unzip(zip)
    expect(entries.map((e) => e.name)).toEqual(['_chat.txt', '00000031-PHOTO.jpg'])
    expect(dec(entries[0].data)).toBe('Hola, quiero importar una retroexcavadora')
    expect(dec(entries[1].data)).toBe('JPEGDATA')
  })

  it('finds the chat and classifies the media', async () => {
    const zip = makeZip([
      { name: '00000024-AUDIO.opus', data: 'OPUS', method: 0 },
      { name: '_chat.txt', data: 'conversación', method: 8 },
      { name: 'photo.jpg', data: 'JPG', method: 0 },
    ])
    const entries = await unzip(zip)
    expect(findChatEntry(entries)?.name).toBe('_chat.txt')
    const m = mediaEntries(entries)
    expect(m.map((x) => `${x.kind}:${baseName(x.entry.name)}`).sort()).toEqual(['audio:00000024-AUDIO.opus', 'image:photo.jpg'])
  })

  it('falls back to any .txt (Android names it "WhatsApp Chat with X.txt")', async () => {
    const zip = makeZip([{ name: 'WhatsApp Chat with Jheferson.txt', data: 'hola', method: 8 }])
    expect(findChatEntry(await unzip(zip))?.name).toBe('WhatsApp Chat with Jheferson.txt')
  })

  it('throws on a non-zip and returns null chat when absent', async () => {
    await expect(unzip(new Uint8Array([1, 2, 3, 4]))).rejects.toThrow(/zip/i)
    const noChat = await unzip(makeZip([{ name: 'photo.jpg', data: 'x', method: 0 }]))
    expect(findChatEntry(noChat)).toBeNull()
  })

  it('classifies extensions', () => {
    expect(mediaKind('a.JPG')).toBe('image')
    expect(mediaKind('b.opus')).toBe('audio')
    expect(mediaKind('c.mp4')).toBe('video')
    expect(mediaKind('d.pdf')).toBe('file')
    expect(extOf('x/y/z.PNG')).toBe('png')
    expect(baseName('a/b/c.txt')).toBe('c.txt')
  })
})
