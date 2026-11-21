'use client'

import { useTranslations } from 'next-intl'
import type { ReactNode } from 'react'

import type {
  BibleChapter,
  BibleVerseText,
  CommentaryAuthorKey,
  TranslationKey,
} from '@/data/bible/types'

import type { FontSize } from './preferences'

/** Пока показываем одно толкование: у МакДональда покрыты все стихи */
export const COMMENTARY_AUTHOR: CommentaryAuthorKey = 'macdonald'

/** Перевод, под который написано толкование; в этом режиме он не меняется */
export const COMMENTARY_TRANSLATION: TranslationKey = 'rst'

export type CommentaryStatus = 'loading' | 'ready' | 'error'

const VERSE_SIZE: Record<FontSize, string> = {
  normal: 'text-base leading-relaxed',
  large: 'text-lg sm:text-xl leading-relaxed',
  huge: 'text-xl sm:text-2xl leading-loose',
}

const COMMENTARY_SIZE: Record<FontSize, string> = {
  normal: 'text-[15px] leading-relaxed',
  large: 'text-base sm:text-lg leading-relaxed',
  huge: 'text-lg sm:text-xl leading-relaxed',
}

/** Абзацы; строки вида «...» — подзаголовки */
function renderBody(text: string): ReactNode {
  if (!text.trim()) return null
  const elements: ReactNode[] = []
  let paragraph: string[] = []
  const flush = () => {
    if (paragraph.length === 0) return
    elements.push(
      <p key={elements.length} className="whitespace-pre-line">
        {paragraph.join('\n')}
      </p>,
    )
    paragraph = []
  }
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (/^«.+»$/.test(trimmed) && trimmed.length < 120) {
      flush()
      elements.push(
        <h4 key={elements.length} className="font-heading font-bold text-blue-dark pt-1">
          {trimmed}
        </h4>,
      )
    } else {
      paragraph.push(line)
    }
  }
  flush()
  return elements
}

interface BibleCommentaryProps {
  verses: BibleVerseText[]
  /** Полная глава с толкованиями; null — ещё грузится или не загрузилась */
  fullChapter: BibleChapter | null
  status: CommentaryStatus
  onRetry: () => void
  translation: TranslationKey
  fontSize: FontSize
}

export function BibleCommentary({
  verses,
  fullChapter,
  status,
  onRetry,
  translation,
  fontSize,
}: BibleCommentaryProps) {
  const t = useTranslations('bible.commentary')

  return (
    <div className="space-y-8 sm:space-y-10">
      {status === 'error' ? (
        <div className="rounded-2xl border border-ink/10 bg-ice/30 p-4 text-center text-ink-soft space-y-3">
          <p>{t('loadError')}</p>
          <button type="button" onClick={onRetry} className="btn-outline text-sm px-4">
            {t('retry')}
          </button>
        </div>
      ) : null}

      {verses.map((verse) => {
        const comments =
          fullChapter?.verses
            .find((v) => v.number === verse.number)
            ?.commentaries.filter((c) => c.authorKey === COMMENTARY_AUTHOR) ?? []

        return (
          <section
            key={verse.number}
            id={`v${verse.number}`}
            data-verse={verse.number}
            className="scroll-mt-36"
          >
            <blockquote
              className={`rounded-r-xl border-l-4 border-blue-dark bg-ice/40 px-3.5 sm:px-5 py-2.5 sm:py-3.5 font-medium text-ink ${VERSE_SIZE[fontSize]}`}
            >
              <sup className="mr-1 font-heading text-[0.65em] font-bold text-blue-dark">
                {verse.number}
              </sup>
              {verse.text[translation] ?? verse.text.rst}
            </blockquote>

            {status === 'loading' && verse.hasCommentary ? (
              <div className="mt-4 space-y-2.5 animate-pulse" aria-hidden="true">
                <div className="h-4 rounded bg-sand/50" />
                <div className="h-4 w-5/6 rounded bg-sand/40" />
                <div className="h-4 w-2/3 rounded bg-sand/30" />
              </div>
            ) : null}

            {comments.map((comm, idx) => {
              // У МакДональда заголовок только в title; первая строка текста —
              // обычно само толкование (часто единственная строка)
              const { title, text } = comm
              return (
                <div
                  key={idx}
                  className={`mt-4 space-y-3 text-ink ${COMMENTARY_SIZE[fontSize]}`}
                >
                  {title ? (
                    <h3 className="font-heading text-[0.95em] font-bold uppercase tracking-wide text-blue-dark">
                      {title}
                    </h3>
                  ) : null}
                  {renderBody(text)}
                  {comm.crossReferences && comm.crossReferences.length > 0 ? (
                    <div className="pt-1">
                      <span className="mr-1.5 text-xs font-heading font-semibold uppercase tracking-wider text-ink-soft">
                        {t('crossRefs')}
                      </span>
                      {comm.crossReferences.map((ref) => (
                        <span
                          key={ref}
                          className="mr-1.5 inline-block rounded-md bg-ice px-2 py-0.5 text-xs font-semibold text-blue-dark"
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </section>
        )
      })}

      {status === 'loading' ? <span className="sr-only" role="status">{t('loading')}</span> : null}
    </div>
  )
}
