'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

// Личные заметки к проповеди. Хранятся только в браузере читателя
// (localStorage), на сервер ничего не отправляется.

const storageKey = (slug: string) => `sermon-notes:${slug}`

const persist = (slug: string, value: string) => {
  if (value.trim()) {
    localStorage.setItem(storageKey(slug), value)
  } else {
    localStorage.removeItem(storageKey(slug))
  }
}

type Pending = { slug: string; value: string } | null
type Ref<T> = { current: T }

// Немедленно записать отложенное: при уходе со страницы, закрытии вкладки
// или смене проповеди последние символы не должны теряться.
const flushPending = (
  pending: Ref<Pending>,
  timer: Ref<ReturnType<typeof setTimeout> | undefined>,
) => {
  clearTimeout(timer.current)
  const p = pending.current
  pending.current = null
  if (!p) return
  try {
    persist(p.slug, p.value)
  } catch {
    // Нет места или доступа
  }
}

export function SermonNotes({ slug }: { slug: string }) {
  const t = useTranslations('sermons.notes')
  const [text, setText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // Текст, ещё не записанный в localStorage (ждёт окончания паузы в наборе)
  const pending = useRef<Pending>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    // Разовая гидрация из localStorage: на сервере хранилища нет, поэтому
    // прочитать сохранённую заметку можно только после монтирования.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setText(localStorage.getItem(storageKey(slug)) ?? '')
    } catch {
      // localStorage недоступен (например, режим инкогнито с запретом) — поле просто пустое
    }
    setLoaded(true)
    dialogRef.current?.close()
    // При смене slug (переход между проповедями) сохраняем заметку предыдущей
    return () => flushPending(pending, saveTimer)
  }, [slug])

  useEffect(() => {
    // pagehide срабатывает и на мобильных при сворачивании/закрытии вкладки
    const onPageHide = () => flushPending(pending, saveTimer)
    const savedTimerRef = savedTimer
    window.addEventListener('pagehide', onPageHide)
    return () => {
      window.removeEventListener('pagehide', onPageHide)
      flushPending(pending, saveTimer)
      clearTimeout(savedTimerRef.current)
    }
  }, [])

  const onChange = (value: string) => {
    setText(value)
    pending.current = { slug, value }
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      pending.current = null
      try {
        persist(slug, value)
        setSaved(true)
        clearTimeout(savedTimer.current)
        savedTimer.current = setTimeout(() => setSaved(false), 2000)
      } catch {
        // Нет места или доступа — не мешаем человеку писать
      }
    }, 400)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена недоступен — молча пропускаем
    }
  }

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `zametka-${slug}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  const openModal = () => {
    dialogRef.current?.showModal()
  }

  const closeModal = () => {
    dialogRef.current?.close()
  }

  const onDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      closeModal()
    }
  }

  const confirmClear = () => {
    closeModal()
    clearTimeout(saveTimer.current)
    pending.current = null
    setText('')
    setSaved(false)
    try {
      localStorage.removeItem(storageKey(slug))
    } catch {
      // localStorage недоступен
    }
  }

  return (
    <section className="mt-10" aria-label={t('title')}>
      <h2 className="text-2xl">{t('title')}</h2>
      <p className="mt-2 text-sm text-ink-soft">{t('hint')}</p>
      <textarea
        id={`sermon-notes-${slug}`}
        aria-label={t('title')}
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('placeholder')}
        rows={8}
        disabled={!loaded}
        className="mt-3 w-full resize-y rounded-2xl bg-white p-4 text-lg leading-relaxed text-ink shadow-sm ring-1 ring-ink/10 placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-blue-dark"
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span aria-live="polite" className="text-sm font-semibold text-blue-dark">
          {saved ? t('saved') : ''}
        </span>
        {text.trim() ? (
          <span className="ml-auto flex flex-wrap items-center gap-2">
            <button type="button" onClick={copy} className="btn-outline px-4 text-sm" aria-live="polite">
              {copied ? t('copied') : t('copy')}
            </button>
            <button type="button" onClick={download} className="btn-outline px-4 text-sm">
              {t('download')}
            </button>
            <button
              type="button"
              onClick={openModal}
              className="btn border-2 border-ink/20 px-4 text-sm text-ink-soft hover:border-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {t('clear')}
            </button>
          </span>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        onClick={onDialogClick}
        aria-labelledby="clear-dialog-title"
        aria-describedby="clear-dialog-desc"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-ink/10 backdrop:bg-ink/60 backdrop:backdrop-blur-xs"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <h3 id="clear-dialog-title" className="font-heading text-xl font-semibold uppercase tracking-wide text-ink">
              {t('confirmDialogTitle')}
            </h3>
            <button
              type="button"
              onClick={closeModal}
              aria-label={t('close')}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-ice hover:text-ink"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <p id="clear-dialog-desc" className="-mt-1 text-base leading-relaxed text-ink-soft">
            {t('confirmDialogDesc')}
          </p>
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="btn-outline px-4 text-sm"
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              onClick={confirmClear}
              className="btn border-2 border-red-600 bg-red-600 px-4 text-sm text-white hover:bg-red-700"
            >
              {t('confirmDialogAction')}
            </button>
          </div>
        </div>
      </dialog>
    </section>
  )
}
