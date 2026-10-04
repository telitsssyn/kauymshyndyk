'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { BIBLE_BOOKS } from '@/data/bible/books'
import { Link } from '@/i18n/navigation'

import { chapterHref } from './BibleReader'

interface BibleBookSelectorProps {
  currentBookSlug: string
  currentChapter: number
  isOpen: boolean
  onClose: () => void
  onSelectChapter: (bookSlug: string, chapter: number) => void
}

export function BibleBookSelector({ isOpen, ...props }: BibleBookSelectorProps) {
  // Содержимое монтируется заново при каждом открытии: поиск пуст,
  // завет — как у текущей книги, без сброса состояния в эффектах
  if (!isOpen) return null
  return <BookSelectorDialog {...props} />
}

function BookSelectorDialog({
  currentBookSlug,
  currentChapter,
  onClose,
  onSelectChapter,
}: Omit<BibleBookSelectorProps, 'isOpen'>) {
  const t = useTranslations('bible.selector')
  const [testament, setTestament] = useState<'old' | 'new'>(
    () => BIBLE_BOOKS.find((b) => b.slug === currentBookSlug)?.testament ?? 'old',
  )
  const [search, setSearch] = useState('')
  const currentBookRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Авто-скролл к текущей книге и фокус на поиске после открытия
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      currentBookRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }, 200)
    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus({ preventScroll: true })
    }, 250)
    return () => {
      clearTimeout(scrollTimer)
      clearTimeout(focusTimer)
    }
  }, [])

  // Закрытие по Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const normalizedSearch = search.toLowerCase().trim()
  const isSearching = normalizedSearch.length > 0

  // При поиске показываем из обоих заветов, иначе — из выбранного
  const filteredBooks = isSearching
    ? BIBLE_BOOKS.filter(
        (b) =>
          b.name.toLowerCase().includes(normalizedSearch) ||
          b.shortName.toLowerCase().includes(normalizedSearch),
      )
    : BIBLE_BOOKS.filter((b) => b.testament === testament)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнение */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('dialog')}
        className="relative z-50 w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-ink/15 bg-paper p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-ink/10">
          <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-ink">
            {t('title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ice transition-colors"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Поле поиска */}
        <div className="mt-3 relative">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            aria-label={t('search')}
            className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-blue-dark/40 focus:border-blue-dark/40 transition-colors"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-soft hover:text-ink text-sm px-1"
              aria-label={t('clearSearch')}
            >
              ✕
            </button>
          ) : null}
        </div>

        {/* Переключатель Ветхий / Новый Завет (скрыт при поиске) */}
        {!isSearching ? (
          <div className="mt-3 flex rounded-xl border border-ink/10 bg-sand/40 p-1">
            {(['old', 'new'] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTestament(key)}
                aria-pressed={testament === key}
                className={`flex-1 rounded-lg py-2 font-heading text-sm font-semibold uppercase tracking-wider transition-colors ${
                  testament === key ? 'bg-blue-dark text-white shadow-xs' : 'text-ink hover:text-blue-dark'
                }`}
              >
                {t(key)}
              </button>
            ))}
          </div>
        ) : null}

        {/* Список книг */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredBooks.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-soft">
              {t('notFound', { query: search })}
            </div>
          ) : null}
          {filteredBooks.map((book) => {
            const isCurrent = book.slug === currentBookSlug

            return (
              <div
                key={book.slug}
                ref={isCurrent ? currentBookRef : undefined}
                className={`rounded-2xl border p-3 transition-colors ${
                  isCurrent ? 'border-blue-dark bg-ice/50' : 'border-ink/10 bg-white hover:border-blue-dark/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold text-ink">{book.name}</span>
                  <span className="text-xs text-ink-soft">({book.shortName})</span>
                  {isSearching ? (
                    <span className="text-[10px] uppercase font-heading font-semibold text-ink-soft">
                      {book.testament === 'old' ? t('oldShort') : t('newShort')}
                    </span>
                  ) : null}
                  <span className="ml-auto text-xs text-ink-soft">
                    {t('chapters', { count: book.chaptersCount })}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: book.chaptersCount }).map((_, i) => {
                    const chap = i + 1
                    const chapSelected = isCurrent && currentChapter === chap

                    return (
                      <Link
                        key={chap}
                        href={chapterHref(book.slug, chap)}
                        prefetch={false}
                        aria-current={chapSelected ? 'page' : undefined}
                        onClick={(e) => {
                          // Обычный клик — переход через роутер с закрытием окна;
                          // Ctrl/Cmd+клик по-прежнему открывает главу в новой вкладке
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
                          e.preventDefault()
                          onSelectChapter(book.slug, chap)
                          onClose()
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl font-heading text-sm font-bold transition-colors ${
                          chapSelected
                            ? 'bg-blue-dark text-white'
                            : 'border border-ink/20 bg-white hover:bg-ice text-ink'
                        }`}
                      >
                        {chap}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
