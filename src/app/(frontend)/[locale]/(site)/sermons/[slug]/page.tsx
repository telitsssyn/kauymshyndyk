import type { Metadata } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { SermonNotes } from '@/components/SermonNotes'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getSermonBySlug, getSermonsList, getSettings } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'

// Готовая страница отдаётся из кэша, а не пересобирается на каждый заход:
// при сохранении проповеди в админке кэш сбрасывается сразу (lib/revalidate.ts),
// час здесь — страховка на случай изменений в обход хуков.
export const revalidate = 3600

// Проповеди, существующие на момент сборки, рендерятся заранее; всё, что
// появится позже, соберётся при первом обращении и тоже попадёт в кэш.
export async function generateStaticParams() {
  try {
    const sermons = await getSermonsList(100)
    return sermons.docs.flatMap((item) => (item.slug ? [{ slug: item.slug }] : []))
  } catch {
    // На сборке без базы просто нечего готовить заранее
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const sermon = await getSermonBySlug(slug)
  if (!sermon) return {}

  // У проповеди с видео превью берём с YouTube: обложка заполнена не всегда,
  // а кадр из ролика узнаётся лучше общего фото зала
  const videoId = sermon.youtubeUrl ? extractVideoId(sermon.youtubeUrl) : null

  return buildMetadata({
    href: { pathname: '/sermons/[slug]', params: { slug } },
    title: sermon.title,
    description: richTextToPlain(sermon.description),
    image: videoId ? youtubeThumbnail(videoId) : sermon.cover,
    type: videoId ? 'video.other' : 'article',
  })
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
        <Link href="/sermons" className="group btn-outline inline-flex items-center gap-2">
          <Arrow direction="left" />
          <span>{t('backToList')}</span>
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
