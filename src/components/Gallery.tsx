'use client'

import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { PayloadImage } from '@/components/PayloadImage'
import type { Gallery as GalleryItem } from '@/payload-types'

// Сетка фотографий; нажатие открывает снимок во весь экран.
// Полноэкранный просмотр — на родном <dialog>: браузер сам держит фокус
// внутри окна и закрывает по Escape.

export function Gallery({ items }: { items: GalleryItem[] }) {
  const t = useTranslations('gallery')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)

  const current = items[index]
  const currentImage = current?.image && typeof current.image === 'object' ? current.image : null

  const show = (i: number) => {
    setIndex(i)
    setOpen(true)
    dialogRef.current?.showModal()
  }

  const close = () => {
    setOpen(false)
    dialogRef.current?.close()
  }

  const step = useCallback(
    (delta: number) => {
      setIndex((prev) => (prev + delta + items.length) % items.length)
    },
    [items.length],
  )

  // Стрелки клавиатуры листают фото (Escape закрывает окно сам)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, step])

  // Фон не прокручивается, пока открыт просмотр
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current
    const end = e.changedTouches[0]?.clientX
    touchStartX.current = null
    if (start === null || end === undefined) return
    const delta = end - start
    if (Math.abs(delta) > 50) step(delta < 0 ? 1 : -1)
  }

  return (
    <>
      <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item, i) => {
          const image = item.image && typeof item.image === 'object' ? item.image : null
          if (!image) return null
          return (
            <li key={item.id}>
              <figure>
                <button
                  type="button"
                  onClick={() => show(i)}
                  aria-label={item.caption ? t('openNamed', { caption: item.caption }) : t('open')}
                  className="block w-full cursor-zoom-in overflow-hidden rounded-2xl transition-opacity hover:opacity-90"
                >
                  <PayloadImage
                    media={image}
                    sizes="(min-width: 640px) 33vw, 50vw"
                    className="aspect-[4/3] w-full object-cover"
                  />
                </button>
                {item.caption ? (
                  <figcaption className="mt-2 text-base text-ink-soft">{item.caption}</figcaption>
                ) : null}
              </figure>
            </li>
          )
        })}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        aria-label={t('viewer')}
        className="max-h-none max-w-none bg-ink/95 backdrop:bg-ink/95"
      >
        {open && currentImage ? (
          <div
            className="flex h-screen w-screen flex-col p-3 sm:p-6"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex justify-end">
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition-colors hover:bg-white/25"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Стрелки поверх фото: на узком экране они не сжимают снимок */}
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <PayloadImage
                media={currentImage}
                full
                priority
                className="max-h-full min-h-0 w-auto max-w-full rounded-xl object-contain"
              />

              {items.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label={t('previous')}
                    className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-2xl text-white transition-colors hover:bg-ink/80 sm:left-2"
                  >
                    <span aria-hidden="true">‹</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label={t('next')}
                    className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-2xl text-white transition-colors hover:bg-ink/80 sm:right-2"
                  >
                    <span aria-hidden="true">›</span>
                  </button>
                </>
              ) : null}
            </div>

            <div className="pt-3 text-center text-white">
              {current?.caption ? <p className="text-lg">{current.caption}</p> : null}
              {items.length > 1 ? (
                <p aria-live="polite" className="mt-1 font-heading text-sm uppercase tracking-wider text-white/70">
                  {t('counter', { current: index + 1, total: items.length })}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
