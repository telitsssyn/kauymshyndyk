import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BibleReader } from '@/components/bible/BibleReader'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { GENESIS_1 } from '@/data/bible/genesis-1'
import { buildMetadata } from '@/lib/metadata'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bible')
  return buildMetadata({
    href: '/bible',
    title: `${t('title')} — Бытие`,
    description: 'Чтение Священного Писания в Синодальном и Восточном переводах с толкованиями.',
  })
}

export default async function BiblePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav] = await Promise.all([
    getTranslations('bible'),
    getTranslations('nav'),
  ])

  return (
    <div className="container-site py-4 sm:py-10">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { label: t('title') },
        ]}
      />

      <div className="mb-4 sm:mb-6 max-w-3xl">
        <BrushHeading as="h1" className="text-3xl sm:text-5xl">
          {t('title')}
        </BrushHeading>
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-ink-soft">
          Синодальный и Восточный переводы с толкованиями
        </p>
      </div>

      <BibleReader initialChapter={GENESIS_1} />
    </div>
  )
}
