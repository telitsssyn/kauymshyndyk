import type { FieldHook } from 'payload'
import { describe, expect, it } from 'vitest'

import { formatSlugHook, slugify } from '@/lib/slug'

type HookArgs = Parameters<FieldHook>[0]

// Хуку хватает нескольких полей из аргументов, поэтому в тестах собираем
// только их, а полный тип подставляем приведением.
const runHook = (args: Record<string, unknown>) => formatSlugHook(args as unknown as HookArgs)

describe('slugify', () => {
  it('переводит кириллицу в латиницу', () => {
    expect(slugify('Рождественское служение')).toBe('rozhdestvenskoe-sluzhenie')
  })

  it('убирает знаки препинания и лишние дефисы', () => {
    expect(slugify('  Привет, мир!  ')).toBe('privet-mir')
    expect(slugify('Ёлка — 2026')).toBe('elka-2026')
  })

  it('не теряет цифры', () => {
    expect(slugify('Итоги 2025 года')).toBe('itogi-2025-goda')
  })

  it('знает казахские буквы', () => {
    expect(slugify('Қауым шындық')).toBe('qauym-shyndyq')
  })

  it('на строке без букв и цифр возвращает пустоту', () => {
    expect(slugify('🎄🎄')).toBe('')
  })
})

describe('formatSlugHook', () => {
  it('строит слаг из заголовка, когда поле пустое', async () => {
    await expect(runHook({ value: '', data: { title: 'Пасхальное служение' } })).resolves.toBe(
      'pashalnoe-sluzhenie',
    )
  })

  it('приводит к виду слага то, что ввели руками', async () => {
    await expect(runHook({ value: 'Моя Ссылка', data: { title: 'Другое' } })).resolves.toBe(
      'moya-ssylka',
    )
  })

  it('не перезаписывает существующий слаг при смене заголовка', async () => {
    // адреса опубликованных страниц должны оставаться прежними
    await expect(
      runHook({ value: 'staryy-adres', data: { title: 'Новый заголовок' } }),
    ).resolves.toBe('staryy-adres')
  })

  it('подставляет запасную основу, если из заголовка ничего не вышло', async () => {
    await expect(runHook({ value: '', data: { title: '🎄🎄' } })).resolves.toBe('zapis')
  })

  it('оставляет значение как есть, когда брать слаг неоткуда', async () => {
    await expect(runHook({ value: undefined, data: {} })).resolves.toBeUndefined()
  })
})

describe('formatSlugHook: уникальность в коллекции', () => {
  // Подменяем базу: считаем занятыми перечисленные слаги, кроме записи с id,
  // которую сейчас сохраняют, — она не должна конфликтовать сама с собой.
  const withTakenSlugs = (taken: string[]) => ({
    collection: { slug: 'news' },
    req: {
      payload: {
        find: async ({ where }: { where: Record<string, unknown> }) => {
          const and = where.and as { slug?: { equals: string } }[] | undefined
          const clause = and ? and[0] : (where as { slug: { equals: string } })
          const slug = clause.slug?.equals as string
          const excludesSelf = Boolean(and)
          const isTaken = taken.includes(slug) && !excludesSelf
          return { docs: isTaken ? [{ id: 1 }] : [] }
        },
      },
    },
  })

  it('отдаёт свободный слаг без изменений', async () => {
    await expect(
      runHook({
        value: '',
        data: { title: 'Рождественское служение' },
        ...withTakenSlugs([]),
      }),
    ).resolves.toBe('rozhdestvenskoe-sluzhenie')
  })

  it('добавляет номер, если такое название уже было', async () => {
    await expect(
      runHook({
        value: '',
        data: { title: 'Рождественское служение' },
        ...withTakenSlugs(['rozhdestvenskoe-sluzhenie']),
      }),
    ).resolves.toBe('rozhdestvenskoe-sluzhenie-2')
  })

  it('доходит до первого свободного номера', async () => {
    await expect(
      runHook({
        value: '',
        data: { title: 'Рождественское служение' },
        ...withTakenSlugs([
          'rozhdestvenskoe-sluzhenie',
          'rozhdestvenskoe-sluzhenie-2',
          'rozhdestvenskoe-sluzhenie-3',
        ]),
      }),
    ).resolves.toBe('rozhdestvenskoe-sluzhenie-4')
  })

  it('не конфликтует сам с собой при повторном сохранении', async () => {
    await expect(
      runHook({
        value: 'rozhdestvenskoe-sluzhenie',
        originalDoc: { id: 1 },
        data: { title: 'Рождественское служение' },
        ...withTakenSlugs(['rozhdestvenskoe-sluzhenie']),
      }),
    ).resolves.toBe('rozhdestvenskoe-sluzhenie')
  })
})
