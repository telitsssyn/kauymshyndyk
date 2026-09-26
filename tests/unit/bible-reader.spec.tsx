import { NextIntlClientProvider } from 'next-intl'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { BibleReader } from '@/components/bible/BibleReader'
import { GENESIS_1 } from '@/data/bible/genesis-1'
import messages from '@/i18n/messages/ru.json'

// @ts-expect-error React 19 testing flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('BibleReader', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
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
          <BibleReader initialChapter={GENESIS_1} />
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

  it('переключает перевод на Восточный (CARS)', async () => {
    await mountReader()

    // Находим кнопку выбора перевода
    const translationBtn = container.querySelector('button[aria-label="Выбрать перевод Библии"]') as HTMLButtonElement
    expect(translationBtn).not.toBeNull()

    await act(async () => {
      translationBtn.click()
    })

    // Находим пункт "Восточный перевод"
    const easternOption = Array.from(container.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Восточный перевод'),
    )
    expect(easternOption).toBeDefined()

    await act(async () => {
      easternOption?.click()
    })

    expect(container.textContent).toContain('Восточный перевод')
    expect(container.textContent).toContain('CARS')
    expect(container.textContent).toContain('парил над водами')
  })

  it('переходит ко 2 главе Бытия и обратно', async () => {
    await mountReader()

    // Кнопка перехода к следующей главе
    const nextChapterBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Глава 2') && b.className.includes('btn-primary'),
    )
    expect(nextChapterBtn).toBeDefined()

    await act(async () => {
      nextChapterBtn?.click()
    })

    expect(container.textContent).toContain('Глава 2')
    expect(container.textContent).toContain('Так совершены небо и земля')
    expect(container.textContent).toContain('не стыдились')

    // Теперь активна кнопка возврата к 1 главе
    const prevChapterBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.includes('Глава 1') && b.className.includes('btn-outline'),
    )
    expect(prevChapterBtn).toBeDefined()

    await act(async () => {
      prevChapterBtn?.click()
    })

    expect(container.textContent).toContain('Глава 1')
  })

  it('открывает шторку толкования при клике на стих 1 и позволяет сменить автора на Женевскую Библию', async () => {
    await mountReader()

    const verse1 = container.querySelector('[role="button"]') as HTMLElement
    expect(verse1).not.toBeNull()

    await act(async () => {
      verse1.click()
    })

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.textContent).toContain('Бытие 1:1')
    expect(dialog?.textContent).toContain('Уильям МакДональд')
    expect(dialog?.textContent).toContain('Первопричина всего сущего')

    // Переключаем автора на Женевскую Библию
    const genevaBtn = Array.from(dialog?.querySelectorAll('button') ?? []).find((b) =>
      b.textContent?.includes('Женевская учебная Библия'),
    )
    expect(genevaBtn).toBeDefined()

    await act(async () => {
      genevaBtn?.click()
    })

    expect(dialog?.textContent).toContain('Женевская учебная Библия')
    expect(dialog?.textContent).toContain('Сотворение из ничего')
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

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeNull()
  })
})
