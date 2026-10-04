'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import { BIBLE_BOOKS } from '@/data/bible/books'
import { fetchBibleChapter } from '@/data/bible'
import {
  BIBLE_TRANSLATIONS,
  type BibleChapter,
  type BibleChapterText,
} from '@/data/bible/types'
import { Link, useRouter } from '@/i18n/navigation'

import { BibleBookSelector } from './BibleBookSelector'
import { BibleBottomSheet, type CommentaryStatus } from './BibleBottomSheet'
import {
  saveReadingProgress,
  useFontSizePref,
  useHintHidden,
  useTranslationPref,
} from './preferences'

type ChapterRef = { bookSlug: string; chapter: number; label: string }

/** Адрес страницы главы для Link / router.push */
export const chapterHref = (bookSlug: string, chapter: number) => ({
  pathname: '/bible/[book]/[chapter]' as const,
  params: { book: bookSlug, chapter: String(chapter) },
})

/** Соседняя глава с переходом через границу книги */
function adjacentChapter(
  bookSlug: string,
  chapter: number,
  totalChapters: number,
  direction: 'prev' | 'next',
): ChapterRef | null {
  if (direction === 'prev' && chapter > 1) return { bookSlug, chapter: chapter - 1, label: '' }
  if (direction === 'next' && chapter < totalChapters) {
    return { bookSlug, chapter: chapter + 1, label: '' }
  }
  const idx = BIBLE_BOOKS.findIndex((b) => b.slug === bookSlug)
  const book = BIBLE_BOOKS[direction === 'next' ? idx + 1 : idx - 1]
  if (idx === -1 || !book) return null
  return direction === 'next'
    ? { bookSlug: book.slug, chapter: 1, label: book.name }
    : { bookSlug: book.slug, chapter: book.chaptersCount, label: `${book.shortName} ${book.chaptersCount}` }
}

interface BibleReaderProps {
  chapter: BibleChapterText
  /**
   * Запоминать ли главу как «место, где остановился». На общей странице
   * /bible показывается Бытие 1 по умолчанию — она не должна затирать
   * сохранённое место, иначе пропала бы кнопка «Продолжить чтение».
   */
  trackProgress?: boolean
}

export function BibleReader({ chapter, trackProgress = true }: BibleReaderProps) {
  const t = useTranslations('bible')
  const router = useRouter()
  const { bookSlug, chapter: chapterNumber, totalChapters } = chapter

  const [translation, setTranslation] = useTranslationPref()
  const [fontSize, setFontSize] = useFontSizePref()
  const [hintHidden, hideHint] = useHintHidden()

  const [isTranslationOpen, setIsTranslationOpen] = useState(false)
  const [selectedVerseNumber, setSelectedVerseNumber] = useState<number | null>(null)
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)

  // Полная глава с толкованиями — грузится один раз, при первом клике на стих
  const [fullChapter, setFullChapter] = useState<BibleChapter | null>(null)
  const [commentaryStatus, setCommentaryStatus] = useState<CommentaryStatus>('idle')

  const translationRef = useRef<HTMLDivElement | null>(null)
  const articleRef = useRef<HTMLElement | null>(null)

  const prev = adjacentChapter(bookSlug, chapterNumber, totalChapters, 'prev')
  const next = adjacentChapter(bookSlug, chapterNumber, totalChapters, 'next')

  // Запоминаем место чтения
  useEffect(() => {
    if (trackProgress) saveReadingProgress({ bookSlug, chapterNumber })
  }, [trackProgress, bookSlug, chapterNumber])

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

  // Полоска прогресса чтения главы
  useEffect(() => {
    const handleScroll = () => {
      if (!articleRef.current) return
      const rect = articleRef.current.getBoundingClientRect()
      const total = articleRef.current.scrollHeight
      const scrolled = -rect.top + window.innerHeight
      setReadingProgress(Math.min(100, Math.max(0, (scrolled / total) * 100)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    const frame = requestAnimationFrame(handleScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Клавиатурная навигация: ← / → — соседние главы
  const prevBook = prev?.bookSlug
  const prevChapter = prev?.chapter
  const nextBook = next?.bookSlug
  const nextChapter = next?.chapter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (isBookSelectorOpen || selectedVerseNumber !== null) return
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return

      if (e.key === 'ArrowLeft' && prevBook && prevChapter) {
        e.preventDefault()
        router.push(chapterHref(prevBook, prevChapter))
      } else if (e.key === 'ArrowRight' && nextBook && nextChapter) {
        e.preventDefault()
        router.push(chapterHref(nextBook, nextChapter))
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [router, isBookSelectorOpen, selectedVerseNumber, prevBook, prevChapter, nextBook, nextChapter])

  const loadCommentaries = () => {
    if (fullChapter || commentaryStatus === 'loading') return
    setCommentaryStatus('loading')
    fetchBibleChapter(bookSlug, chapterNumber).then((data) => {
      if (data) {
        setFullChapter(data)
        setCommentaryStatus('ready')
      } else {
        setCommentaryStatus('error')
      }
    })
  }

  const selectVerse = (verseNumber: number) => {
    setSelectedVerseNumber(verseNumber)
    const verse = chapter.verses.find((v) => v.number === verseNumber)
    if (verse?.hasCommentary) loadCommentaries()
  }

  const handleSelectChapter = (newBookSlug: string, newChapter: number) => {
    setSelectedVerseNumber(null)
    router.push(chapterHref(newBookSlug, newChapter))
  }

  const selectedVerse =
    selectedVerseNumber !== null
      ? chapter.verses.find((v) => v.number === selectedVerseNumber) ?? null
      : null
  const selectedCommentaries =
    selectedVerseNumber !== null
      ? fullChapter?.verses.find((v) => v.number === selectedVerseNumber)?.commentaries
      : undefined

  const activeTranslationMeta =
    BIBLE_TRANSLATIONS.find((tr) => tr.key === translation) ?? BIBLE_TRANSLATIONS[0]

  const fontSizeClass =
    fontSize === 'normal'
      ? 'text-base leading-relaxed'
      : fontSize === 'huge'
        ? 'text-xl sm:text-2xl leading-loose'
        : 'text-lg sm:text-xl leading-relaxed'

  return (
    <div className="mx-auto max-w-3xl">
      {/* Панель управления чтением */}
      <div className="sticky top-16 z-30 mb-4 sm:mb-6 rounded-2xl border border-ink/10 bg-paper/95 p-2 sm:p-2.5 shadow-sm backdrop-blur relative">
        {/* Полоска прогресса чтения внутри панели */}
        <div
          className="absolute bottom-0 left-0 h-[2px] rounded-b-2xl bg-blue-dark/60 transition-[width] duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(readingProgress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('readingProgress')}
        />
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
          {/* Кнопка выбора книги и главы */}
          <button
            type="button"
            onClick={() => setIsBookSelectorOpen(true)}
            className="h-10 min-h-0 rounded-xl border-2 border-blue-dark bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-heading font-bold uppercase tracking-wide text-blue-dark hover:bg-ice transition-colors flex items-center gap-1.5 sm:gap-2 min-w-0"
            aria-label={t('chooseChapter')}
          >
            <span className="truncate">
              <span className="sm:hidden">
                {t('chapterShort', { book: chapter.bookName, chapter: chapterNumber })}
              </span>
              <span className="hidden sm:inline">
                {t('chapterTitle', { book: chapter.bookName, chapter: chapterNumber })}
              </span>
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

          {/* Настройки: размер шрифта и перевод */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="h-10 min-h-0 flex items-center rounded-xl border border-ink/15 bg-white p-0.5 shadow-2xs shrink-0">
              <button
                type="button"
                onClick={() => setFontSize(fontSize === 'huge' ? 'large' : 'normal')}
                disabled={fontSize === 'normal'}
                className="flex h-full aspect-square items-center justify-center rounded-lg text-xs sm:text-sm font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                title={t('fontSmaller')}
                aria-label={t('fontSmaller')}
              >
                A-
              </button>
              <span className="hidden sm:inline px-1.5 text-xs font-heading font-bold text-ink-soft uppercase">
                {fontSize === 'normal' ? '1x' : fontSize === 'large' ? '1.2x' : '1.5x'}
              </span>
              <button
                type="button"
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'huge')}
                disabled={fontSize === 'huge'}
                className="flex h-full aspect-square items-center justify-center rounded-lg text-xs sm:text-base font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                title={t('fontLarger')}
                aria-label={t('fontLarger')}
              >
                A+
              </button>
            </div>

            <div ref={translationRef} className="relative">
              <button
                type="button"
                onClick={() => setIsTranslationOpen(!isTranslationOpen)}
                className="h-10 min-h-0 rounded-xl border border-ink/15 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider text-ink hover:bg-ice transition-colors inline-flex items-center gap-1.5 shrink-0"
                aria-expanded={isTranslationOpen}
                aria-label={t('chooseTranslation')}
              >
                <span>{t('translation')}</span>
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
                    {t('availableTranslations')}
                  </div>
                  {BIBLE_TRANSLATIONS.map((tr) => (
                    <button
                      key={tr.key}
                      type="button"
                      onClick={() => {
                        setTranslation(tr.key)
                        setIsTranslationOpen(false)
                      }}
                      className={`w-full flex flex-col items-start rounded-xl p-2.5 text-left transition-colors ${
                        translation === tr.key
                          ? 'bg-ice text-blue-dark font-medium'
                          : 'hover:bg-ice/50 text-ink'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="font-heading text-sm font-semibold tracking-wide">
                          {tr.name}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-ink-soft">
                          ({tr.badge})
                        </span>
                        {translation === tr.key ? (
                          <span className="ml-auto text-xs text-blue-dark font-bold">✓</span>
                        ) : null}
                      </div>
                      <span className="text-xs text-ink-soft mt-0.5 leading-snug">
                        {tr.description}
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
      {!hintHidden ? (
        <aside
          role="note"
          aria-label={t('hintLabel')}
          className="mb-4 sm:mb-6 flex items-center justify-between gap-2.5 rounded-2xl border border-blue-light/50 bg-ice/40 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-ink-soft font-sans"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-blue-dark text-white text-xs font-bold">
              💬
            </span>
            <span>
              <strong>{t('hintTitle')}</strong> {t('hintText')}
            </span>
          </div>
          <button
            type="button"
            onClick={hideHint}
            aria-label={t('hideHint')}
            className="text-ink-soft hover:text-ink text-base px-1"
          >
            ✕
          </button>
        </aside>
      ) : null}

      {/* Текст главы (строго без засечек — font-sans) */}
      <article
        ref={articleRef}
        className="card p-4 sm:p-8 md:p-10 border border-ink/10 bg-white/90 shadow-sm font-sans"
      >
        <div className="border-b border-ink/10 pb-4 sm:pb-6 mb-4 sm:mb-6 text-center">
          <span className="chip bg-sand/60 text-ink-soft text-xs uppercase mb-2">
            {activeTranslationMeta.name} ({activeTranslationMeta.badge})
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-wider text-ink">
            {chapter.bookName}
          </h1>
          <p className="mt-1 font-heading text-lg sm:text-xl font-semibold text-blue-dark uppercase tracking-wide">
            {t('chapter', { chapter: chapterNumber })}
          </p>
        </div>

        <div className={`space-y-2.5 sm:space-y-3.5 ${fontSizeClass}`}>
          {chapter.verses.map((verse) => {
            const isSelected = selectedVerseNumber === verse.number
            const verseText = verse.text[translation] ?? verse.text.rst

            return (
              <div
                key={verse.number}
                id={`v${verse.number}`}
                onClick={() => selectVerse(verse.number)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectVerse(verse.number)
                  }
                }}
                className={`group relative flex items-start gap-2 sm:gap-2.5 rounded-xl p-2 sm:p-3 transition-colors cursor-pointer select-text scroll-mt-36 ${
                  isSelected
                    ? 'bg-ice/70 ring-2 ring-blue-dark text-ink'
                    : 'hover:bg-ice/30 active:bg-ice/40 text-ink'
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-md font-heading text-xs font-bold transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-blue-dark text-white'
                      : 'bg-sand/60 text-ink-soft group-hover:bg-blue-dark group-hover:text-white'
                  }`}
                >
                  {verse.number}
                </span>

                <div className="flex-1">
                  <span>{verseText}</span>
                  {verse.hasCommentary ? (
                    <span
                      title={t('hasCommentary')}
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

        {/* Навигация по главам — обычные ссылки: их видят поисковики,
            их можно открыть в новой вкладке, Next подгружает их заранее */}
        <nav
          aria-label={t('chapterNav')}
          className="mt-8 sm:mt-10 border-t border-ink/10 pt-5 sm:pt-6 font-heading"
        >
          <div className="text-center text-xs font-semibold uppercase tracking-wider text-ink-soft mb-3 sm:hidden">
            {t('chapterOf', { chapter: chapterNumber, total: totalChapters })}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:flex sm:items-center sm:justify-between sm:gap-3">
            {prev ? (
              <Link
                href={chapterHref(prev.bookSlug, prev.chapter)}
                className="btn-outline text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-w-0"
              >
                <Arrow direction="left" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {prev.label || t('chapter', { chapter: prev.chapter })}
                </span>
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}

            <span className="hidden sm:inline text-sm font-semibold uppercase tracking-wider text-ink-soft">
              {t('chapterOf', { chapter: chapterNumber, total: totalChapters })}
            </span>

            {next ? (
              <Link
                href={chapterHref(next.bookSlug, next.chapter)}
                className={`btn-primary text-xs sm:text-sm px-3 sm:px-4 py-2.5 sm:py-2 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto min-w-0 ${
                  !prev ? 'col-span-2' : ''
                }`}
              >
                <span className="truncate">
                  {next.label || t('chapter', { chapter: next.chapter })}
                </span>
                <Arrow className="h-3.5 w-3.5 shrink-0" />
              </Link>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
        </nav>
      </article>

      {/* Шторка с толкованиями */}
      <BibleBottomSheet
        bookName={chapter.bookName}
        chapterNumber={chapterNumber}
        verse={selectedVerse}
        commentaries={selectedCommentaries}
        commentaryStatus={commentaryStatus}
        onRetry={loadCommentaries}
        totalVerses={chapter.verses.length}
        translation={translation}
        onClose={() => setSelectedVerseNumber(null)}
        onSelectVerse={selectVerse}
      />

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
