import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { SermonCard } from '@/components/SermonCard'
import { Link } from '@/i18n/navigation'
import { getSermonsList, getSettings } from '@/lib/queries'

const PER_PAGE = 12

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sermons')
  return { title: t('title') }
}

export default async function SermonsPage({
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

  const [sermons, settings, t] = await Promise.all([
    getSermonsList(PER_PAGE, page),
    getSettings(),
    getTranslations('sermons'),
  ])

  return (
    <div className="container-site py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <BrushHeading as="h1" className="text-4xl sm:text-5xl">
          {t('title')}
        </BrushHeading>
        {settings?.youtube ? (
          <a
            href={settings.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="font-heading font-semibold uppercase tracking-wider text-blue-dark hover:text-ink"
          >
            {t('watchOnYoutube')} →
          </a>
        ) : null}
      </div>

      {sermons.docs.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.docs.map((sermon) => (
            <SermonCard key={sermon.id} sermon={sermon} />
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <p className="text-lg text-ink-soft">{t('empty')}</p>
          {settings?.youtube ? (
            <a
              href={settings.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary mt-6"
            >
              {t('watchOnYoutube')}
            </a>
          ) : null}
        </div>
      )}

      {sermons.totalPages > 1 ? (
        <nav
          aria-label={t('pageOf', { page: sermons.page ?? page, total: sermons.totalPages })}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          {sermons.hasPrevPage ? (
            <Link href={{ pathname: '/sermons', query: { page: page - 1 } }} className="btn-outline">
              ← {t('newerPage')}
            </Link>
          ) : null}
          <span className="text-base text-ink-soft">
            {t('pageOf', { page: sermons.page ?? page, total: sermons.totalPages })}
          </span>
          {sermons.hasNextPage ? (
            <Link href={{ pathname: '/sermons', query: { page: page + 1 } }} className="btn-outline">
              {t('olderPage')} →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
