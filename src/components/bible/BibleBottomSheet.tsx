'use client'

import { type ReactNode, useEffect, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import { COMMENTARY_AUTHORS, type BibleVerse, type CommentaryAuthorKey, type TranslationKey, type VerseCommentary } from '@/data/bible/types'

/**
 * Для Лопухина: первая непустая строка текста = заголовок (если нет явного title),
 * подзаголовки вида «...» на отдельной строке рендерятся жирным.
 */
function parseCommentaryContent(comm: VerseCommentary): { title: string | null; body: ReactNode } {
  const lines = comm.text.split('\n')

  // Если есть явный title — просто рендерим текст
  if (comm.title) {
    return {
      title: comm.title,
      body: renderTextWithSubheadings(comm.text),
    }
  }

  // Для Лопухина: извлекаем первую непустую строку как title
  const firstNonEmpty = lines.findIndex((l) => l.trim().length > 0)
  if (firstNonEmpty === -1) {
    return { title: null, body: <span>{comm.text}</span> }
  }

  const extractedTitle = lines[firstNonEmpty].trim()
  const restText = lines
    .slice(firstNonEmpty + 1)
    .join('\n')
    .replace(/^\n+/, '') // убираем пустые строки после заголовка

  return {
    title: extractedTitle,
    body: renderTextWithSubheadings(restText),
  }
}

/** Рендерит текст, выделяя строки вида «...» как подзаголовки */
function renderTextWithSubheadings(text: string): ReactNode {
  if (!text.trim()) return null

  const lines = text.split('\n')
  const elements: ReactNode[] = []
  let currentParagraph: string[] = []
  let key = 0

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key++} className="text-sm sm:text-lg leading-relaxed text-ink whitespace-pre-line">
          {currentParagraph.join('\n')}
        </p>,
      )
      currentParagraph = []
    }
  }

  for (const line of lines) {
    const trimmed = line.trim()
    // Подзаголовок: строка, которая начинается и заканчивается кавычками-ёлочками
    if (/^[«\u00AB].+[»\u00BB]$/.test(trimmed) && trimmed.length < 120) {
      flushParagraph()
      elements.push(
        <h4
          key={key++}
          className="font-heading text-sm sm:text-base font-bold text-blue-dark mt-3 mb-1"
        >
          {trimmed}
        </h4>,
      )
    } else {
      currentParagraph.push(line)
    }
  }
  flushParagraph()

  return <>{elements}</>
}

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

  // Автоматическое переключение на доступного автора при смене стиха
  useEffect(() => {
    if (!verse) return
    const available = COMMENTARY_AUTHORS.filter((a) =>
      verse.commentaries.some((c) => c.authorKey === a.key),
    )
    if (available.length > 0 && !available.some((a) => a.key === selectedAuthorKey)) {
      setSelectedAuthorKey(available[0].key)
    }
  }, [verse, selectedAuthorKey])

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

  // Доступные авторы толкований для данного стиха (строго уникальные)
  const availableAuthors = COMMENTARY_AUTHORS.filter((author) =>
    verse.commentaries.some((c) => c.authorKey === author.key),
  )

  // Текущий выбранный автор (с fallback на первого доступного)
  const activeAuthor =
    availableAuthors.find((a) => a.key === selectedAuthorKey) ??
    availableAuthors[0] ??
    null

  // Все комментарии выбранного автора для данного стиха
  const activeCommentaries = activeAuthor
    ? verse.commentaries.filter((c) => c.authorKey === activeAuthor.key)
    : []

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
              {/* Переключатель автора комментария (строго без дубликатов плашек) */}
              {availableAuthors.length > 1 ? (
                <div className="flex flex-wrap gap-1.5 border-b border-ink/10 pb-3">
                  {availableAuthors.map((author) => {
                    const isSelected = activeAuthor?.key === author.key
                    return (
                      <button
                        key={author.key}
                        type="button"
                        onClick={() => setSelectedAuthorKey(author.key)}
                        className={`rounded-xl px-2.5 sm:px-3 py-1.5 text-xs font-heading font-semibold uppercase tracking-wider transition-colors ${
                          isSelected
                            ? 'bg-blue-dark text-white shadow-xs'
                            : 'bg-sand/60 text-ink hover:bg-ice'
                        }`}
                      >
                        <span className="sm:hidden">{author.shortName}</span>
                        <span className="hidden sm:inline">{author.name}</span>
                      </button>
                    )
                  })}
                </div>
              ) : null}

              {activeAuthor && activeCommentaries.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="chip bg-blue-dark text-white text-xs">
                      Толкование
                    </span>
                    <span className="font-heading text-xs uppercase font-bold tracking-wider text-ink-soft">
                      {activeAuthor.name}
                      {activeAuthor.tagline ? ` • ${activeAuthor.tagline}` : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {activeCommentaries.map((comm, idx) => {
                      const parsed = parseCommentaryContent(comm)
                      return (
                        <div key={idx} className={idx > 0 ? 'pt-3 border-t border-ink/10' : ''}>
                          {parsed.title ? (
                            <h3 className="font-heading text-base sm:text-lg font-bold uppercase tracking-wide text-blue-dark pt-1 mb-2">
                              {parsed.title}
                            </h3>
                          ) : null}

                          <div>{parsed.body}</div>

                          {comm.crossReferences && comm.crossReferences.length > 0 ? (
                            <div className="mt-3 pt-3 border-t border-ink/10">
                              <div className="text-xs uppercase font-heading font-semibold tracking-wider text-ink-soft mb-1.5">
                                Параллельные места Писания:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {comm.crossReferences.map((ref) => (
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
                        </div>
                      )
                    })}
                  </div>
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
