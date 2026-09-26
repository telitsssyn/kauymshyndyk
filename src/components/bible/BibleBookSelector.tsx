'use client'

import { useState } from 'react'

import { BIBLE_BOOKS } from '@/data/bible/books'

interface BibleBookSelectorProps {
  currentBookSlug: string
  currentChapter: number
  isOpen: boolean
  onClose: () => void
  onSelectChapter: (bookSlug: string, chapter: number) => void
}

export function BibleBookSelector({
  currentBookSlug,
  currentChapter,
  isOpen,
  onClose,
  onSelectChapter,
}: BibleBookSelectorProps) {
  const [testament, setTestament] = useState<'old' | 'new'>('old')

  if (!isOpen) return null

  const filteredBooks = BIBLE_BOOKS.filter((b) => b.testament === testament)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Затемнение */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Модальное окно выбора книги и главы */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Выбор книги и главы Библии"
        className="relative z-50 w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-ink/15 bg-paper p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-ink/10">
          <h2 className="font-heading text-xl font-bold uppercase tracking-wide text-ink">
            Книги Библии
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть выбор книги"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink hover:bg-ice transition-colors"
          >
            <span className="text-xl leading-none">✕</span>
          </button>
        </div>

        {/* Переключатель Ветхий / Новый Завет */}
        <div className="mt-4 flex rounded-xl border border-ink/10 bg-sand/40 p-1">
          <button
            type="button"
            onClick={() => setTestament('old')}
            className={`flex-1 rounded-lg py-2 font-heading text-sm font-semibold uppercase tracking-wider transition-colors ${
              testament === 'old'
                ? 'bg-blue-dark text-white shadow-xs'
                : 'text-ink hover:text-blue-dark'
            }`}
          >
            Ветхий Завет
          </button>
          <button
            type="button"
            onClick={() => setTestament('new')}
            className={`flex-1 rounded-lg py-2 font-heading text-sm font-semibold uppercase tracking-wider transition-colors ${
              testament === 'new'
                ? 'bg-blue-dark text-white shadow-xs'
                : 'text-ink hover:text-blue-dark'
            }`}
          >
            Новый Завет
          </button>
        </div>

        {/* Список книг */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredBooks.map((book) => {
            const isCurrent = book.slug === currentBookSlug
            const isAvailable = book.availableChapters.length > 0

            return (
              <div
                key={book.slug}
                className={`rounded-2xl border p-3 transition-colors ${
                  isCurrent
                    ? 'border-blue-dark bg-ice/50'
                    : isAvailable
                    ? 'border-ink/10 bg-white hover:border-blue-dark/50'
                    : 'border-ink/5 bg-white/50 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-base font-bold text-ink">
                      {book.name}
                    </span>
                    <span className="text-xs text-ink-soft">({book.shortName})</span>
                  </div>

                  {isAvailable ? (
                    <span className="chip bg-blue-dark text-white text-xs">Доступно</span>
                  ) : (
                    <span className="text-xs text-ink-soft">Скоро</span>
                  )}
                </div>

                {isAvailable ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: Math.min(book.chaptersCount, 5) }).map((_, i) => {
                      const chap = i + 1
                      const chapAvailable = book.availableChapters.includes(chap)
                      const chapSelected = isCurrent && currentChapter === chap

                      return (
                        <button
                          key={chap}
                          type="button"
                          disabled={!chapAvailable}
                          onClick={() => {
                            if (chapAvailable) {
                              onSelectChapter(book.slug, chap)
                              onClose()
                            }
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-heading text-sm font-bold transition-colors ${
                            chapSelected
                              ? 'bg-blue-dark text-white'
                              : chapAvailable
                              ? 'border border-ink/20 bg-white hover:bg-ice text-ink'
                              : 'opacity-30 cursor-not-allowed border border-ink/10 text-ink-soft'
                          }`}
                        >
                          {chap}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
