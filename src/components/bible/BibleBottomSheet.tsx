'use client'

import { useEffect, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import { COMMENTARY_AUTHORS, type BibleVerse, type CommentaryAuthorKey, type TranslationKey } from '@/data/bible/types'

interface BibleBottomSheetProps {
  bookName: string
  chapterNumber: number
  verse: BibleVerse | null
  totalVerses: number
  translation: TranslationKey
  onClose: () => void
  onSelectVerse: (verseNumber: number) => void
}

export function BibleBottomSheet({
  bookName,
  chapterNumber,
  verse,
  totalVerses,
  translation,
  onClose,
  onSelectVerse,
}: BibleBottomSheetProps) {
  const [copied, setCopied] = useState(false)
  const [selectedAuthorKey, setSelectedAuthorKey] = useState<CommentaryAuthorKey>('macdonald')

  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Блокировка прокрутки фона при открытой шторке на телефоне
  useEffect(() => {
    if (verse) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [verse])

  if (!verse) return null

  const verseText = verse.text[translation] ?? verse.text.rst

  const handleCopy = async () => {
    const translationLabel = translation === 'cars' ? 'Восточный перевод' : 'Синодальный'
    const textToCopy = `${bookName} ${chapterNumber}:${verse.number} (${translationLabel}) — «${verseText}»`
    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Игнорируем в случае ограничений буфера
    }
  }

  const hasPrev = verse.number > 1
  const hasNext = verse.number < totalVerses

  // Выбираем активный комментарий из доступных для стиха
  const activeCommentary =
    verse.commentaries.find((c) => c.authorKey === selectedAuthorKey) ??
    verse.commentaries[0] ??
    null

  return (
    <div className="fixed inset-0 z-50 flex justify-center">
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Выезжающая шторка */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`Толкование: ${bookName} ${chapterNumber}:${verse.number}`}
        className="fixed bottom-0 inset-x-0 mx-auto w-full max-w-2xl max-h-[88vh] sm:max-h-[82vh] flex flex-col rounded-t-3xl border-t border-ink/15 bg-paper shadow-2xl z-50 animate-in slide-in-from-bottom duration-250 ease-out pb-[env(safe-area-inset-bottom,0px)]"
      >
        {/* Индикатор для свайпа / верхняя полоса */}
        <div className="flex flex-col items-center pt-2.5 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-ink/20" />
        </div>

        {/* Шапка шторки */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2 border-b border-ink/10">
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="font-heading text-lg sm:text-2xl font-bold tracking-normal text-ink truncate">
              {bookName} {chapterNumber}:{verse.number}
            </h2>
            <span className="text-[11px] sm:text-xs uppercase font-heading font-semibold text-ink-soft shrink-0">
              {translation === 'cars' ? 'Восточный' : 'Синодальный'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть толкование"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ice transition-colors shrink-0"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Прокручиваемое содержимое */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4">
          {/* Цитата выбранного стиха (шрифт без засечек) */}
          <div className="rounded-2xl border border-ink/10 bg-white p-3.5 sm:p-4 shadow-xs">
            <span className="chip bg-blue-light/30 text-blue-dark text-xs mb-1.5 sm:mb-2">
              Стих {verse.number}
            </span>
            <p className="font-sans text-base sm:text-xl font-medium leading-relaxed text-ink italic mt-1">
              «{verseText}»
            </p>
          </div>

          {/* Блок толкований с переключением авторов */}
          {verse.commentaries.length > 0 ? (
            <div className="rounded-2xl border border-ink/10 bg-white/70 p-3.5 sm:p-5 shadow-xs space-y-3">
              {/* Переключатель автора комментария */}
              {verse.commentaries.length > 1 ? (
                <div className="flex flex-wrap gap-1.5 border-b border-ink/10 pb-3">
                  {verse.commentaries.map((c) => {
                    const isSelected = activeCommentary?.authorKey === c.authorKey
                    const authorMeta = COMMENTARY_AUTHORS.find((a) => a.key === c.authorKey)
                    return (
                      <button
                        key={c.authorKey}
                        type="button"
                        onClick={() => setSelectedAuthorKey(c.authorKey)}
                        className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-blue-dark text-white shadow-xs'
                            : 'bg-sand/60 text-ink hover:bg-ice'
                        }`}
                      >
                        <span className="sm:hidden">{authorMeta?.shortName ?? c.authorName}</span>
                        <span className="hidden sm:inline">{c.authorName}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {activeCommentary ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip bg-blue-dark text-white text-xs">
                      Толкование
                    </span>
                    <span className="font-heading text-xs uppercase font-bold tracking-wider text-ink-soft">
                      {activeCommentary.authorName}
                    </span>
                  </div>

                  {activeCommentary.title ? (
                    <h3 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wide text-blue-dark pt-1">
                      {activeCommentary.title}
                    </h3>
                  ) : null}

                  <p className="text-sm sm:text-lg leading-relaxed text-ink">
                    {activeCommentary.text}
                  </p>

                  {activeCommentary.crossReferences && activeCommentary.crossReferences.length > 0 ? (
                    <div className="mt-3 pt-3 border-t border-ink/10">
                      <div className="text-xs uppercase font-heading font-semibold tracking-wider text-ink-soft mb-1.5">
                        Параллельные места Писания:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activeCommentary.crossReferences.map((ref) => (
                          <span
                            key={ref}
                            className="rounded-md bg-ice px-2 py-0.5 text-xs font-semibold text-blue-dark"
                          >
                            {ref}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-ink/10 bg-white/60 p-4 text-center text-ink-soft">
              Для этого стиха толкование готовится.
            </div>
          )}
        </div>

        {/* Нижняя панель действий со стихом */}
        <div className="border-t border-ink/10 bg-paper/95 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => onSelectVerse(verse.number - 1)}
            className="btn-outline text-xs sm:text-sm px-2.5 sm:px-3 py-2 disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <Arrow direction="left" className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>{hasPrev ? `Стих ${verse.number - 1}` : 'Стих 1'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="btn text-xs sm:text-sm px-2.5 sm:px-3 py-2 border border-ink/15 hover:bg-ice transition-colors inline-flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <span>{copied ? 'Скопировано! ✓' : 'Скопировать'}</span>
          </button>

          <button
            type="button"
            disabled={!hasNext}
            onClick={() => onSelectVerse(verse.number + 1)}
            className="btn-primary text-xs sm:text-sm px-2.5 sm:px-3 py-2 disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-1 sm:gap-1.5 shrink-0"
          >
            <span>{hasNext ? `Стих ${verse.number + 1}` : `Стих ${totalVerses}`}</span>
            <Arrow className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </section>
    </div>
  )
}
