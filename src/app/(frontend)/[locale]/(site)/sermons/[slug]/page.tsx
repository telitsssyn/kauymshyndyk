import type { Metadata } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { SermonNotes } from '@/components/SermonNotes'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { Link } from '@/i18n/navigation'
import { getSermonBySlug, getSettings } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'

// Страница всегда рендерится на сервере: при пустой таблице на момент сборки
// Next иначе считает маршрут статическим и падает с DYNAMIC_SERVER_USAGE.
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sermon = await getSermonBySlug(slug)
  if (!sermon) return {}

  const videoId = sermon.youtubeUrl ? extractVideoId(sermon.youtubeUrl) : null
  const cover = typeof sermon.cover === 'object' ? sermon.cover : null
  const ogImage = videoId
    ? youtubeThumbnail(videoId)
    : (cover?.sizes?.hero?.url ?? cover?.url ?? undefined)
  const description = richTextToPlain(sermon.description)

  return {
    title: sermon.title,
    description,
    openGraph: {
      title: sermon.title,
      description,
      type: videoId ? 'video.other' : 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function SermonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [sermon, settings, t, tNav, format] = await Promise.all([
    getSermonBySlug(slug),
    getSettings(),
    getTranslations('sermons'),
    getTranslations('nav'),
    getFormatter(),
  ])

  if (!sermon) notFound()

  const videoId = sermon.youtubeUrl ? extractVideoId(sermon.youtubeUrl) : null
  const jsonLd = videoId
    ? {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: sermon.title,
        uploadDate: sermon.date,
        description: richTextToPlain(sermon.description),
        thumbnailUrl: youtubeThumbnail(videoId),
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      }
    : null

  return (
    <article className="container-site max-w-4xl py-10 sm:py-14">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { href: '/sermons', label: t('title') },
          { label: sermon.title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <time className="chip" dateTime={sermon.date}>
          {format.dateTime(new Date(sermon.date), {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </time>
        {sermon.scripture ? (
          <span className="chip bg-navy text-white">{sermon.scripture}</span>
        ) : null}
        {!videoId ? <span className="chip bg-blue text-ink">{t('comingSoon')}</span> : null}
      </div>

      <h1 className="mt-5 text-3xl normal-case tracking-normal sm:text-4xl">{sermon.title}</h1>
      {sermon.preacher ? <p className="mt-2 text-lg text-ink-soft">{sermon.preacher}</p> : null}

      {videoId && sermon.youtubeUrl ? (
        <div className="mt-6">
          <YouTubeEmbed url={sermon.youtubeUrl} />
        </div>
      ) : (
        <div className="mt-6">
          {sermon.cover && typeof sermon.cover === 'object' ? (
            <PayloadImage
              media={sermon.cover}
              sizes="(min-width: 896px) 896px, 100vw"
              priority
              className="w-full rounded-2xl object-cover"
            />
          ) : null}
          <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl bg-ice-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">{t('videoSoon')}</p>
            {settings?.youtube ? (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shrink-0"
              >
                {t('watchOnYoutube')}
              </a>
            ) : null}
          </div>
        </div>
      )}

      {sermon.description ? (
        <div className="mt-6">
          <RichText data={sermon.description} />
        </div>
      ) : null}

      <SermonNotes slug={slug} />

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/sermons" className="btn-outline">
          ← {t('backToList')}
        </Link>
        {sermon.youtubeUrl ? (
          <a
            href={sermon.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            {t('watchOnYoutube')}
          </a>
        ) : null}
      </div>
    </article>
  )
}
