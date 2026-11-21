import { describe, expect, it } from 'vitest'

import { parseBibleRef } from '@/lib/bibleRef'

describe('parseBibleRef', () => {
  it('разбирает ссылки в том виде, как они написаны в уроках', () => {
    expect(parseBibleRef('Матфея 22:37–40')).toEqual({ book: 'matthew', chapter: 22, verse: 37 })
    expect(parseBibleRef('Римлянам 5:8')).toEqual({ book: 'romans', chapter: 5, verse: 8 })
    expect(parseBibleRef('Бытие 3:5')).toEqual({ book: 'genesis', chapter: 3, verse: 5 })
    expect(parseBibleRef('Исаия 53:4–6')).toEqual({ book: 'isaiah', chapter: 53, verse: 4 })
    expect(parseBibleRef('Деяния 8:30–35')?.book).toBe('acts')
    expect(parseBibleRef('Деяниям 26:20')?.book).toBe('acts')
    expect(parseBibleRef('Откровение 3:20')?.book).toBe('revelation')
    expect(parseBibleRef('Псалом 50:1–14')?.book).toBe('psalms')
    expect(parseBibleRef('Титу 3:5')?.book).toBe('titus')
    expect(parseBibleRef('Числа 21:9')?.book).toBe('numbers')
  })

  it('отличает Евангелие от Иоанна от посланий Иоанна', () => {
    expect(parseBibleRef('Иоанна 3:16')?.book).toBe('john')
    expect(parseBibleRef('1 Иоанна 4:19')?.book).toBe('1-john')
    expect(parseBibleRef('1-е Иоанна 1:9')?.book).toBe('1-john')
    expect(parseBibleRef('2 Коринфянам 5:17')?.book).toBe('2-corinthians')
    expect(parseBibleRef('1 Петра 2:2')?.book).toBe('1-peter')
  })

  it('понимает полные названия и сокращения', () => {
    expect(parseBibleRef('Евангелие от Луки 15:20')?.book).toBe('luke')
    expect(parseBibleRef('Рим 6:23')?.book).toBe('romans')
    expect(parseBibleRef('Мф 5:3')?.book).toBe('matthew')
  })

  it('принимает ссылку на целую главу', () => {
    expect(parseBibleRef('Иоанна 3')).toEqual({ book: 'john', chapter: 3, verse: undefined })
  })

  it('возвращает null для непонятного текста и несуществующих глав', () => {
    expect(parseBibleRef('Неизвестная 1:1')).toBeNull()
    expect(parseBibleRef('просто текст')).toBeNull()
    expect(parseBibleRef('Иуды 5:1')).toBeNull()
    expect(parseBibleRef('')).toBeNull()
  })
})
