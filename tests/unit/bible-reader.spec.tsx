import fs from 'node:fs'
import path from 'node:path'
import { NextIntlClientProvider } from 'next-intl'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { BibleReader } from '@/components/bible/BibleReader'
import { toChapterText, type BibleChapter } from '@/data/bible/types'
import messages from '@/i18n/messages/ru.json'

const push = vi.fn()

// Навигация next-intl требует смонтированного App Router — в тесте заменяем её
// простой ссылкой и заглушкой роутера
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, prefetch: _prefetch, ...rest }: Record<string, unknown>) => {
    const h = href as { params: { book: string; chapter: string } }
    return (
      <a href={`/bibliya/${h.params.book}/${h.params.chapter}`} {...rest}>
        {children as React.ReactNode}
      </a>
    )
  },
  useRouter: () => ({ push }),
}))

const loadChapter = (book: string, chapter: number): BibleChapter =>
  JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), `public/bible/${book}/${chapter}.json`), 'utf-8'),
  )

const GENESIS_1_FULL = loadChapter('genesis', 1)
const GENESIS_1 = toChapterText(GENESIS_1_FULL)

// @ts-expect-error React 19 testing flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Толкования подгружаются по клику на стих — отдаём файл с диска
vi.stubGlobal('fetch', async (url: string) => {
  const match = String(url).match(/\/bible\/([^/]+)\/(\d+)\.json/)
  if (match) {
    const filePath = path.resolve(process.cwd(), `public/bible/${match[1]}/${match[2]}.json`)
    if (fs.existsSync(filePath)) {
      return { ok: true, json: async () => JSON.parse(fs.readFileSync(filePath, 'utf-8')) }
    }
  }
  return { ok: false, json: async () => null }
})

describe('BibleReader', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    localStorage.clear()
    push.mockClear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  const mountReader = async () => {
    await act(async () => {
      root.render(
        <NextIntlClientProvider locale="ru" timeZone="Asia/Almaty" messages={messages}>
          <BibleReader chapter={GENESIS_1} />
        </NextIntlClientProvider>,
      )
    })
  }

  it('рендерит Бытие 1 со всеми стихами и элементами управления', async () => {
    await mountReader()

    expect(container.textContent).toContain('Бытие')
    expect(container.textContent).toContain('Глава 1')
    expect(container.textContent).toContain('В начале сотворил Бог небо и землю')
    expect(container.textContent).toContain('хорошо весьма')
  })

  it('не кладёт толкования в разметку страницы до клика на стих', async () => {
    await mountReader()

    expect(container.textContent).not.toContain('Первопричина всего сущего')
    expect(GENESIS_1.verses[0]).not.toHaveProperty('commentaries')
  })

  it('переключает перевод на Восточный (CARS) и запоминает выбор', async () => {
    await mountReader()

    const translationBtn = container.querySelector(
      'button[aria-label="Выбрать перевод Библии"]',
    ) as HTMLButtonElement
    expect(translationBtn).not.toBeNull()

    await act(async () => {
      translationBtn.click()
    })

    const easternOption = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Восточный перевод'),
    )
    expect(easternOption).toBeDefined()

    await act(async () => {
      easternOption?.click()
    })

    expect(container.textContent).toContain('CARS')
    expect(container.textContent).toContain('парил над водами')
    // Выбор переживает переход на другую главу
    expect(localStorage.getItem('bible-translation')).toBe('cars')
  })

  it('ссылки соседних глав ведут на адреса страниц глав', async () => {
    await mountReader()

    const links = Array.from(container.querySelectorAll('nav a')).map((a) => a.getAttribute('href'))
    expect(links).toContain('/bibliya/genesis/2')
    // У Бытия 1 нет предыдущей главы — ссылки назад нет
    expect(links).toHaveLength(1)
  })

  it('запоминает место чтения', async () => {
    await mountReader()

    expect(JSON.parse(localStorage.getItem('bible-reading-progress') ?? 'null')).toEqual({
      bookSlug: 'genesis',
      chapterNumber: 1,
    })
  })

  it('стрелка вправо переходит к следующей главе через роутер', async () => {
    await mountReader()

    await act(async () => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    })

    expect(push).toHaveBeenCalledWith({
      pathname: '/bible/[book]/[chapter]',
      params: { book: 'genesis', chapter: '2' },
    })
  })

  it('открывает шторку толкования при клике на стих 1 и позволяет сменить автора на Александра Лопухина', async () => {
    await mountReader()

    const verse1 = container.querySelector('[role="button"]') as HTMLElement
    expect(verse1).not.toBeNull()

    await act(async () => {
      verse1.click()
    })
    // Ждём подгрузку толкований
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50))
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Бытие 1:1')
    expect(dialog?.textContent).toContain('Уильям МакДональд')
    expect(dialog?.textContent).toContain('Первопричина всего сущего')

    const lopukhinBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find(
      (b) => b.textContent?.includes('Александр Лопухин') || b.textContent?.includes('Лопухин'),
    )
    expect(lopukhinBtn).toBeDefined()

    await act(async () => {
      lopukhinBtn?.click()
    })

    expect(dialog?.textContent).toContain('Александр Лопухин')
    expect(dialog?.textContent).toContain('Первый день творения')
  })

  it('закрывает шторку при нажатии на кнопку закрытия', async () => {
    await mountReader()

    const verse1 = container.querySelector('[role="button"]') as HTMLElement
    await act(async () => {
      verse1.click()
    })

    const closeBtn = document.querySelector('button[aria-label="Закрыть толкование"]') as HTMLElement
    expect(closeBtn).not.toBeNull()

    await act(async () => {
      closeBtn.click()
    })

    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })
})
