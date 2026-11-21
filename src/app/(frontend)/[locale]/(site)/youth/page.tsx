import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { ReelsSection, type ReelItem } from '@/components/ReelsSection'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getSettings, getYouthPage } from '@/lib/queries'

export const revalidate = 3600

// Видео молодёжки лежат в public/reels/youth/ (reel-N.mp4 + обложка reel-N.jpg);
// как их подготовить, описано в public/reels/README.md.
const YOUTH_REELS: ReelItem[] = [1, 2, 3, 4].map((id) => ({
  id,
  videoSrc: `/reels/youth/reel-${id}.mp4`,
  posterSrc: `/reels/youth/reel-${id}.jpg`,
}))

// У молодёжки свой Instagram, отдельный от церковного из настроек сайта
const YOUTH_INSTAGRAM = 'https://www.instagram.com/shyndyk_youth/'

const ACTIVITIES = [
  {
    key: 'games',
    // игральная кость
    icon: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="3.5" />
        <circle cx="8.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="8.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
        <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    key: 'talk',
    // два облачка реплик
    icon: (
      <>
        <path d="M4 5.5h10a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9l-3.5 3v-3H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
        <path d="M16 9.5h4a2 2 0 0 1 2 2v3.5a2 2 0 0 1-2 2h-.5v2.5l-3-2.5H13" />
      </>
    ),
  },
  {
    key: 'events',
    // календарь со звёздочкой
    icon: (
      <>
        <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
        <path d="M3.5 10h17M8 3v4M16 3v4" />
        <path d="M12 12.5l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z" />
      </>
    ),
  },
] as const

export async function generateMetadata(): Promise<Metadata> {
  const [t, youth] = await Promise.all([getTranslations('youth'), getYouthPage()])
  return buildMetadata({
    href: '/youth',
    title: t('title'),
    description: t('metaDescription'),
    image: youth?.heroImage,
  })
}

export default async function YouthPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, youth, t, tNav] = await Promise.all([
    getSettings(),
    getYouthPage(),
    getTranslations('youth'),
    getTranslations('nav'),
  ])

  const heroImage = youth?.heroImage && typeof youth.heroImage === 'object' ? youth.heroImage : null

  return (
    <>
      {/* 1. Главное: что это и когда */}
      <section className="bg-ice-soft">
        <div className="container-site pt-10 sm:pt-14">
          <Breadcrumbs items={[{ href: '/', label: tNav('home') }, { label: tNav('youth') }]} />
        </div>
        <div
          className={`container-site grid items-center gap-8 pb-12 sm:pb-16 lg:gap-12 ${
            heroImage ? 'lg:grid-cols-[1fr_1.1fr]' : ''
          }`}
        >
          <div>
            <p className="chip">{t('chip')}</p>
            <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl">{t('title')}</h1>
            <p className="mt-5 max-w-xl text-xl text-ink-soft">{t('lead')}</p>
            <dl className="mt-6 grid gap-2 text-lg">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
                  {t('whenLabel')}:
                </dt>
                <dd className="font-semibold">
                  {t('whenDay')}, {t('whenTime')}
                </dd>
              </div>
              {settings?.address ? (
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
                    {t('whereLabel')}:
                  </dt>
                  <dd>{settings.address}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {settings?.mapLink ? (
                <a
                  href={settings.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  {t('routeCta')}
                </a>
              ) : (
                <Link href="/contacts" className="btn-primary">
                  {t('routeCta')}
                </Link>
              )}
              <a
                href={YOUTH_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                {t('instagramCta')}
              </a>
            </div>
          </div>

          {/* Фото задаётся в админке: Страницы → Молодёжь. Без него блок остаётся с одним текстом */}
          {heroImage ? (
            <PayloadImage
              media={heroImage}
              sizes="(min-width: 1024px) 55vw, 100vw"
              priority
              className="aspect-[4/3] w-full rounded-3xl object-cover"
            />
          ) : null}
        </div>
      </section>

      {/* 2. Чем занимаемся */}
      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <BrushHeading as="h2" className="text-3xl sm:text-4xl">
            {t('activitiesTitle')}
          </BrushHeading>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {ACTIVITIES.map(({ key, icon }) => (
              <li key={key} className="card p-6 sm:p-8">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ice text-blue-dark">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-7 w-7"
                  >
                    {icon}
                  </svg>
                </span>
                <h3 className="mt-5 text-xl sm:text-2xl">{t(`${key}Title`)}</h3>
                <p className="mt-3 text-ink-soft">{t(`${key}Text`)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. Рилсы — тот же блок, что на главной */}
      <ReelsSection
        instagramUrl={YOUTH_INSTAGRAM}
        title={t('reelsTitle')}
        subtitle={t('reelsSubtitle')}
        ctaText={t('reelsCta')}
        reels={YOUTH_REELS}
      />

      {/* 4. Приглашение */}
      <section className="bg-paper">
        <div className="container-site py-12 sm:py-16">
          <div className="rounded-3xl bg-navy p-8 text-white sm:p-12">
            <h2 className="text-3xl sm:text-4xl">{t('ctaTitle')}</h2>
            <p className="mt-4 max-w-2xl text-xl text-white/90">{t('ctaText')}</p>
            <div className="mt-8">
              <Link href="/contacts" className="group btn bg-white text-navy hover:bg-ice">
                <span>{t('contactsCta')}</span>
                <Arrow />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
