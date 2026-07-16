import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Setting } from '@/payload-types'

import { Logo } from './Logo'
import { SocialLinks } from './SocialLinks'

const NAV_ITEMS = [
  { href: '/first-time', key: 'firstTime' },
  { href: '/schedule', key: 'schedule' },
  { href: '/sermons', key: 'sermons' },
  { href: '/news', key: 'news' },
  { href: '/about', key: 'about' },
  { href: '/ministries', key: 'ministries' },
  { href: '/donate', key: 'donate' },
  { href: '/contacts', key: 'contacts' },
] as const

export function Footer({ settings }: { settings: Setting | null }) {
  const t = useTranslations()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 bg-navy text-paper">
      <div className="container-site grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <span className="font-heading text-xl font-bold uppercase tracking-wide">
              {settings?.churchName}
            </span>
          </div>
          {settings?.tagline ? (
            <p className="mt-4 max-w-xs text-base text-paper/70">{settings.tagline}</p>
          ) : null}
          <SocialLinks settings={settings} className="mt-5" />
        </div>

        <nav aria-label={t('footer.navigation')}>
          <h2 className="font-heading text-base font-semibold uppercase tracking-wider text-blue-light">
            {t('footer.navigation')}
          </h2>
          <ul className="mt-4 grid gap-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-base text-paper/85 underline-offset-4 hover:underline"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading text-base font-semibold uppercase tracking-wider text-blue-light">
            {t('footer.contacts')}
          </h2>
          <ul className="mt-4 grid gap-3 text-base text-paper/85">
            {settings?.address ? <li>{settings.address}</li> : null}
            {settings?.phone ? (
              <li>
                <a
                  href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                  className="whitespace-nowrap hover:underline"
                >
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings?.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="hover:underline">
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="border-t border-paper/15">
        <div className="container-site py-4 text-sm text-paper/60">
          © {year} {settings?.churchName}. {t('footer.rights')}.
        </div>
      </div>
    </footer>
  )
}
