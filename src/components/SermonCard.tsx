import { useFormatter } from 'next-intl'

import { Link } from '@/i18n/navigation'
import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'
import type { Sermon } from '@/payload-types'

export function SermonCard({ sermon }: { sermon: Sermon }) {
  const format = useFormatter()
  const slug = sermon.slug ?? String(sermon.id)
  const videoId = extractVideoId(sermon.youtubeUrl)

  return (
    <article className="card flex flex-col transition-shadow hover:shadow-md">
      <Link
        href={{ pathname: '/sermons/[slug]', params: { slug } }}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block"
      >
        {videoId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={youtubeThumbnail(videoId)}
            alt=""
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="aspect-video w-full object-cover"
          />
        ) : (
          <span className="block aspect-video w-full bg-ice" />
        )}
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink/70 text-white"
        >
          <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
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
        <h3 className="text-xl normal-case tracking-normal">
          <Link
            href={{ pathname: '/sermons/[slug]', params: { slug } }}
            className="hover:text-blue-dark"
          >
            {sermon.title}
          </Link>
        </h3>
        {sermon.preacher ? <p className="text-base text-ink-soft">{sermon.preacher}</p> : null}
      </div>
    </article>
  )
}
