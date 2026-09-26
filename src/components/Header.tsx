'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { Link, usePathname } from '@/i18n/navigation'

import { Logo } from './Logo'

type SubNavHref =
  | '/first-time'
  | '/about'
  | '/schedule'
  | '/contacts'
  | '/sermons'
  | '/bible'
  | '/courses'

type SubNavItem = {
  href: SubNavHref
  labelKey:
    | 'firstTime'
    | 'about'
    | 'schedule'
    | 'contacts'
    | 'sermons'
    | 'bible'
    | 'courses'
  descKey:
    | 'firstTimeDesc'
    | 'aboutDesc'
    | 'scheduleDesc'
    | 'contactsDesc'
    | 'sermonsDesc'
    | 'bibleDesc'
    | 'coursesDesc'
}

const ABOUT_ITEMS: SubNavItem[] = [
  { href: '/first-time', labelKey: 'firstTime', descKey: 'firstTimeDesc' },
  { href: '/about', labelKey: 'about', descKey: 'aboutDesc' },
  { href: '/schedule', labelKey: 'schedule', descKey: 'scheduleDesc' },
  { href: '/contacts', labelKey: 'contacts', descKey: 'contactsDesc' },
]

const DOCTRINE_ITEMS: SubNavItem[] = [
  { href: '/sermons', labelKey: 'sermons', descKey: 'sermonsDesc' },
  { href: '/bible', labelKey: 'bible', descKey: 'bibleDesc' },
  { href: '/courses', labelKey: 'courses', descKey: 'coursesDesc' },
]

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3.75 6.25L8 10.5l4.25-4.25" />
    </svg>
  )
}

export function Header({ churchName }: { churchName: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<'about' | 'doctrine' | null>(null)

  const navRef = useRef<HTMLElement | null>(null)
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const closeMenu = () => {
    setOpen(false)
    setActiveDropdown(null)
  }

  const isPathActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const isGroupActive = (items: SubNavItem[]) => items.some((item) => isPathActive(item.href))

  // Закрытие при клике снаружи или нажатии Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null)
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current)
    }
  }, [])

  // Блокировка скролла основной страницы при открытом мобильном меню
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const [prevPathname, setPrevPathname] = useState(pathname)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname)
    setActiveDropdown(null)
    setOpen(false)
  }

  const handleMouseEnter = (key: 'about' | 'doctrine') => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current)
      leaveTimeoutRef.current = null
    }
    setActiveDropdown(key)
  }

  const handleMouseLeave = () => {
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
      <div className="container-site flex items-center justify-between gap-3 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Logo className="h-11 w-11 shrink-0" />
          <span className="hidden font-heading font-bold uppercase leading-tight tracking-wide sm:line-clamp-2 sm:max-w-[14rem] sm:text-base lg:max-w-[16rem] xl:max-w-[20rem] xl:text-lg">
            {churchName}
          </span>
        </Link>

        {/* Десктопная навигация */}
        <nav
          ref={navRef}
          aria-label={t('menu')}
          className="hidden items-center gap-1 lg:flex xl:gap-2"
        >
          {/* Группа 1: О церкви */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('about')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'about' ? null : 'about')}
              aria-expanded={activeDropdown === 'about'}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ice xl:px-3 xl:text-base xl:tracking-wider ${
                isGroupActive(ABOUT_ITEMS) || activeDropdown === 'about'
                  ? 'text-blue-dark'
                  : 'text-ink'
              }`}
            >
              <span>{t('aboutGroup')}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeDropdown === 'about' ? 'rotate-180 text-blue-dark' : 'text-ink-soft'
                }`}
              />
            </button>

            {activeDropdown === 'about' ? (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="card w-80 rounded-2xl border border-ink/10 bg-paper/98 p-2 shadow-xl backdrop-blur">
                  {ABOUT_ITEMS.map((item) => {
                    const active = isPathActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`group flex flex-col rounded-xl px-3 py-2.5 transition-colors ${
                          active
                            ? 'bg-ice text-blue-dark'
                            : 'text-ink hover:bg-ice/70 hover:text-blue-dark'
                        }`}
                      >
                        <span className="font-heading text-sm font-semibold tracking-wide">
                          {t(item.labelKey)}
                        </span>
                        <span className="text-xs text-ink-soft transition-colors group-hover:text-ink/75">
                          {t(item.descKey)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Группа 2: Учение */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('doctrine')}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setActiveDropdown(activeDropdown === 'doctrine' ? null : 'doctrine')}
              aria-expanded={activeDropdown === 'doctrine'}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ice xl:px-3 xl:text-base xl:tracking-wider ${
                isGroupActive(DOCTRINE_ITEMS) || activeDropdown === 'doctrine'
                  ? 'text-blue-dark'
                  : 'text-ink'
              }`}
            >
              <span>{t('doctrine')}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  activeDropdown === 'doctrine' ? 'rotate-180 text-blue-dark' : 'text-ink-soft'
                }`}
              />
            </button>

            {activeDropdown === 'doctrine' ? (
              <div className="absolute left-0 top-full z-50 pt-2">
                <div className="card w-80 rounded-2xl border border-ink/10 bg-paper/98 p-2 shadow-xl backdrop-blur">
                  {DOCTRINE_ITEMS.map((item) => {
                    const active = isPathActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setActiveDropdown(null)}
                        className={`group flex flex-col rounded-xl px-3 py-2.5 transition-colors ${
                          active
                            ? 'bg-ice text-blue-dark'
                            : 'text-ink hover:bg-ice/70 hover:text-blue-dark'
                        }`}
                      >
                        <span className="font-heading text-sm font-semibold tracking-wide">
                          {t(item.labelKey)}
                        </span>
                        <span className="text-xs text-ink-soft transition-colors group-hover:text-ink/75">
                          {t(item.descKey)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          {/* Новости */}
          <Link
            href="/news"
            className={`rounded-lg px-2.5 py-2 font-heading text-sm font-semibold uppercase tracking-wide transition-colors hover:bg-ice xl:px-3 xl:text-base xl:tracking-wider ${
              isPathActive('/news') ? 'text-blue-dark' : 'text-ink'
            }`}
          >
            {t('news')}
          </Link>
        </nav>

        {/* Действия справа */}
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
            className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-ink/15 text-ink lg:hidden"
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

      {/* Мобильное меню */}
      {open ? (
        <nav
          id="mobile-menu"
          aria-label={t('menu')}
          className="border-t border-ink/10 bg-paper lg:hidden"
        >
          <div className="container-site flex max-h-[calc(100dvh-4.5rem)] flex-col gap-3 overflow-y-auto overscroll-contain py-4">
            <Link
              href="/"
              onClick={closeMenu}
              className={`rounded-xl px-3 py-2 font-heading text-base font-semibold uppercase tracking-wide transition-colors hover:bg-ice ${
                pathname === '/' ? 'bg-ice/60 text-blue-dark' : 'text-ink'
              }`}
            >
              {t('home')}
            </Link>

            {/* Группа 1: О церкви */}
            <div className="rounded-2xl border border-ink/10 bg-sand/30 p-2.5">
              <div className="px-2.5 py-1 font-heading text-xs font-bold uppercase tracking-wider text-ink-soft">
                {t('aboutGroup')}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {ABOUT_ITEMS.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={closeMenu}
                    className={`flex flex-col rounded-xl px-2.5 py-2 transition-colors ${
                      isPathActive(sub.href)
                        ? 'bg-ice font-semibold text-blue-dark'
                        : 'text-ink hover:bg-ice'
                    }`}
                  >
                    <span className="font-heading text-sm font-semibold uppercase tracking-wide">
                      {t(sub.labelKey)}
                    </span>
                    <span className="text-xs text-ink-soft">{t(sub.descKey)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Группа 2: Учение */}
            <div className="rounded-2xl border border-ink/10 bg-sand/30 p-2.5">
              <div className="px-2.5 py-1 font-heading text-xs font-bold uppercase tracking-wider text-ink-soft">
                {t('doctrine')}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {DOCTRINE_ITEMS.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={closeMenu}
                    className={`flex flex-col rounded-xl px-2.5 py-2 transition-colors ${
                      isPathActive(sub.href)
                        ? 'bg-ice font-semibold text-blue-dark'
                        : 'text-ink hover:bg-ice'
                    }`}
                  >
                    <span className="font-heading text-sm font-semibold uppercase tracking-wide">
                      {t(sub.labelKey)}
                    </span>
                    <span className="text-xs text-ink-soft">{t(sub.descKey)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Новости */}
            <Link
              href="/news"
              onClick={closeMenu}
              className={`rounded-xl px-3 py-2 font-heading text-base font-semibold uppercase tracking-wide transition-colors hover:bg-ice ${
                isPathActive('/news') ? 'bg-ice/60 text-blue-dark' : 'text-ink'
              }`}
            >
              {t('news')}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  )
}
