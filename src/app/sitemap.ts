import type { MetadataRoute } from 'next'

import { BIBLE_BOOKS } from '@/data/bible/books'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getNewsList, getSermonsList } from '@/lib/queries'

const STATIC_PATHS = [
  '/',
  '/first-time',
  '/schedule',
  '/sermons',
  '/about',
  '/bible',
  '/courses',
  '/news',
  '/donate',
  '/contacts',
  '/privacy',
  '/terms',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

  // У постоянных страниц lastModified не указываем: дата сборки — не дата
  // изменения текста, а поисковику она сообщала бы, что меняется весь сайт сразу.
  const entries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((pathname) => ({
      url: base + getPathname({ locale, href: pathname }),
    })),
  )

  // Каждая глава Библии — отдельная страница
  for (const locale of routing.locales) {
    for (const book of BIBLE_BOOKS) {
      for (let chapter = 1; chapter <= book.chaptersCount; chapter++) {
        entries.push({
          url:
            base +
            getPathname({
              locale,
              href: {
                pathname: '/bible/[book]/[chapter]',
                params: { book: book.slug, chapter: String(chapter) },
              },
            }),
        })
      }
    }
  }

  try {
    const [news, sermons] = await Promise.all([getNewsList(100), getSermonsList(100)])
    for (const locale of routing.locales) {
      for (const item of news.docs) {
        if (!item.slug) continue
        entries.push({
          url:
            base +
            getPathname({
              locale,
              href: { pathname: '/news/[slug]', params: { slug: item.slug } },
            }),
          lastModified: new Date(item.updatedAt),
        })
      }
      for (const sermon of sermons.docs) {
        if (!sermon.slug) continue
        entries.push({
          url:
            base +
            getPathname({
              locale,
              href: { pathname: '/sermons/[slug]', params: { slug: sermon.slug } },
            }),
          lastModified: new Date(sermon.updatedAt),
        })
      }
    }
  } catch {
    // Без базы данных отдаём только статические страницы
  }

  return entries
}
