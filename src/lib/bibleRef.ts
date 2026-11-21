import { BIBLE_BOOKS } from '@/data/bible/books'

export type BibleRef = {
  book: string
  chapter: number
  verse?: number
}

// Как книгу называют в тексте → как она названа в BIBLE_BOOKS. В уроках пишут
// по-разговорному: «Матфея», «Римлянам», «1 Иоанна», а в справочнике —
// «Евангелие от Матфея», «Послание к Римлянам», «1-е Иоанна».
const normalize = (name: string): string =>
  name
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/^(евангелие\s+от|послание\s+к|книга)\s+/, '')
    .replace(/^(\d)\s*-?\s*е?\s+/, '$1 ')
    .replace(/\.$/, '')
    .replace(/\s+/g, ' ')
    .trim()

const BOOK_BY_NAME = new Map<string, string>()
for (const book of BIBLE_BOOKS) {
  BOOK_BY_NAME.set(normalize(book.name), book.slug)
  BOOK_BY_NAME.set(normalize(book.shortName), book.slug)
}
// Привычные варианты, которые не выводятся из названий справочника
const ALIASES: Record<string, string> = {
  псалом: 'psalms',
  псалмы: 'psalms',
  судей: 'judges',
  деяния: 'acts',
  деяниям: 'acts',
  откровения: 'revelation',
  'песнь песней': 'song-of-solomon',
}
for (const [name, slug] of Object.entries(ALIASES)) BOOK_BY_NAME.set(name, slug)

/**
 * «Матфея 22:37–40» → { book: 'matthew', chapter: 22, verse: 37 }.
 * Ссылку, которую не удалось разобрать, возвращаем как null — тогда она
 * показывается просто текстом, без перехода в Библию.
 */
export const parseBibleRef = (input: string): BibleRef | null => {
  const match = input.trim().match(/^(.+?)\s+(\d{1,3})(?::(\d{1,3}))?(?:\s*[–—-].*)?$/)
  if (!match) return null

  const book = BOOK_BY_NAME.get(normalize(match[1]))
  if (!book) return null

  const meta = BIBLE_BOOKS.find((item) => item.slug === book)
  const chapter = Number(match[2])
  if (!meta || chapter < 1 || chapter > meta.chaptersCount) return null

  return { book, chapter, verse: match[3] ? Number(match[3]) : undefined }
}
