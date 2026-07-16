import type { Metadata } from 'next'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { getSermonBySlug, getSermonsList } from '@/lib/queries'
import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const sermons = await getSermonsList(50)
    return routing.locales.flatMap((locale) =>
      sermons.docs
        .filter((sermon) => sermon.slug)
        .map((sermon) => ({ locale, slug: sermon.slug as string })),
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
  const sermon = await getSermonBySlug(slug)
  if (!sermon) return {}

  const videoId = extractVideoId(sermon.youtubeUrl)
  return {
    title: sermon.title,
    description: sermon.description || undefined,
    openGraph: {
      title: sermon.title,
      description: sermon.description || undefined,
      type: 'video.other',
      images: videoId ? [{ url: youtubeThumbnail(videoId) }] : undefined,
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

  const [sermon, t, format] = await Promise.all([
    getSermonBySlug(slug),
    getTranslations('sermons'),
    getFormatter(),
  ])

  if (!sermon) notFound()

  const videoId = extractVideoId(sermon.youtubeUrl)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: sermon.title,
    uploadDate: sermon.date,
    description: sermon.description || undefined,
    thumbnailUrl: videoId ? youtubeThumbnail(videoId) : undefined,
    embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : undefined,
  }

  return (
    <article className="container-site max-w-4xl py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
      </div>

      <h1 className="mt-5 text-3xl normal-case tracking-normal sm:text-4xl">{sermon.title}</h1>
      {sermon.preacher ? <p className="mt-2 text-lg text-ink-soft">{sermon.preacher}</p> : null}

      <div className="mt-6">
        <YouTubeEmbed url={sermon.youtubeUrl} />
      </div>

      {sermon.description ? (
        <p className="mt-6 whitespace-pre-line text-lg">{sermon.description}</p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/sermons" className="btn-outline">
          ← {t('backToList')}
        </Link>
        <a
          href={sermon.youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline"
        >
          {t('watchOnYoutube')}
        </a>
      </div>
    </article>
  )
}
