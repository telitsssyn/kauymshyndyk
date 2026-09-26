import { NextIntlClientProvider } from 'next-intl'
import React, { act } from 'react'
import { createRoot, Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Header } from '@/components/Header'
import messages from '@/i18n/messages/ru.json'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, onClick, className }: { children: React.ReactNode; href: unknown; onClick?: () => void; className?: string }) => (
    <a
      href={typeof href === 'object' ? JSON.stringify(href) : String(href)}
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
      className={className}
    >
      {children}
    </a>
  ),
  usePathname: () => '/',
}))

// @ts-expect-error React 19 testing flag
globalThis.IS_REACT_ACT_ENVIRONMENT = true

describe('Header', () => {
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

  const mountHeader = async () => {
    await act(async () => {
      root.render(
        <NextIntlClientProvider locale="ru" timeZone="Asia/Almaty" messages={messages}>
          <Header churchName="Кауым-Церковь Шындык" />
        </NextIntlClientProvider>,
      )
    })
  }

  it('рендерит основные группы навигации: "О церкви", "Учение", "Новости" и кнопку "Пожертвовать"', async () => {
    await mountHeader()

    expect(container.textContent).toContain('О церкви')
    expect(container.textContent).toContain('Учение')
    expect(container.textContent).toContain('Новости')
    expect(container.textContent).toContain('Пожертвовать')
  })

  it('открывает выпадающее меню "О церкви" со всеми подразделами', async () => {
    await mountHeader()

    const aboutButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('О церкви'),
    )
    expect(aboutButton).toBeDefined()

    await act(async () => {
      aboutButton?.click()
    })

    expect(container.textContent).toContain('Впервые здесь')
    expect(container.textContent).toContain('О нас')
    expect(container.textContent).toContain('Расписание')
    expect(container.textContent).toContain('Контакты')
  })

  it('открывает выпадающее меню "Учение" с "Проповеди" и "Библия"', async () => {
    await mountHeader()

    const doctrineButton = Array.from(container.querySelectorAll('button')).find(
      (btn) => btn.textContent?.includes('Учение'),
    )
    expect(doctrineButton).toBeDefined()

    await act(async () => {
      doctrineButton?.click()
    })

    expect(container.textContent).toContain('Проповеди')
    expect(container.textContent).toContain('Библия')
    expect(container.textContent).toContain('Курсы')
  })

  it('мобильное меню открывается по клику на бургер и содержит сгруппированные разделы', async () => {
    await mountHeader()

    const burgerButton = container.querySelector('button[aria-controls="mobile-menu"]') as HTMLButtonElement
    expect(burgerButton).not.toBeNull()

    await act(async () => {
      burgerButton.click()
    })

    const mobileMenu = container.querySelector('#mobile-menu')
    expect(mobileMenu).not.toBeNull()
    expect(mobileMenu?.textContent).toContain('Главная')
    expect(mobileMenu?.textContent).toContain('О церкви')
    expect(mobileMenu?.textContent).toContain('Учение')
    expect(mobileMenu?.textContent).toContain('Библия')
    expect(mobileMenu?.textContent).toContain('Курсы')
    expect(mobileMenu?.textContent).toContain('Новости')
  })
})
