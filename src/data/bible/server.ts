import type { BibleChapter } from './types'

/**
 * Загружает главу на сервере, читая файл из public/ напрямую.
 * Используется в Server Components для SSR первой страницы.
 */
export async function loadBibleChapterServer(
  bookSlug: string,
  chapter: number,
): Promise<BibleChapter | null> {
  try {
    const { readFile } = await import('node:fs/promises')
    const { resolve } = await import('node:path')
    const filePath = resolve(process.cwd(), `public/bible/${bookSlug}/${chapter}.json`)
    const raw = await readFile(filePath, 'utf-8')
    return JSON.parse(raw) as BibleChapter
  } catch {
    return null
  }
}
