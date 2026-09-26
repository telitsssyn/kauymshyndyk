import { useFormatter, useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { News } from '@/payload-types'

import { Arrow } from './Arrow'
import { PayloadImage } from './PayloadImage'

export function NewsCard({ news }: { news: News }) {
  const t = useTranslations()
  const format = useFormatter()
  const slug = news.slug ?? String(news.id)

  return (
    <article className="card relative flex flex-col transition-shadow hover:shadow-md">
      <PayloadImage
        media={news.cover}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="aspect-[16/10] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          {news.eventDate ? (
            <>
              <span className="chip bg-blue-dark text-white">{t('news.event')}</span>
              <time className="chip" dateTime={news.eventDate}>
                {format.dateTime(new Date(news.eventDate), {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </>
          ) : (
            <time className="chip" dateTime={news.publishedDate}>
              {format.dateTime(new Date(news.publishedDate), {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          )}
        </div>
        <h3 className="text-xl normal-case tracking-normal">
          {/* Ссылка растянута на всю карточку через after:inset-0 */}
          <Link
            href={{ pathname: '/news/[slug]', params: { slug } }}
            className="hover:text-blue-dark after:absolute after:inset-0 after:content-['']"
          >
            {news.title}
          </Link>
        </h3>
        {news.excerpt ? <p className="text-base text-ink-soft">{news.excerpt}</p> : null}
        <span aria-hidden="true" className="mt-auto inline-flex items-center gap-1.5 pt-1 font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
          <span>{t('common.readMore')}</span>
          <Arrow className="h-3.5 w-3.5" />
        </span>
      </div>
    </article>
  )
}
