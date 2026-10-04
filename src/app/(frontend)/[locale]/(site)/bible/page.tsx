import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { BibleReader } from '@/components/bible/BibleReader'
import { ContinueReading } from '@/components/bible/ContinueReading'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { loadBibleChapterText } from '@/data/bible/server'
import { buildMetadata } from '@/lib/metadata'

export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('bible')
  return buildMetadata({
    href: '/bible',
    title: t('title'),
    description: t('metaDescription'),
  })
}

export default async function BiblePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [t, tNav, chapter] = await Promise.all([
    getTranslations('bible'),
    getTranslations('nav'),
    loadBibleChapterText('genesis', 1),
  ])
  if (!chapter) notFound()

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
        <p className="mt-1 sm:mt-2 text-sm sm:text-lg text-ink-soft">{t('subtitle')}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <ContinueReading />
      </div>

      {/* На общей странице стартовая глава не запоминается как «место чтения» */}
      <BibleReader chapter={chapter} trackProgress={false} />
    </div>
  )
}
