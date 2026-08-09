import { afterEach, describe, expect, it, vi } from 'vitest'

import { getActiveSpecialServices, getUpcomingServices } from '@/lib/schedule'
import type { Schedule } from '@/payload-types'

// Все проверки идут от фиксированного момента: расписание считается от «сейчас»,
// иначе тесты начали бы падать в зависимости от дня, когда их запустили.
const WED_09_00 = '2026-08-05T04:00:00Z' // среда, 5 августа, 09:00 в Павлодаре
const WED_19_00 = '2026-08-05T14:00:00Z' // та же среда, ровно 19:00
const SUN_09_00 = '2026-08-30T04:00:00Z' // воскресенье, 30 августа, 09:00

const at = (iso: string) => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(iso))
}

const schedule = (overrides: Partial<Schedule> = {}): Schedule =>
  ({
    id: 1,
    regularServices: [
      { day: 'sunday', time: '11:00', title: 'Воскресное служение' },
      { day: 'wednesday', time: '19:00', title: 'Молитвенное собрание' },
    ],
    specialServices: [],
    ...overrides,
  }) as Schedule

afterEach(() => {
  vi.useRealTimers()
})

describe('getUpcomingServices', () => {
  it('ставит ближайшее служение первым', () => {
    at(WED_09_00)
    const [first, second] = getUpcomingServices(schedule(), 'ru')

    // среда 19:00 сегодня, затем воскресенье 11:00
    expect(first.title).toBe('Молитвенное собрание')
    expect(first.timestamp).toBe(Date.parse('2026-08-05T14:00:00Z'))
    expect(second.title).toBe('Воскресное служение')
    expect(second.timestamp).toBe(Date.parse('2026-08-09T06:00:00Z'))
  })

  it('уже начавшееся служение переносит на следующую неделю', () => {
    at(WED_19_00)
    const upcoming = getUpcomingServices(schedule(), 'ru')
    const midweek = upcoming.find((s) => s.dayKey === 'wednesday')

    expect(midweek?.timestamp).toBe(Date.parse('2026-08-12T14:00:00Z'))
  })

  it('правильно переходит через границу месяца', () => {
    at(SUN_09_00)
    const upcoming = getUpcomingServices(schedule(), 'ru')
    const midweek = upcoming.find((s) => s.dayKey === 'wednesday')

    // ближайшая среда — уже 2 сентября
    expect(midweek?.timestamp).toBe(Date.parse('2026-09-02T14:00:00Z'))
    expect(midweek?.dateLabel).toContain('сентября')
  })

  it('показывает время по Павлодару независимо от часов сервера', () => {
    at(WED_09_00)
    const [first] = getUpcomingServices(schedule(), 'ru')

    expect(first.time).toBe('19:00')
  })

  it('подмешивает особые служения и выкидывает прошедшие', () => {
    at(WED_09_00)
    const upcoming = getUpcomingServices(
      schedule({
        specialServices: [
          { date: '2026-08-05T10:00:00Z', title: 'Крещение' }, // сегодня 15:00, ещё впереди
          { date: '2026-08-01T10:00:00Z', title: 'Прошедшее' },
        ],
      }),
      'ru',
    )

    expect(upcoming.map((s) => s.title)).toEqual([
      'Крещение',
      'Молитвенное собрание',
      'Воскресное служение',
    ])
    expect(upcoming[0].isSpecial).toBe(true)
  })

  it('ограничивает список запрошенным количеством', () => {
    at(WED_09_00)
    expect(getUpcomingServices(schedule(), 'ru', 1)).toHaveLength(1)
  })

  it('не падает на пустом расписании', () => {
    at(WED_09_00)
    expect(getUpcomingServices(null, 'ru')).toEqual([])
    expect(getUpcomingServices(schedule({ regularServices: null }), 'ru')).toEqual([])
  })

  it('пропускает служение с неизвестным днём недели', () => {
    at(WED_09_00)
    const broken = schedule({
      regularServices: [
        { day: 'someday' as 'monday', time: '19:00', title: 'Ошибка в данных' },
      ],
    })

    expect(getUpcomingServices(broken, 'ru')).toEqual([])
  })
})

describe('getActiveSpecialServices', () => {
  it('оставляет только будущие и сортирует по дате', () => {
    at(WED_09_00)
    const active = getActiveSpecialServices(
      schedule({
        specialServices: [
          { date: '2026-09-01T05:00:00Z', title: 'Позже' },
          { date: '2026-07-01T05:00:00Z', title: 'Прошедшее' },
          { date: '2026-08-10T05:00:00Z', title: 'Раньше' },
        ],
      }),
      'ru',
    )

    expect(active.map((s) => s.title)).toEqual(['Раньше', 'Позже'])
  })

  it('считает «сейчас» так же, как список ближайших служений', () => {
    at(WED_09_00)
    // Служение начинается через минуту: обе функции должны его показать
    const withSoon = schedule({
      specialServices: [{ date: '2026-08-05T04:01:00Z', title: 'Вот-вот начнётся' }],
    })

    expect(getActiveSpecialServices(withSoon, 'ru')).toHaveLength(1)
    expect(getUpcomingServices(withSoon, 'ru').some((s) => s.isSpecial)).toBe(true)
  })

  it('игнорирует испорченную дату', () => {
    at(WED_09_00)
    const broken = schedule({
      specialServices: [{ date: 'не дата', title: 'Ошибка в данных' }],
    })

    expect(getActiveSpecialServices(broken, 'ru')).toEqual([])
    expect(getUpcomingServices(broken, 'ru').some((s) => s.isSpecial)).toBe(false)
  })
})
