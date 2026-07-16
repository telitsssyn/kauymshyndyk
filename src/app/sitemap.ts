import type { MetadataRoute } from 'next'

import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getNewsList, getSermonsList } from '@/lib/queries'

const STATIC_PATHS = [
  '/',
  '/first-time',
  '/schedule',
  '/sermons',
  '/about',
  '/ministries',
  '/news',
  '/donate',
  '/contacts',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')

  const entries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((pathname) => ({
      url: base + getPathname({ locale, href: pathname }),
      lastModified: new Date(),
    })),
  )

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
