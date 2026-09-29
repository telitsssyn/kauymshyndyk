'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import {
  BIBLE_TRANSLATIONS,
  fetchBibleChapter,
  type BibleChapter,
  type BibleVerse,
  type TranslationKey,
} from '@/data/bible'
import { BIBLE_BOOKS } from '@/data/bible/books'

import { BibleBookSelector } from './BibleBookSelector'
import { BibleBottomSheet } from './BibleBottomSheet'

const LS_KEY = 'bible-reading-progress'

function getAdjacentBook(currentSlug: string, direction: 'prev' | 'next') {
  const idx = BIBLE_BOOKS.findIndex((b) => b.slug === currentSlug)
  if (idx === -1) return null
  const adjacentIdx = direction === 'next' ? idx + 1 : idx - 1
  return BIBLE_BOOKS[adjacentIdx] ?? null
}

interface BibleReaderProps {
  initialChapter?: BibleChapter
}

type FontSize = 'normal' | 'large' | 'huge'

export function BibleReader({ initialChapter }: BibleReaderProps) {
  const [bookSlug, setBookSlug] = useState(initialChapter?.bookSlug ?? 'genesis')
  const [chapterNumber, setChapterNumber] = useState(initialChapter?.chapter ?? 1)
  const [chapter, setChapter] = useState<BibleChapter | null>(initialChapter ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [translation, setTranslation] = useState<TranslationKey>('rst')
  const [isTranslationOpen, setIsTranslationOpen] = useState(false)
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null)
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false)
  const [fontSize, setFontSize] = useState<FontSize>('large')
  const [showHint, setShowHint] = useState(true)
  const [readingProgress, setReadingProgress] = useState(0)

  const translationRef = useRef<HTMLDivElement | null>(null)
  const articleRef = useRef<HTMLElement | null>(null)

  // Динамическая загрузка главы из JSON
  useEffect(() => {
    // Пропускаем, если initialChapter совпадает с запрошенной главой
    if (
      initialChapter &&
      bookSlug === initialChapter.bookSlug &&
      chapterNumber === initialChapter.chapter
    ) {
      setChapter(initialChapter)
      return
    }

    let cancelled = false
    setIsLoading(true)

    fetchBibleChapter(bookSlug, chapterNumber).then((data) => {
      if (cancelled) return
      setChapter(data)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [bookSlug, chapterNumber, initialChapter])

  // Сохранение прогресса чтения в localStorage
  useEffect(() => {
    if (chapter) {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ bookSlug, chapterNumber }))
      } catch { /* ignore */ }
    }
  }, [bookSlug, chapterNumber, chapter])

  // Восстановление прогресса при первой загрузке
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) {
        const { bookSlug: savedSlug, chapterNumber: savedChapter } = JSON.parse(saved)
        if (savedSlug && savedChapter && (savedSlug !== 'genesis' || savedChapter !== 1)) {
          setBookSlug(savedSlug)
          setChapterNumber(savedChapter)
        }
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Закрытие меню перевода по клику снаружи
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (translationRef.current && !translationRef.current.contains(e.target as Node)) {
        setIsTranslationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Progress bar при чтении
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      const rect = articleRef.current.getBoundingClientRect()
      const total = articleRef.current.scrollHeight
      const visible = window.innerHeight
      const scrolled = -rect.top + visible
      const progress = Math.min(100, Math.max(0, (scrolled / total) * 100))
      setReadingProgress(progress)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [chapter])

  // Клавиатурная навигация (←/→ для глав)
  const handleNavKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!chapter) return
      // Не перехватываем, если фокус в input/textarea или открыта модалка
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (isBookSelectorOpen || selectedVerseNumber !== null) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (chapterNumber > 1) {
          handleSelectChapter(bookSlug, chapterNumber - 1)
        } else {
          const prevBook = getAdjacentBook(bookSlug, 'prev')
          if (prevBook) handleSelectChapter(prevBook.slug, prevBook.chaptersCount)
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (chapterNumber < chapter.totalChapters) {
          handleSelectChapter(bookSlug, chapterNumber + 1)
        } else {
          const nextBook = getAdjacentBook(bookSlug, 'next')
          if (nextBook) handleSelectChapter(nextBook.slug, 1)
        }
      }
    },
    [chapter, chapterNumber, bookSlug, isBookSelectorOpen, selectedVerseNumber],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleNavKeyDown)
    return () => document.removeEventListener('keydown', handleNavKeyDown)
  }, [handleNavKeyDown])

  const selectedVerse: BibleVerse | null =
    selectedVerseNumber !== null
      ? chapter?.verses.find((v) => v.number === selectedVerseNumber) ?? null
      : null

  const activeTranslationMeta =
    BIBLE_TRANSLATIONS.find((t) => t.key === translation) ?? BIBLE_TRANSLATIONS[0]

  const fontSizeClass =
    fontSize === 'normal'
      ? 'text-base leading-relaxed'
      : fontSize === 'huge'
      ? 'text-xl sm:text-2xl leading-loose'
      : 'text-lg sm:text-xl leading-relaxed'

  const handleSelectChapter = (newBookSlug: string, newChapter: number) => {
    setBookSlug(newBookSlug)
    setChapterNumber(newChapter)
    setSelectedVerseNumber(null)
    
    // Даем React время обновить DOM перед тем, как скроллить
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }

  // Показываем скелетон при загрузке
  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-4 sm:p-8 md:p-10 border border-ink/10 bg-white/90 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-sand/60 rounded-xl w-48 mx-auto" />
            <div className="h-5 bg-sand/40 rounded-lg w-32 mx-auto" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="h-6 w-6 bg-sand/60 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-4 bg-sand/40 rounded" />
                    <div className="h-4 bg-sand/30 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если главы нет на диске
  if (!chapter) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="card p-8 sm:p-12 border border-ink/10 bg-white/90 shadow-sm text-center">
          <p className="text-xl font-heading font-bold text-ink mb-2">Глава временно недоступна</p>
          <p className="text-sm text-ink-soft mb-6">
            Текст этой главы сейчас загружается или находится в процессе добавления.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsBookSelectorOpen(true)}
              className="btn btn-secondary text-sm"
            >
              Выбрать другую главу
            </button>
            <button
              type="button"
              onClick={() => handleSelectChapter('genesis', 1)}
              className="btn btn-primary text-sm"
            >
              Перейти к Бытие 1
            </button>
          </div>
        </div>
        <BibleBookSelector
          currentBookSlug={bookSlug}
          currentChapter={chapterNumber}
          isOpen={isBookSelectorOpen}
          onClose={() => setIsBookSelectorOpen(false)}
          onSelectChapter={handleSelectChapter}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Панель управления чтением */}
      <div className="sticky top-16 z-30 mb-4 sm:mb-6 rounded-2xl border border-ink/10 bg-paper/95 p-2 sm:p-2.5 shadow-sm backdrop-blur relative">
        {/* Progress bar чтения — абсолютно позиционирован внутри тулбара */}
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl bg-blue-dark/60 transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Прогресс чтения главы"
        />
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
          {/* Кнопка выбора книги и главы */}
          <button
            type="button"
            onClick={() => setIsBookSelectorOpen(true)}
            className="h-10 min-h-0 rounded-xl border-2 border-blue-dark bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wide text-blue-dark hover:bg-ice transition-colors flex items-center gap-1.5 sm:gap-2 min-w-0"
            aria-label="Выбрать книгу или главу"
          >
            <span className="truncate">
              <span className="sm:hidden">{chapter.bookName} {chapter.chapter}</span>
              <span className="hidden sm:inline">{chapter.bookName}, глава {chapter.chapter}</span>
            </span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 shrink-0"
              aria-hidden="true"
            >
              <path d="M3.75 6.25L8 10.5l4.25-4.25" />
            </svg>
          </button>

          {/* Настройки: Размер шрифта и Выбор перевода */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Размер шрифта */}
            <div className="h-10 min-h-0 flex items-center rounded-xl border border-ink/15 bg-white p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (fontSize === 'huge') setFontSize('large')
                  else if (fontSize === 'large') setFontSize('normal')
                }}
                disabled={fontSize === 'normal'}
                className="flex h-full aspect-square items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                title="Уменьшить шрифт"
              >
                A-
              </button>
              <span className="hidden sm:inline px-1.5 text-xs font-heading font-bold text-ink-soft uppercase">
                {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.5x'}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (fontSize === 'normal') setFontSize('large')
                  else if (fontSize === 'large') setFontSize('huge')
                }}
                disabled={fontSize === 'huge'}
                className="flex h-full aspect-square items-center justify-center rounded-lg text-xs sm:text-base font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                title="Увеличить шрифт"
              >
                A+
              </button>
            </div>

            {/* Выпадающее меню перевода (справа от размера шрифта) */}
            <div ref={translationRef} className="relative">
              <button
                type="button"
                onClick={() => setIsTranslationOpen(!isTranslationOpen)}
                className="h-10 min-h-0 rounded-xl border border-ink/15 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider text-ink hover:bg-ice transition-colors inline-flex items-center gap-1.5 shrink-0"
                aria-expanded={isTranslationOpen}
                aria-label="Выбрать перевод Библии"
              >
                <span>Перевод</span>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`h-3.5 w-3.5 transition-transform ${isTranslationOpen ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M3.75 6.25L8 10.5l4.25-4.25" />
                </svg>
              </button>

              {isTranslationOpen ? (
                <div className="absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink/10 bg-paper/98 p-2 shadow-xl backdrop-blur animate-in fade-in-0 zoom-in-95 duration-150">
                  <div className="px-2 py-1 text-[11px] font-heading font-bold uppercase tracking-wider text-ink-soft">
                    Доступные переводы
                  </div>
                  {BIBLE_TRANSLATIONS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => {
                        setTranslation(t.key)
                        setIsTranslationOpen(false)
                      }}
                      className={`w-full flex flex-col items-start rounded-xl p-2.5 text-left transition-colors ${
                        translation === t.key
                          ? 'bg-ice text-blue-dark font-medium'
                          : 'hover:bg-ice/50 text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="font-heading text-sm font-semibold tracking-wide">
                          {t.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-ink-soft">
                          ({t.badge})
                        </span>
                        {translation === t.key ? (
                          <span className="ml-auto text-xs text-blue-dark font-bold">✓</span>
                        ) : null}
                      </div>
                      <span className="text-xs text-ink-soft mt-0.5 leading-snug">
                        {t.description}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Подсказка для читателя */}
      {showHint ? (
        <aside
          role="note"
          aria-label="Подсказка по чтению"
          className="mb-4 sm:mb-6 flex items-center justify-between gap-2.5 rounded-2xl border border-blue-light/50 bg-ice/40 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink-soft font-sans"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-blue-dark text-white text-xs font-bold">
              💬
            </span>
            <span>
              <strong>Совет:</strong> нажмите на любой стих, чтобы открыть толкования (Уильям МакДональд и Александр Лопухин).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowHint(false)}
            aria-label="Скрыть подсказку"
            className="text-ink-soft hover:text-ink text-base px-1"
          >
            ✕
          </button>
        </aside>
      ) : null}

      {/* Текст Библии (строго без засечек font-sans) */}
      <article ref={articleRef} className="card p-4 sm:p-8 md:p-10 border border-ink/10 bg-white/90 shadow-sm font-sans">
        <div className="border-b border-ink/10 pb-4 sm:pb-6 mb-4 sm:mb-6 text-center">
          <span className="chip bg-sand/60 text-ink-soft text-xs uppercase mb-2">
            {activeTranslationMeta.name} ({activeTranslationMeta.badge})
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-wider text-ink">
            {chapter.bookName}
          </h1>
          <p className="mt-1 font-heading text-lg sm:text-xl font-semibold text-blue-dark uppercase tracking-wide">
            Глава {chapter.chapter}
          </p>
        </div>

        {/* Список стихов */}
        <div className={`space-y-2.5 sm:space-y-3.5 ${fontSizeClass}`}>
          {chapter.verses.map((verse) => {
            const isSelected = selectedVerseNumber === verse.number
            const hasCommentary = verse.commentaries.length > 0
            const verseText = verse.text[translation] ?? verse.text.rst

            return (
              <div
                key={verse.number}
                onClick={() => setSelectedVerseNumber(verse.number)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setSelectedVerseNumber(verse.number)
                  }
                }}
                className={`group relative flex items-start gap-2 sm:gap-2.5 rounded-xl p-2 sm:p-3 transition-colors cursor-pointer select-text ${
                  isSelected
                    ? 'bg-ice/70 ring-2 ring-blue-dark text-ink'
                    : 'hover:bg-ice/30 active:bg-ice/40 text-ink'
                }`}
              >
                {/* Номер стиха */}
                <span
                  className={`mt-0.5 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md font-heading text-xs font-bold transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-blue-dark text-white'
                      : 'bg-sand/60 text-ink-soft group-hover:bg-blue-dark group-hover:text-white'
                  }`}
                >
                  {verse.number}
                </span>

                {/* Текст стиха */}
                <div className="flex-1">
                  <span>{verseText}</span>
                  {hasCommentary ? (
                    <span
                      title="Есть толкования (нажмите для просмотра)"
                      className="ml-1.5 inline-flex items-center gap-0.5 rounded-md bg-ice/80 px-1.5 py-0.5 text-[11px] font-heading font-semibold text-blue-dark opacity-80 group-hover:opacity-100 transition-opacity"
                    >
                      💬
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        {/* Навигация по главам внизу */}
        <div className="mt-8 sm:mt-10 border-t border-ink/10 pt-5 sm:pt-6 font-heading">
          {/* Заголовок с номером главы на мобильных */}
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3 sm:hidden">
            Глава {chapter.chapter} из {chapter.totalChapters}
          </div>

          {(() => {
            const prevBook = getAdjacentBook(bookSlug, 'prev')
            const nextBook = getAdjacentBook(bookSlug, 'next')
            const isFirstChapter = chapterNumber === 1
            const isLastChapter = chapterNumber >= chapter.totalChapters
            const hasPrevNav = !isFirstChapter || prevBook
            const hasNextNav = !isLastChapter || nextBook

            return (
              <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-3">
                {/* Предыдущая глава или книга */}
                {hasPrevNav ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isFirstChapter) {
                        handleSelectChapter(bookSlug, chapterNumber - 1)
                      } else if (prevBook) {
                        handleSelectChapter(prevBook.slug, prevBook.chaptersCount)
                      }
                    }}
                    className="btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-w-0"
                  >
                    <Arrow direction="left" className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {!isFirstChapter
                        ? `Глава ${chapterNumber - 1}`
                        : `${prevBook!.shortName} ${prevBook!.chaptersCount}`}
                    </span>
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}

                {/* Десктопный счетчик глав */}
                <span className="hidden sm:inline text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  Глава {chapter.chapter} из {chapter.totalChapters}
                </span>

                {/* Следующая глава или книга */}
                {hasNextNav ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (!isLastChapter) {
                        handleSelectChapter(bookSlug, chapterNumber + 1)
                      } else if (nextBook) {
                        handleSelectChapter(nextBook.slug, 1)
                      }
                    }}
                    className={`btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-w-0 ${
                      !hasPrevNav ? 'col-span-2' : ''
                    }`}
                  >
                    <span className="truncate">
                      {!isLastChapter
                        ? `Глава ${chapterNumber + 1}`
                        : `${nextBook!.name} →`}
                    </span>
                    <Arrow className="h-3.5 w-3.5 shrink-0" />
                  </button>
                ) : (
                  <div className="hidden sm:block" />
                )}
              </div>
            )
          })()}
        </div>
      </article>

      {/* Выезжающая шторка с толкованиями */}
      <BibleBottomSheet
        bookName={chapter.bookName}
        chapterNumber={chapter.chapter}
        verse={selectedVerse}
        totalVerses={chapter.verses.length}
        translation={translation}
        onClose={() => setSelectedVerseNumber(null)}
        onSelectVerse={(verseNum) => setSelectedVerseNumber(verseNum)}
      />

      {/* Селектор книг Библии */}
      <BibleBookSelector
        currentBookSlug={bookSlug}
        currentChapter={chapterNumber}
        isOpen={isBookSelectorOpen}
        onClose={() => setIsBookSelectorOpen(false)}
        onSelectChapter={handleSelectChapter}
      />
    </div>
  )
}
