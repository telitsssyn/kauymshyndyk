import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('courses')
  return buildMetadata({
    href: '/courses',
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav] = await Promise.all([
    getTranslations('courses'),
    getTranslations('nav'),
  ])

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { label: t('title') },
        ]}
      />

      <div className="max-w-3xl">
        <BrushHeading as="h1" className="text-4xl sm:text-5xl">
          {t('title')}
        </BrushHeading>
        <p className="mt-4 text-xl text-ink-soft">{t('subtitle')}</p>
      </div>

      <div className="mt-10 max-w-3xl card p-8 sm:p-10 border border-ink/10 bg-paper">
        <div className="flex flex-col items-start gap-4">
          <span className="chip bg-blue-light/30 text-blue-dark font-medium">
            {t('comingSoonTitle')}
          </span>
          <p className="text-lg text-ink-soft leading-relaxed">
            {t('comingSoonDesc')}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href="/news" className="btn-primary inline-flex items-center gap-2">
              <span>{t('allNews')}</span>
              <Arrow className="h-4 w-4" />
            </Link>
            <Link href="/sermons" className="btn-outline inline-flex items-center gap-2">
              <span>{t('listenSermons')}</span>
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
