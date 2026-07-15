import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { BrushHeading } from '@/components/BrushHeading'
import { MapEmbed } from '@/components/MapEmbed'
import { NewsCard } from '@/components/NewsCard'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { UpcomingServices } from '@/components/UpcomingServices'
import { Link } from '@/i18n/navigation'
import { getUpcomingServices } from '@/lib/schedule'
import { getHomePage, getNewsList, getSchedule, getSettings } from '@/lib/queries'

export const revalidate = 3600

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, home, schedule, news, t] = await Promise.all([
    getSettings(),
    getHomePage(),
    getSchedule(),
    getNewsList(3),
    getTranslations(),
  ])

  const upcoming = getUpcomingServices(schedule, locale, 3)

  return (
    <>
      {/* Приветственный блок */}
      <section className="bg-mint-soft">
        <div className="container-site grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2">
          <div>
            <p className="chip">{t('home.welcome')}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">
              {settings?.churchName}
            </h1>
            {home?.heroSubtitle ? (
              <p className="mt-5 max-w-xl text-xl text-ink-soft">{home.heroSubtitle}</p>
            ) : null}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/schedule" className="btn-primary">
                {t('nav.schedule')}
              </Link>
              <Link href="/first-time" className="btn-outline">
                {t('nav.firstTime')}
              </Link>
            </div>
          </div>
          {home?.heroImage && typeof home.heroImage === 'object' ? (
            <PayloadImage
              media={home.heroImage}
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
          ) : null}
        </div>
      </section>

      {/* Ближайшие богослужения */}
      <section className="container-site py-12 sm:py-16">
        <BrushHeading as="h2" className="text-3xl sm:text-4xl">
          {t('home.upcomingServices')}
        </BrushHeading>
        {schedule?.announcement ? (
          <div className="mt-6">
            <AnnouncementBanner
              title={t('schedule.announcementTitle')}
              text={schedule.announcement}
            />
          </div>
        ) : null}
        <div className="mt-8">
          {upcoming.length > 0 ? (
            <UpcomingServices services={upcoming} />
          ) : (
            <p className="text-lg text-ink-soft">{t('schedule.empty')}</p>
          )}
        </div>
        <div className="mt-8">
          <Link href="/schedule" className="btn-outline">
            {t('home.fullSchedule')}
          </Link>
        </div>
      </section>

      {/* О нас */}
      {home?.aboutText ? (
        <section className="bg-white">
          <div className="container-site grid items-center gap-8 py-12 sm:py-16 lg:grid-cols-2">
            {home.aboutImage && typeof home.aboutImage === 'object' ? (
              <PayloadImage
                media={home.aboutImage}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-3xl object-cover"
              />
            ) : null}
            <div>
              <BrushHeading as="h2" className="text-3xl sm:text-4xl">
                {t('home.aboutUs')}
              </BrushHeading>
              <div className="mt-6">
                <RichText data={home.aboutText} />
              </div>
              <div className="mt-8">
                <Link href="/about" className="btn-outline">
                  {t('home.moreAboutChurch')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Я здесь впервые */}
      <section className="container-site py-12 sm:py-16">
        <div className="rounded-3xl bg-teal-dark p-8 text-white sm:p-12">
          <h2 className="text-3xl sm:text-4xl">{t('home.firstTimeTitle')}</h2>
          {home?.firstVisitTeaser ? (
            <p className="mt-4 max-w-2xl text-xl text-white/90">{home.firstVisitTeaser}</p>
          ) : null}
          <div className="mt-8">
            <Link
              href="/first-time"
              className="btn bg-white text-teal-dark hover:bg-mint"
            >
              {t('home.firstTimeCta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Новости */}
      {news.docs.length > 0 ? (
        <section className="container-site pb-12 sm:pb-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <BrushHeading as="h2" className="text-3xl sm:text-4xl">
              {t('home.latestNews')}
            </BrushHeading>
            <Link
              href="/news"
              className="font-heading font-semibold uppercase tracking-wider text-teal-dark hover:text-ink"
            >
              {t('common.allNews')} →
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.docs.map((item) => (
              <NewsCard key={item.id} news={item} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Как нас найти */}
      {settings?.mapEmbedUrl ? (
        <section className="container-site pb-12 sm:pb-16">
          <BrushHeading as="h2" className="text-3xl sm:text-4xl">
            {t('home.howToFindUs')}
          </BrushHeading>
          {settings.address ? (
            <p className="mt-4 text-lg text-ink-soft">{settings.address}</p>
          ) : null}
          <div className="mt-6">
            <MapEmbed src={settings.mapEmbedUrl} title={t('contacts.mapTitle')} />
          </div>
        </section>
      ) : null}
    </>
  )
}
