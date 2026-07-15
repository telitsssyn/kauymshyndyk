'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Link, usePathname } from '@/i18n/navigation'

import { Logo } from './Logo'

const NAV_ITEMS = [
  { href: '/first-time', key: 'firstTime' },
  { href: '/schedule', key: 'schedule' },
  { href: '/about', key: 'about' },
  { href: '/ministries', key: 'ministries' },
  { href: '/news', key: 'news' },
  { href: '/contacts', key: 'contacts' },
] as const

type NavHref = (typeof NAV_ITEMS)[number]['href'] | '/'

export function Header({ churchName }: { churchName: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const closeMenu = () => setOpen(false)

  const linkClass = (href: NavHref) =>
    `whitespace-nowrap rounded-lg px-3 py-2 font-heading text-base font-semibold uppercase tracking-wider transition-colors hover:bg-mint ${
      pathname === href ? 'text-teal-dark' : 'text-ink'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="container-site flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Logo className="h-11 w-11 shrink-0" />
          <span className="line-clamp-2 max-w-[14rem] font-heading text-base font-bold uppercase leading-tight tracking-wide sm:text-lg">
            {churchName}
          </span>
        </Link>

        <nav aria-label={t('menu')} className="hidden items-center gap-1 xl:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass(item.href)}>
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/donate" className="btn-primary px-4 text-sm sm:text-base">
            {t('donate')}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink/15 text-ink xl:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" focusable="false">
              {open ? (
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              ) : (
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-menu"
          aria-label={t('menu')}
          className="border-t border-ink/10 bg-paper xl:hidden"
        >
          <div className="container-site flex flex-col gap-1 py-3">
            <Link href="/" onClick={closeMenu} className={linkClass('/')}>
              {t('home')}
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={linkClass(item.href)}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  )
}
