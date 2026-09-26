import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { AnnouncementBanner } from '@/components/AnnouncementBanner'
import { Arrow } from '@/components/Arrow'
import { BrushHeading } from '@/components/BrushHeading'
import { MapEmbed } from '@/components/MapEmbed'
import { NewsCard } from '@/components/NewsCard'
import { PayloadImage } from '@/components/PayloadImage'
import { ReelsSection } from '@/components/ReelsSection'
import { RichText } from '@/components/RichText'
import { SermonCard } from '@/components/SermonCard'
import { UpcomingServices } from '@/components/UpcomingServices'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getUpcomingServices } from '@/lib/schedule'
import {
  getHomePage,
  getNewsList,
  getSchedule,
  getSermonsList,
  getSettings,
} from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({ href: '/' })
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, home, schedule, news, sermons, t] = await Promise.all([
    getSettings(),
    getHomePage(),
    getSchedule(),
    getNewsList(3),
    getSermonsList(3),
    getTranslations(),
  ])

  const upcoming = getUpcomingServices(schedule, locale, 3)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: settings?.churchName,
    description: settings?.tagline || undefined,
    address: settings?.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: settings.address,
          addressLocality: 'Павлодар',
          addressCountry: 'KZ',
        }
      : undefined,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    url: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
    sameAs: [settings?.instagram, settings?.youtube].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. Приветственный блок (Hero) - фон ice-soft */}
      <section className="bg-ice-soft">
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

      {/* 2. Рилсы из Instagram - фон white */}
      <ReelsSection
        instagramUrl={settings?.instagram}
        title={t('home.reelsTitle')}
        subtitle={t('home.reelsSubtitle')}
        ctaText={t('home.reelsCta')}
      />

      {/* 3. Проповеди - фон paper (#F7F6F3) */}
      {sermons.docs.length > 0 ? (
        <section className="bg-paper">
          <div className="container-site py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <BrushHeading as="h2" className="text-3xl sm:text-4xl">
                {t('home.latestSermons')}
              </BrushHeading>
              <Link
                href="/sermons"
                className="group inline-flex items-center gap-1.5 font-heading font-semibold uppercase tracking-wider text-blue-dark hover:text-ink"
              >
                <span>{t('common.allSermons')}</span>
                <Arrow />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.docs.map((sermon) => (
                <SermonCard key={sermon.id} sermon={sermon} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 4. Новости - фон white (#FFFFFF) */}
      {news.docs.length > 0 ? (
        <section className="bg-white">
          <div className="container-site py-12 sm:py-16">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <BrushHeading as="h2" className="text-3xl sm:text-4xl">
                {t('home.latestNews')}
              </BrushHeading>
              <Link
                href="/news"
                className="group inline-flex items-center gap-1.5 font-heading font-semibold uppercase tracking-wider text-blue-dark hover:text-ink"
              >
                <span>{t('common.allNews')}</span>
                <Arrow />
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.docs.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* 5. Ближайшие богослужения - фон paper (#F7F6F3) */}
      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
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
        </div>
      </section>

      {/* 6. О нас - фон white (#FFFFFF) */}
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

      {/* 7. Я здесь впервые - фон paper (#F7F6F3) с контрастной карточкой navy внутри */}
      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <div className="rounded-3xl bg-navy p-8 text-white sm:p-12">
            <h2 className="text-3xl sm:text-4xl">{t('home.firstTimeTitle')}</h2>
            {home?.firstVisitTeaser ? (
              <p className="mt-4 max-w-2xl text-xl text-white/90">{home.firstVisitTeaser}</p>
            ) : null}
            <div className="mt-8">
              <Link
                href="/first-time"
                className="btn bg-white text-navy hover:bg-ice"
              >
                {t('home.firstTimeCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Как нас найти - фон white */}
      {settings?.mapEmbedUrl ? (
        <section className="bg-white">
          <div className="container-site py-12 sm:py-16">
            <BrushHeading as="h2" className="text-3xl sm:text-4xl">
              {t('home.howToFindUs')}
            </BrushHeading>
            {settings.address ? (
              <p className="mt-4 text-lg text-ink-soft">{settings.address}</p>
            ) : null}
            <div className="mt-6">
              <MapEmbed src={settings.mapEmbedUrl} title={t('contacts.mapTitle')} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
