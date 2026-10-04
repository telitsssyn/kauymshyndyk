import { BIBLE_BOOKS } from './books'
import { toChapterText, type BibleChapter, type BibleChapterText } from './types'

/** Книга по слагу и проверка, что такая глава в ней есть */
export function resolveBibleChapter(bookSlug: string, chapter: number) {
  const book = BIBLE_BOOKS.find((b) => b.slug === bookSlug)
  if (!book || !Number.isInteger(chapter) || chapter < 1 || chapter > book.chaptersCount) {
    return null
  }
  return book
}

const siteOrigin = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return null
}

/**
 * Загружает главу на сервере.
 *
 * Сначала читает файл из public/ напрямую (работает локально и на сборке).
 * В серверной функции Vercel папки public/ нет — статика лежит на CDN, —
 * поэтому при пересборке страницы по запросу глава берётся по HTTP с того же сайта.
 */
export async function loadBibleChapterServer(
  bookSlug: string,
  chapter: number,
): Promise<BibleChapter | null> {
  // Слаг приходит из адреса страницы: без проверки по списку книг
  // в путь к файлу можно было бы подставить «../»
  if (!resolveBibleChapter(bookSlug, chapter)) return null
  const relative = `bible/${bookSlug}/${chapter}.json`

  try {
    const { readFile } = await import('node:fs/promises')
    const { resolve } = await import('node:path')
    const raw = await readFile(resolve(process.cwd(), 'public', relative), 'utf-8')
    return JSON.parse(raw) as BibleChapter
  } catch {
    // Файла нет на диске — пробуем CDN
  }

  const origin = siteOrigin()
  if (!origin) return null
  try {
    const res = await fetch(`${origin}/${relative}`, { cache: 'force-cache' })
    if (!res.ok) return null
    return (await res.json()) as BibleChapter
  } catch {
    return null
  }
}

/** Глава без толкований — для отрисовки страницы */
export async function loadBibleChapterText(
  bookSlug: string,
  chapter: number,
): Promise<BibleChapterText | null> {
  const full = await loadBibleChapterServer(bookSlug, chapter)
  return full ? toChapterText(full) : null
}
