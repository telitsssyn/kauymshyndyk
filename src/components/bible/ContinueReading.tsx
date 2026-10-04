'use client'

import { useTranslations } from 'next-intl'

import { Arrow } from '@/components/Arrow'
import { BIBLE_BOOKS } from '@/data/bible/books'
import { Link } from '@/i18n/navigation'

import { chapterHref } from './BibleReader'
import { useReadingProgress } from './preferences'

/** Ссылка на место, где читатель остановился в прошлый раз (только на общей странице /bible) */
export function ContinueReading() {
  const t = useTranslations('bible')
  const progress = useReadingProgress()
  if (!progress) return null

  const book = BIBLE_BOOKS.find((b) => b.slug === progress.bookSlug)
  if (!book || progress.chapterNumber < 1 || progress.chapterNumber > book.chaptersCount) return null

  return (
    <Link
      href={chapterHref(book.slug, progress.chapterNumber)}
      className="btn-outline mb-4 sm:mb-6 inline-flex items-center gap-2"
    >
      <span>
        {t('continueReading', { place: t('chapterShort', { book: book.name, chapter: progress.chapterNumber }) })}
      </span>
      <Arrow className="h-4 w-4" />
    </Link>
  )
}
