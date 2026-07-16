import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { BrushHeading } from '@/components/BrushHeading'
import { Link } from '@/i18n/navigation'
import { getActiveSpecialServices } from '@/lib/schedule'
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
  const t = await getTranslations('schedule')
  return { title: t('title') }
}

export default async function SchedulePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [schedule, settings, t] = await Promise.all([
    getSchedule(),
    getSettings(),
    getTranslations(),
  ])

  const special = getActiveSpecialServices(schedule, locale)
  const regular = schedule?.regularServices ?? []
  const days = DAY_ORDER.map((day) => ({
    day,
    services: regular
      .filter((s) => s.day === day)
      .sort((a, b) => a.time.localeCompare(b.time)),
  })).filter((d) => d.services.length > 0)

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('schedule.title')}
      </BrushHeading>

      {schedule?.announcement ? (
        <div className="mt-8">
          <AnnouncementBanner title={t('schedule.announcementTitle')} text={schedule.announcement} />
        </div>
      ) : null}

      {special.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl">{t('schedule.specialTitle')}</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {special.map((service, i) => (
              <li key={i} className="card border-l-4 border-l-blue p-5">
                <span className="font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
                  {service.dateLabel}
                </span>
                <div className="mt-1 flex items-baseline gap-3">
                  <span className="font-heading text-3xl font-bold">{service.time}</span>
                  <span className="text-lg font-semibold">{service.title}</span>
                </div>
                {service.note ? <p className="mt-2 text-base text-ink-soft">{service.note}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl sm:text-3xl">{t('schedule.weeklyTitle')}</h2>
        {days.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {days.map(({ day, services }) => (
              <div key={day} className="card p-5 sm:flex sm:items-start sm:gap-8">
                <h3 className="w-48 shrink-0 text-xl text-blue-dark">
                  {t(`schedule.days.${day}`)}
                </h3>
                <ul className="mt-3 grid flex-1 gap-3 sm:mt-0">
                  {services.map((service, i) => (
                    <li key={i} className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-heading text-2xl font-bold">{service.time}</span>
                      <span className="text-lg">{service.title}</span>
                      {service.note ? (
                        <span className="text-base text-ink-soft">{service.note}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-lg text-ink-soft">{t('schedule.empty')}</p>
        )}
      </section>

      {settings?.phone ? (
        <p className="mt-10 text-lg text-ink-soft">
          {t('contacts.getInTouch')}:{' '}
          <a
            href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
            className="whitespace-nowrap font-semibold text-blue-dark underline underline-offset-4"
          >
            {settings.phone}
          </a>
        </p>
      ) : null}

      <div className="mt-8">
        <Link href="/first-time" className="btn-outline">
          {t('nav.firstTime')}
        </Link>
      </div>
    </div>
  )
}
