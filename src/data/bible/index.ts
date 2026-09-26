import { BIBLE_BOOKS } from './books'
import { GENESIS_1 } from './genesis-1'
import { GENESIS_2 } from './genesis-2'
import type { BibleChapter } from './types'

export * from './books'
export * from './genesis-1'
export * from './genesis-2'
export * from './types'

export function getBibleChapter(bookSlug: string, chapter: number): BibleChapter | null {
  if (bookSlug === 'genesis') {
    if (chapter === 1) return GENESIS_1
    if (chapter === 2) return GENESIS_2
  }
  return null
}

export function isChapterAvailable(bookSlug: string, chapter: number): boolean {
  const book = BIBLE_BOOKS.find((b) => b.slug === bookSlug)
  if (!book) return false
  return book.availableChapters.includes(chapter)
}
