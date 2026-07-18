import type { Metadata } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { Link } from '@/i18n/navigation'
import { getNewsBySlug, getNewsList } from '@/lib/queries'
import { routing } from '@/i18n/routing'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const news = await getNewsList(50)
    return routing.locales.flatMap((locale) =>
      news.docs
        .filter((item) => item.slug)
        .map((item) => ({ locale, slug: item.slug as string })),
    )
  } catch {
    // Во время сборки без базы данных просто не пререндерим
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const news = await getNewsBySlug(slug)
  if (!news) return {}

  const cover = typeof news.cover === 'object' ? news.cover : null
  return {
    title: news.title,
    description: news.excerpt || undefined,
    openGraph: {
      title: news.title,
      description: news.excerpt || undefined,
      type: 'article',
      images: cover?.sizes?.hero?.url
        ? [{ url: cover.sizes.hero.url }]
        : cover?.url
          ? [{ url: cover.url }]
          : undefined,
    },
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [news, t, tNav, format] = await Promise.all([
    getNewsBySlug(slug),
    getTranslations('news'),
    getTranslations('nav'),
    getFormatter(),
  ])

  if (!news) notFound()

  const eventJsonLd = news.eventDate
    ? {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: news.title,
        startDate: news.eventDate,
        description: news.excerpt || undefined,
      }
    : null

  return (
    <article className="container-site max-w-4xl py-10 sm:py-14">
      {eventJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      ) : null}

      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { href: '/news', label: t('title') },
          { label: news.title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <time className="chip" dateTime={news.publishedDate}>
          {format.dateTime(new Date(news.publishedDate), {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
        {news.eventDate ? (
          <span className="chip bg-blue-dark text-white">
            {t('eventDate', {
              date: format.dateTime(new Date(news.eventDate), {
                day: 'numeric',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit',
              }),
            })}
          </span>
        ) : null}
      </div>

      <h1 className="mt-5 text-3xl normal-case tracking-normal sm:text-4xl">{news.title}</h1>

      {typeof news.cover === 'object' ? (
        <div className="mt-8">
          <PayloadImage
            media={news.cover}
            sizes="(min-width: 896px) 896px, 100vw"
            priority
            className="w-full rounded-3xl object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8">
        <RichText data={news.content} />
      </div>

      <div className="mt-12">
        <Link href="/news" className="btn-outline">
          ← {t('backToList')}
        </Link>
      </div>
    </article>
  )
}
