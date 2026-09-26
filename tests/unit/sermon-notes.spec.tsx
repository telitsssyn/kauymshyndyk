import { NextIntlClientProvider } from 'next-intl'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { SermonNotes } from '@/components/SermonNotes'
import messages from '@/i18n/messages/ru.json'

// @ts-expect-error React 19 testing flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('SermonNotes', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    localStorage.clear()
    vi.useRealTimers()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
    localStorage.clear()
  })

  const mountNotes = async (slug = 'test-sermon') => {
    await act(async () => {
      root.render(
        <NextIntlClientProvider locale="ru" messages={messages}>
          <SermonNotes slug={slug} />
        </NextIntlClientProvider>,
      )
    })
  }

  it('загружает ранее сохранённую заметку из localStorage', async () => {
    localStorage.setItem('sermon-notes:predydushchaya', 'Мой прошлый конспект')
    await mountNotes('predydushchaya')

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('Мой прошлый конспект')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    expect(clearBtn).toBeDefined()
  })

  it('не показывает кнопку очистки при пустом поле', async () => {
    await mountNotes('new-sermon')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    expect(clearBtn).toBeUndefined()
  })

  it('открывает модальный попап подтверждения при нажатии на «Очистить»', async () => {
    localStorage.setItem('sermon-notes:sermon-1', 'Текст заметки')
    await mountNotes('sermon-1')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    expect(clearBtn).toBeDefined()

    const dialog = container.querySelector('dialog') as HTMLDialogElement
    expect(dialog.open).toBe(false)

    await act(async () => {
      clearBtn?.click()
    })

    expect(dialog.open).toBe(true)

    const title = dialog.querySelector('h3')
    expect(title?.textContent?.trim()).toBe('Очистить заметку?')

    const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Да, очистить',
    )
    const cancelBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Отмена',
    )

    expect(confirmBtn).toBeDefined()
    expect(cancelBtn).toBeDefined()
  })

  it('закрывает попап и отменяет очистку при нажатии на «Отмена»', async () => {
    localStorage.setItem('sermon-notes:sermon-1', 'Текст заметки')
    await mountNotes('sermon-1')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    await act(async () => {
      clearBtn?.click()
    })

    const dialog = container.querySelector('dialog') as HTMLDialogElement
    expect(dialog.open).toBe(true)

    const cancelBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Отмена',
    )
    await act(async () => {
      cancelBtn?.click()
    })

    expect(dialog.open).toBe(false)

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('Текст заметки')
    expect(localStorage.getItem('sermon-notes:sermon-1')).toBe('Текст заметки')
  })

  it('закрывает попап при нажатии на крестик в углу', async () => {
    localStorage.setItem('sermon-notes:sermon-1', 'Текст заметки')
    await mountNotes('sermon-1')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    await act(async () => {
      clearBtn?.click()
    })

    const dialog = container.querySelector('dialog') as HTMLDialogElement
    expect(dialog.open).toBe(true)

    const closeBtn = dialog.querySelector('button[aria-label="Закрыть"]') as HTMLButtonElement
    expect(closeBtn).toBeDefined()

    await act(async () => {
      closeBtn?.click()
    })

    expect(dialog.open).toBe(false)
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('Текст заметки')
  })

  it('удаляет заметку, стирает её из localStorage и закрывает попап после подтверждения', async () => {
    localStorage.setItem('sermon-notes:sermon-1', 'Текст заметки')
    await mountNotes('sermon-1')

    const clearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    await act(async () => {
      clearBtn?.click()
    })

    const dialog = container.querySelector('dialog') as HTMLDialogElement
    expect(dialog.open).toBe(true)

    const confirmBtn = Array.from(dialog.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Да, очистить',
    )
    await act(async () => {
      confirmBtn?.click()
    })

    expect(dialog.open).toBe(false)

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea.value).toBe('')
    expect(localStorage.getItem('sermon-notes:sermon-1')).toBeNull()

    const remainingClearBtn = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Очистить',
    )
    expect(remainingClearBtn).toBeUndefined()
  })
})
