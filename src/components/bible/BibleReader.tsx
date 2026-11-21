'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Arrow } from '@/components/Arrow'
import { BIBLE_BOOKS } from '@/data/bible/books'
import { fetchBibleChapter } from '@/data/bible'
import {
  BIBLE_TRANSLATIONS,
  COMMENTARY_AUTHORS,
  type BibleChapter,
  type BibleChapterText,
  type TranslationKey,
} from '@/data/bible/types'
import { Link, useRouter } from '@/i18n/navigation'

import { BibleBookSelector } from './BibleBookSelector'
import {
  BibleCommentary,
  COMMENTARY_AUTHOR,
  COMMENTARY_TRANSLATION,
  type CommentaryStatus,
} from './BibleCommentary'
import {
  saveReadingProgress,
  useFontSizePref,
  useReaderModePref,
  useTranslationPref,
  type FontSize,
  type ReaderMode,
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

/** Где кончается закреплённая панель, когда она прилипла к шапке */
function stuckPanelBottom(panel: HTMLElement | null): number {
  if (!panel) return 130
  return (parseFloat(getComputedStyle(panel).top) || 0) + panel.offsetHeight + 12
}

/** Первый стих, который виден под закреплённой панелью */
function topVisibleVerse(offset: number): number | null {
  for (const el of document.querySelectorAll<HTMLElement>('[data-verse]')) {
    if (el.getBoundingClientRect().bottom > offset) return Number(el.dataset.verse)
  }
  return null
}

/**
 * Мгновенный переход к стиху. Не scrollIntoView: на сайте включена плавная
 * прокрутка, и повторный переход (после догрузки толкований) накладывался
 * на ещё идущую анимацию.
 */
function jumpToVerse(verse: number, offset: number) {
  const el = document.getElementById(`v${verse}`)
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top, behavior: 'instant' })
}

const FONT_SIZE_CLASS: Record<FontSize, string> = {
  normal: 'text-base leading-relaxed',
  large: 'text-lg sm:text-xl leading-relaxed',
  huge: 'text-xl sm:text-2xl leading-loose',
}

const FONT_SIZE_LABEL: Record<FontSize, string> = { normal: '1x', large: '1.2x', huge: '1.5x' }

const Chevron = ({ open = false }: { open?: boolean }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
    aria-hidden="true"
  >
    <path d="M3.75 6.25L8 10.5l4.25-4.25" />
  </svg>
)

const MENU_CLASS =
  'absolute right-0 top-full mt-2 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-ink/10 bg-paper/98 p-2 shadow-xl backdrop-blur animate-in fade-in-0 zoom-in-95 duration-150'

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
  const chapterKey = `${bookSlug}/${chapterNumber}`

  const [translation, setTranslation] = useTranslationPref()
  const [fontSize, setFontSize] = useFontSizePref()
  const [mode, setMode] = useReaderModePref()

  const [openMenu, setOpenMenu] = useState<'translation' | 'more' | null>(null)
  const [isBookSelectorOpen, setIsBookSelectorOpen] = useState(false)

  // Полная глава с толкованиями — грузится только в режиме толкования.
  // Компонент может пережить переход на другую главу, поэтому загруженное
  // сверяется с текущей главой, а не сбрасывается в эффекте.
  const [loaded, setLoaded] = useState<BibleChapter | null>(null)
  const [failedKey, setFailedKey] = useState<string | null>(null)
  const requestedKeyRef = useRef<string | null>(null)
  const fullChapter =
    loaded?.bookSlug === bookSlug && loaded.chapter === chapterNumber ? loaded : null
  const commentaryStatus: CommentaryStatus = fullChapter
    ? 'ready'
    : failedKey === chapterKey
      ? 'error'
      : 'loading'

  const menusRef = useRef<HTMLDivElement | null>(null)
  const panelRef = useRef<HTMLDivElement | null>(null)
  // Стих, к которому вернуться после смены режима
  const pendingVerseRef = useRef<number | null>(null)

  const prev = adjacentChapter(bookSlug, chapterNumber, totalChapters, 'prev')
  const next = adjacentChapter(bookSlug, chapterNumber, totalChapters, 'next')

  // Запоминаем место чтения
  useEffect(() => {
    if (trackProgress) saveReadingProgress({ bookSlug, chapterNumber })
  }, [trackProgress, bookSlug, chapterNumber])

  // Закрытие меню по клику снаружи и по Escape
  useEffect(() => {
    if (!openMenu) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menusRef.current && !menusRef.current.contains(e.target as Node)) setOpenMenu(null)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openMenu])

  // Клавиатурная навигация: ← / → — соседние главы
  const prevBook = prev?.bookSlug
  const prevChapter = prev?.chapter
  const nextBook = next?.bookSlug
  const nextChapter = next?.chapter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (isBookSelectorOpen) return
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
  }, [router, isBookSelectorOpen, prevBook, prevChapter, nextBook, nextChapter])

  const loadCommentaries = useCallback(() => {
    requestedKeyRef.current = chapterKey
    fetchBibleChapter(bookSlug, chapterNumber).then((data) => {
      if (data) setLoaded(data)
      else setFailedKey(chapterKey)
    })
  }, [bookSlug, chapterNumber, chapterKey])

  // Толкования подгружаются при входе в режим (в т. ч. сохранённый с прошлого раза)
  useEffect(() => {
    if (mode === 'commentary' && !fullChapter && requestedKeyRef.current !== chapterKey) {
      loadCommentaries()
    }
  }, [mode, fullChapter, chapterKey, loadCommentaries])

  const retryCommentaries = () => {
    setFailedKey(null)
    loadCommentaries()
  }

  // После смены режима возвращаемся к тому же стиху. В режиме толкования
  // повторяем, когда толкования догрузятся и сдвинут вёрстку.
  const commentaryReady = fullChapter !== null
  useEffect(() => {
    const verse = pendingVerseRef.current
    if (verse === null) return
    jumpToVerse(verse, stuckPanelBottom(panelRef.current))
    if (mode === 'text' || commentaryReady) pendingVerseRef.current = null
  }, [mode, commentaryReady])

  const switchMode = (nextMode: ReaderMode) => {
    pendingVerseRef.current =
      window.scrollY > 200 ? topVisibleVerse(stuckPanelBottom(panelRef.current)) : null
    setMode(nextMode)
    setOpenMenu(null)
  }

  const handleSelectChapter = (newBookSlug: string, newChapter: number) => {
    router.push(chapterHref(newBookSlug, newChapter))
  }

  const isCommentary = mode === 'commentary'
  // В режиме толкования перевод всегда Синодальный; выбор читателя
  // сохраняется и вернётся в режиме текста
  const shownTranslation: TranslationKey = isCommentary ? COMMENTARY_TRANSLATION : translation
  const activeTranslationMeta =
    BIBLE_TRANSLATIONS.find((tr) => tr.key === shownTranslation) ?? BIBLE_TRANSLATIONS[0]
  const commentaryAuthor = COMMENTARY_AUTHORS.find((a) => a.key === COMMENTARY_AUTHOR)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Панель: содержание, перевод, остальное */}
      <div ref={panelRef} className="sticky top-16 z-30 mb-4 sm:mb-6 rounded-2xl border border-ink/10 bg-paper/95 p-2 sm:p-2.5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
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
            <Chevron />
          </button>

          <div ref={menusRef} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Перевод — только в режиме текста: толкование написано
                под Синодальный перевод, менять его там незачем */}
            <div className={`relative ${isCommentary ? 'hidden' : ''}`}>
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'translation' ? null : 'translation')}
                className="h-10 min-h-0 rounded-xl border border-ink/15 bg-white px-2.5 sm:px-3 text-xs sm:text-sm font-heading font-semibold uppercase tracking-wider text-ink hover:bg-ice transition-colors inline-flex items-center gap-1.5 shrink-0"
                aria-expanded={openMenu === 'translation'}
                aria-label={t('chooseTranslation')}
              >
                <span>{t('translation')}</span>
                <Chevron open={openMenu === 'translation'} />
              </button>

              {openMenu === 'translation' ? (
                <div className={MENU_CLASS}>
                  <div className="px-2 py-1 text-[11px] font-heading font-bold uppercase tracking-wider text-ink-soft">
                    {t('availableTranslations')}
                  </div>
                  {BIBLE_TRANSLATIONS.map((tr) => (
                    <button
                      key={tr.key}
                      type="button"
                      onClick={() => {
                        setTranslation(tr.key)
                        setOpenMenu(null)
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

            {/* Остальное: режим толкования, размер текста; позже — аудио и поиск */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenMenu(openMenu === 'more' ? null : 'more')}
                className={`flex h-10 w-10 min-h-0 items-center justify-center rounded-xl border transition-colors ${
                  openMenu === 'more'
                    ? 'border-blue-dark bg-ice text-blue-dark'
                    : 'border-ink/15 bg-white text-ink hover:bg-ice'
                }`}
                aria-expanded={openMenu === 'more'}
                aria-label={t('more')}
                title={t('more')}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                  <circle cx="3" cy="8" r="1.6" />
                  <circle cx="8" cy="8" r="1.6" />
                  <circle cx="13" cy="8" r="1.6" />
                </svg>
              </button>

              {openMenu === 'more' ? (
                <div className={MENU_CLASS}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCommentary}
                    onClick={() => switchMode(isCommentary ? 'text' : 'commentary')}
                    className="w-full flex items-center gap-3 rounded-xl p-2.5 text-left hover:bg-ice/50 transition-colors"
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block font-heading text-sm font-semibold tracking-wide text-ink">
                        {t('commentaryMode')}
                      </span>
                      <span className="block text-xs text-ink-soft mt-0.5 leading-snug">
                        {t('commentaryModeHint', { author: commentaryAuthor?.name ?? '' })}
                      </span>
                    </span>
                    <span
                      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                        isCommentary ? 'bg-blue-dark' : 'bg-ink/20'
                      }`}
                      aria-hidden="true"
                    >
                      <span
                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-[left] ${
                          isCommentary ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>

                  <div className="my-1.5 border-t border-ink/10" />

                  <div className="flex items-center justify-between gap-3 p-2.5">
                    <span className="font-heading text-sm font-semibold tracking-wide text-ink">
                      {t('fontSize')}
                    </span>
                    <div className="h-9 flex items-center rounded-xl border border-ink/15 bg-white p-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setFontSize(fontSize === 'huge' ? 'large' : 'normal')}
                        disabled={fontSize === 'normal'}
                        className="flex h-full aspect-square items-center justify-center rounded-lg text-xs font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                        aria-label={t('fontSmaller')}
                      >
                        A-
                      </button>
                      <span className="w-10 text-center text-xs font-heading font-bold text-ink-soft uppercase">
                        {FONT_SIZE_LABEL[fontSize]}
                      </span>
                      <button
                        type="button"
                        onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'huge')}
                        disabled={fontSize === 'huge'}
                        className="flex h-full aspect-square items-center justify-center rounded-lg text-sm font-bold text-ink hover:bg-ice disabled:opacity-30 disabled:pointer-events-none"
                        aria-label={t('fontLarger')}
                      >
                        A+
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Текст главы (строго без засечек — font-sans) */}
      <article className="card p-4 sm:p-8 md:p-10 border border-ink/10 bg-white/90 shadow-sm font-sans">
        <div className="border-b border-ink/10 pb-4 sm:pb-6 mb-4 sm:mb-6 text-center">
          <div className="mb-2 flex flex-wrap justify-center gap-1.5">
            <span className="chip bg-sand/60 text-ink-soft text-xs uppercase">
              {activeTranslationMeta.name} ({activeTranslationMeta.badge})
            </span>
            {isCommentary && commentaryAuthor ? (
              <span className="chip bg-blue-dark text-white text-xs uppercase">
                {t('commentaryBy', { author: commentaryAuthor.shortName })}
              </span>
            ) : null}
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold uppercase tracking-wider text-ink">
            {chapter.bookName}
          </h1>
          <p className="mt-1 font-heading text-lg sm:text-xl font-semibold text-blue-dark uppercase tracking-wide">
            {t('chapter', { chapter: chapterNumber })}
          </p>
        </div>

        {isCommentary ? (
          <BibleCommentary
            verses={chapter.verses}
            fullChapter={fullChapter}
            status={commentaryStatus}
            onRetry={retryCommentaries}
            translation={COMMENTARY_TRANSLATION}
            fontSize={fontSize}
          />
        ) : (
          // Каждый стих с новой строки, номер — надстрочный
          <div className={`space-y-1.5 sm:space-y-2 text-ink ${FONT_SIZE_CLASS[fontSize]}`}>
            {chapter.verses.map((verse) => (
              <p
                key={verse.number}
                id={`v${verse.number}`}
                data-verse={verse.number}
                className="scroll-mt-36 rounded transition-colors target:bg-sand/70"
              >
                <sup className="mr-1 font-heading text-[0.6em] font-bold text-blue-dark select-none">
                  {verse.number}
                </sup>
                {verse.text[translation] ?? verse.text.rst}
              </p>
            ))}
          </div>
        )}

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
