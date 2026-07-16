import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { NewsCard } from '@/components/NewsCard'
import { Link } from '@/i18n/navigation'
import { getNewsList } from '@/lib/queries'

const PER_PAGE = 12

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('news')
  return { title: t('title') }
}

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const [news, t] = await Promise.all([getNewsList(PER_PAGE, page), getTranslations('news')])

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('title')}
      </BrushHeading>

      {news.docs.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {news.docs.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-lg text-ink-soft">{t('empty')}</p>
      )}

      {news.totalPages > 1 ? (
        <nav
          aria-label={t('pageOf', { page: news.page ?? page, total: news.totalPages })}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          {news.hasPrevPage ? (
            <Link href={{ pathname: '/news', query: { page: page - 1 } }} className="btn-outline">
              ← {t('newerPage')}
            </Link>
          ) : null}
          <span className="text-base text-ink-soft">
            {t('pageOf', { page: news.page ?? page, total: news.totalPages })}
          </span>
          {news.hasNextPage ? (
            <Link href={{ pathname: '/news', query: { page: page + 1 } }} className="btn-outline">
              {t('olderPage')} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
