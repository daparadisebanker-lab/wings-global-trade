import { describe, it, expect } from 'vitest'
import {
  buildClientMediaPath,
  isOwnClientMediaPath,
  isClientMediaExt,
  parseMediaArray,
} from './client-media-logic'

const UID = '11111111-1111-1111-1111-111111111111'
const FID = '22222222-2222-2222-2222-222222222222'

describe('client media path', () => {
  it('builds owner-scoped paths and lowercases the ext', () => {
    expect(buildClientMediaPath(UID, FID, 'JPG')).toBe(`${UID}/${FID}.jpg`)
  })

  it('own-path check accepts only my exact prefix + one uuid + allowed ext', () => {
    expect(isOwnClientMediaPath(UID, `${UID}/${FID}.jpg`)).toBe(true)
    expect(isOwnClientMediaPath(UID, `${UID}/${FID}.opus`)).toBe(true)
    // another owner's object
    expect(isOwnClientMediaPath(UID, `33333333-3333-3333-3333-333333333333/${FID}.jpg`)).toBe(false)
    // path traversal / extra segments
    expect(isOwnClientMediaPath(UID, `${UID}/../secrets/${FID}.jpg`)).toBe(false)
    expect(isOwnClientMediaPath(UID, `${UID}/${FID}.jpg/x`)).toBe(false)
    // disallowed extension
    expect(isOwnClientMediaPath(UID, `${UID}/${FID}.exe`)).toBe(false)
    expect(isOwnClientMediaPath('', `${UID}/${FID}.jpg`)).toBe(false)
  })

  it('accepts the allowed extensions', () => {
    expect(isClientMediaExt('opus')).toBe(true)
    expect(isClientMediaExt('JPG')).toBe(true)
    expect(isClientMediaExt('exe')).toBe(false)
  })
})

describe('parseMediaArray', () => {
  it('keeps valid items, drops malformed ones, and falls back the name', () => {
    const items = parseMediaArray([
      { path: `${UID}/${FID}.jpg`, kind: 'image', name: 'foto.jpg' },
      { path: `${UID}/a.opus`, kind: 'audio' }, // no name → fallback
      { path: `${UID}/x.png`, kind: 'video' }, // bad kind → dropped
      { kind: 'image' }, // no path → dropped
      'garbage',
    ])
    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ path: `${UID}/${FID}.jpg`, kind: 'image', name: 'foto.jpg' })
    expect(items[1].name).toBe('a.opus')
  })

  it('returns [] for non-arrays', () => {
    expect(parseMediaArray(null)).toEqual([])
    expect(parseMediaArray({ path: 'x' })).toEqual([])
  })
})
