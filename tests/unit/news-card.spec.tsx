import { NextIntlClientProvider } from 'next-intl'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { NewsCard } from '@/components/NewsCard'
import messages from '@/i18n/messages/ru.json'
import type { News } from '@/payload-types'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, className }: { children: React.ReactNode; href: unknown; className?: string }) => (
    <a href={typeof href === 'object' ? JSON.stringify(href) : String(href)} className={className}>
      {children}
    </a>
  ),
}))

vi.mock('@/components/PayloadImage', () => ({
  PayloadImage: () => <div data-testid="mock-image" />,
}))

// @ts-expect-error React 19 testing flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('NewsCard', () => {
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

  const baseNews: News = {
    id: 1,
    title: 'Тестовая новость',
    slug: 'test-news',
    publishedDate: '2026-09-01T10:00:00.000Z',
    cover: 10,
    excerpt: 'Краткое описание новости',
    content: { root: { children: [], direction: 'ltr', format: '', indent: 0, type: 'root', version: 1 } },
    updatedAt: '2026-09-01T10:00:00.000Z',
    createdAt: '2026-09-01T10:00:00.000Z',
  }

  const renderCard = async (news: News) => {
    await act(async () => {
      root.render(
        <NextIntlClientProvider locale="ru" timeZone="Asia/Almaty" messages={messages}>
          <NewsCard news={news} />
        </NextIntlClientProvider>,
      )
    })
  }

  it('для обычных новостей отображает дату публикации и не показывает бейдж события', async () => {
    await renderCard(baseNews)

    expect(container.textContent).not.toContain('Событие')
    const timeEl = container.querySelector('time')
    expect(timeEl).not.toBeNull()
    expect(timeEl?.getAttribute('dateTime')).toBe('2026-09-01T10:00:00.000Z')
    expect(timeEl?.textContent).toContain('сентября')
    expect(timeEl?.textContent).toContain('2026')
  })

  it('для событий отображает бейдж "Событие" и дату события вместо даты публикации', async () => {
    const eventNews: News = {
      ...baseNews,
      title: 'Праздничное служение',
      publishedDate: '2026-09-01T10:00:00.000Z',
      eventDate: '2026-10-15T00:00:00.000Z',
    }
    await renderCard(eventNews)

    expect(container.textContent).toContain('Событие')

    const timeEl = container.querySelector('time')
    expect(timeEl).not.toBeNull()
    expect(timeEl?.getAttribute('dateTime')).toBe('2026-10-15T00:00:00.000Z')
    expect(timeEl?.textContent).toContain('15')
    expect(timeEl?.textContent).toContain('октября')
    expect(timeEl?.textContent).toContain('2026')

    // Не содержит дату публикации "1 сентября"
    expect(container.textContent).not.toContain('1 сентября')
    // Не содержит время "00:00"
    expect(container.textContent).not.toContain('00:00')
  })
})
