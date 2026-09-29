export * from './books'
export * from './types'
import type { BibleChapter } from './types'

/**
 * Загружает главу Библии из JSON-файла в public/bible/.
 * Вызывается на клиенте через fetch.
 */
export async function fetchBibleChapter(
  bookSlug: string,
  chapter: number,
): Promise<BibleChapter | null> {
  try {
    const res = await fetch(`/bible/${bookSlug}/${chapter}.json`)
    if (!res.ok) return null
    return (await res.json()) as BibleChapter
  } catch {
    return null
  }
}

