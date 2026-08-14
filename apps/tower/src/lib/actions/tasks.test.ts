import { describe, it, expect } from 'vitest'
import { bucketOf, groupByUrgency, mapTaskRow, type RawTaskRow, type TaskListItem } from './tasks-logic'

const base: RawTaskRow = {
  id: 't1',
  brand_id: 'b1',
  title: 'Follow up on Q3 shipment',
  due_date: '2026-08-20',
  assignee_id: 'u1',
  status: 'OPEN',
  ref_table: 'accounts',
  ref_id: 'a1',
}

describe('mapTaskRow', () => {
  it('resolves the account name from the lookup map when ref_table is accounts', () => {
    const item = mapTaskRow(base, new Map([['a1', 'Distribuidora Lima']]))
    expect(item.accountName).toBe('Distribuidora Lima')
    expect(item.status).toBe('OPEN')
  })

  it('leaves accountName null when ref_table is not accounts, even with a matching id in the map', () => {
    const item = mapTaskRow({ ...base, ref_table: 'orders' }, new Map([['a1', 'Distribuidora Lima']]))
    expect(item.accountName).toBeNull()
  })

  it('leaves accountName null when the ref_id is missing from the lookup', () => {
    const item = mapTaskRow(base, new Map())
    expect(item.accountName).toBeNull()
  })

  it('unknown status falls back to OPEN', () => {
    expect(mapTaskRow({ ...base, status: 'bogus' }).status).toBe('OPEN')
  })
})

describe('bucketOf', () => {
  const today = '2026-08-20'
  it('classifies past/today/future/null correctly', () => {
    expect(bucketOf('2026-08-19', today)).toBe('OVERDUE')
    expect(bucketOf('2026-08-20', today)).toBe('TODAY')
    expect(bucketOf('2026-08-21', today)).toBe('UPCOMING')
    expect(bucketOf(null, today)).toBe('NO_DATE')
  })
})

describe('groupByUrgency', () => {
  const today = '2026-08-20'
  function task(id: string, dueDate: string | null): TaskListItem {
    return {
      id,
      brandId: 'b1',
      title: id,
      dueDate,
      assigneeId: null,
      status: 'OPEN',
      refTable: null,
      refId: null,
      accountName: null,
    }
  }

  it('buckets in OVERDUE/TODAY/UPCOMING/NO_DATE order and sorts each bucket by due date', () => {
    const groups = groupByUrgency(
      [task('a', '2026-08-22'), task('b', '2026-08-15'), task('c', null), task('d', '2026-08-20'), task('e', '2026-08-21')],
      today,
    )
    expect(groups.map((g) => g.bucket)).toEqual(['OVERDUE', 'TODAY', 'UPCOMING', 'NO_DATE'])
    expect(groups.find((g) => g.bucket === 'OVERDUE')!.items.map((t) => t.id)).toEqual(['b'])
    expect(groups.find((g) => g.bucket === 'UPCOMING')!.items.map((t) => t.id)).toEqual(['e', 'a'])
    expect(groups.find((g) => g.bucket === 'NO_DATE')!.items.map((t) => t.id)).toEqual(['c'])
  })
})
