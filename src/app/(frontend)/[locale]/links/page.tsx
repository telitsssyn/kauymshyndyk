import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Logo } from '@/components/Logo'
import { Link } from '@/i18n/navigation'
import { getSchedule, getSettings } from '@/lib/queries'

export const revalidate = 3600

const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('links')
  return { title: t('title'), description: t('description') }
}

function Tile({
  icon,
  children,
  primary = false,
}: {
  icon: ReactNode
  children: ReactNode
  primary?: boolean
}) {
  return (
    <span
      className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 shadow-sm ring-1 transition-transform group-hover:-translate-y-0.5 group-active:translate-y-0 ${
        primary
          ? 'bg-blue-dark text-white ring-blue-dark'
          : 'bg-white text-ink ring-ink/10'
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
          primary ? 'bg-white/15 text-white' : 'bg-ice text-blue-dark'
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 font-heading text-lg font-semibold uppercase tracking-wide">
        {children}
      </span>
      <span aria-hidden="true" className={primary ? 'text-white/70' : 'text-ink-soft'}>
        →
      </span>
    </span>
  )
}

const icons = {
  calendar: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
    </svg>
  ),
  hello: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.5" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
      <path d="M21.58 7.19a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.82.42A2.5 2.5 0 0 0 2.42 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .42 4.81 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.82-.42a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.42-4.81zM10 15.2V8.8l5.2 3.2-5.2 3.2z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  ),
}

export default async function LinksPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, schedule, t] = await Promise.all([
    getSettings(),
    getSchedule(),
    getTranslations(),
  ])

  const services = [...(schedule?.regularServices ?? [])].sort(
    (a, b) =>
      DAY_ORDER.indexOf(a.day as (typeof DAY_ORDER)[number]) -
        DAY_ORDER.indexOf(b.day as (typeof DAY_ORDER)[number]) || a.time.localeCompare(b.time),
  )

  const phoneHref = settings?.phone ? `tel:${settings.phone.replace(/[^+\d]/g, '')}` : null

  return (
    <main className="flex-1 bg-gradient-to-b from-ice-soft to-paper">
      <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-10 sm:py-14">
        <Logo className="h-24 w-24 shadow-md" />
        <h1 className="mt-5 text-center text-3xl">{settings?.churchName}</h1>
        {settings?.tagline ? (
          <p className="mt-3 text-center text-base text-ink-soft">{settings.tagline}</p>
        ) : null}

        {services.length > 0 ? (
          <section aria-label={t('links.weekly')} className="mt-6 w-full rounded-2xl bg-white/70 p-4 ring-1 ring-ink/5">
            <h2 className="text-center font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
              {t('links.weekly')}
            </h2>
            <ul className="mt-3 grid gap-1.5">
              {services.map((service, i) => (
                <li key={service.id ?? i} className="flex items-baseline justify-center gap-2 text-base">
                  <span className="font-semibold">{t(`schedule.days.${service.day}`)}</span>
                  <span className="font-heading font-bold">{service.time}</span>
                  <span className="text-ink-soft">{service.title}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <nav aria-label={t('links.title')} className="mt-6 grid w-full gap-3">
          <Link href="/schedule" className="group">
            <Tile icon={icons.calendar} primary>
              {t('links.schedule')}
            </Tile>
          </Link>
          <Link href="/first-time" className="group">
            <Tile icon={icons.hello}>{t('links.firstTime')}</Tile>
          </Link>
          <Link href="/sermons" className="group">
            <Tile icon={icons.play}>{t('links.sermons')}</Tile>
          </Link>
          {settings?.mapLink ? (
            <a href={settings.mapLink} target="_blank" rel="noopener noreferrer" className="group">
              <Tile icon={icons.pin}>{t('links.route')}</Tile>
            </a>
          ) : null}
          {phoneHref ? (
            <a href={phoneHref} className="group">
              <Tile icon={icons.phone}>{t('links.call')}</Tile>
            </a>
          ) : null}
          {settings?.instagram ? (
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="group">
              <Tile icon={icons.instagram}>{t('links.instagram')}</Tile>
            </a>
          ) : null}
          {settings?.youtube ? (
            <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="group">
              <Tile icon={icons.youtube}>{t('links.youtube')}</Tile>
            </a>
          ) : null}
          <Link href="/donate" className="group">
            <Tile icon={icons.heart}>{t('links.donate')}</Tile>
          </Link>
          <Link href="/" className="group">
            <Tile icon={icons.globe}>{t('links.site')}</Tile>
          </Link>
        </nav>

        {settings?.address ? (
          <p className="mt-8 text-center text-base text-ink-soft">{settings.address}</p>
        ) : null}
      </div>
    </main>
  )
}
