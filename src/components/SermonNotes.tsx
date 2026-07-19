'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

// Личные заметки к проповеди. Хранятся только в браузере читателя
// (localStorage), на сервер ничего не отправляется.

const storageKey = (slug: string) => `sermon-notes:${slug}`

export function SermonNotes({ slug }: { slug: string }) {
  const t = useTranslations('sermons.notes')
  const [text, setText] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

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
  }, [slug])

  const onChange = (value: string) => {
    setText(value)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        if (value.trim()) {
          localStorage.setItem(storageKey(slug), value)
        } else {
          localStorage.removeItem(storageKey(slug))
        }
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
          <span className="ml-auto flex flex-wrap gap-2">
            <button type="button" onClick={copy} className="btn-outline px-4 text-sm" aria-live="polite">
              {copied ? t('copied') : t('copy')}
            </button>
            <button type="button" onClick={download} className="btn-outline px-4 text-sm">
              {t('download')}
            </button>
          </span>
        ) : null}
      </div>
    </section>
  )
}
