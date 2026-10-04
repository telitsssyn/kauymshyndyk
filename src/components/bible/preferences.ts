'use client'

import { useSyncExternalStore } from 'react'

import { BIBLE_TRANSLATIONS, type TranslationKey } from '@/data/bible/types'

// Настройки читателя Библии в localStorage. Читаются через useSyncExternalStore:
// на сервере — значения по умолчанию, в браузере — сохранённые, без setState
// в эффектах. Каждая глава — отдельная страница, поэтому выбранный перевод
// и размер шрифта должны жить вне компонента, иначе сбрасывались бы при переходе.

const CHANGE_EVENT = 'bible-prefs-change'

const KEYS = {
  translation: 'bible-translation',
  fontSize: 'bible-font-size',
  hintHidden: 'bible-hint-hidden',
  progress: 'bible-reading-progress',
} as const

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange)
  window.addEventListener(CHANGE_EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(CHANGE_EVENT, onChange)
  }
}

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    // Хранилище недоступно (приватный режим) — настройка просто не запомнится
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const useStored = (key: string): string | null =>
  useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null,
  )

// ── Перевод ──────────────────────────────────────────────

export function useTranslationPref(): [TranslationKey, (value: TranslationKey) => void] {
  const raw = useStored(KEYS.translation)
  const value = BIBLE_TRANSLATIONS.some((t) => t.key === raw) ? (raw as TranslationKey) : 'rst'
  return [value, (next) => write(KEYS.translation, next)]
}

// ── Размер шрифта ────────────────────────────────────────

export type FontSize = 'normal' | 'large' | 'huge'
const FONT_SIZES: FontSize[] = ['normal', 'large', 'huge']

export function useFontSizePref(): [FontSize, (value: FontSize) => void] {
  const raw = useStored(KEYS.fontSize)
  const value = FONT_SIZES.includes(raw as FontSize) ? (raw as FontSize) : 'large'
  return [value, (next) => write(KEYS.fontSize, next)]
}

// ── Подсказка «нажмите на стих» ──────────────────────────

export function useHintHidden(): [boolean, () => void] {
  const hidden = useStored(KEYS.hintHidden) === '1'
  return [hidden, () => write(KEYS.hintHidden, '1')]
}

// ── Место, где человек остановился ───────────────────────

export type ReadingProgress = { bookSlug: string; chapterNumber: number }

export function useReadingProgress(): ReadingProgress | null {
  const raw = useStored(KEYS.progress)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<ReadingProgress>
    if (typeof parsed.bookSlug === 'string' && typeof parsed.chapterNumber === 'number') {
      return { bookSlug: parsed.bookSlug, chapterNumber: parsed.chapterNumber }
    }
  } catch {
    // Повреждённое значение — как будто ничего не сохранено
  }
  return null
}

export function saveReadingProgress(progress: ReadingProgress) {
  write(KEYS.progress, JSON.stringify(progress))
}
