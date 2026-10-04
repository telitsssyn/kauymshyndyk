import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { BibleReader } from '@/components/bible/BibleReader'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BIBLE_BOOKS } from '@/data/bible/books'
import { loadBibleChapterText, resolveBibleChapter } from '@/data/bible/server'
import { buildMetadata } from '@/lib/metadata'

export const revalidate = 86400

// Все 1189 глав собираются заранее — каждая получает собственный адрес и
// попадает в поисковую выдачу. Тексты не меняются, поэтому кэш живёт сутки.
export function generateStaticParams() {
  return BIBLE_BOOKS.flatMap((book) =>
    Array.from({ length: book.chaptersCount }, (_, i) => ({
      book: book.slug,
      chapter: String(i + 1),
    })),
  )
}

type Params = { locale: string; book: string; chapter: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { book: bookSlug, chapter } = await params
  const chapterNumber = Number(chapter)
  const book = resolveBibleChapter(bookSlug, chapterNumber)
  if (!book) return {}

  const t = await getTranslations('bible')
  return buildMetadata({
    href: { pathname: '/bible/[book]/[chapter]', params: { book: bookSlug, chapter } },
    title: `${book.name} ${chapterNumber} — ${t('title')}`,
    description: t('metaDescription'),
  })
}

export default async function BibleChapterPage({ params }: { params: Promise<Params> }) {
  const { locale, book: bookSlug, chapter } = await params
  setRequestLocale(locale)

  const chapterNumber = Number(chapter)
  if (!resolveBibleChapter(bookSlug, chapterNumber)) notFound()

  const [t, tNav, data] = await Promise.all([
    getTranslations('bible'),
    getTranslations('nav'),
    loadBibleChapterText(bookSlug, chapterNumber),
  ])
  if (!data) notFound()

  return (
    <div className="container-site py-4 sm:py-10">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { href: '/bible', label: t('title') },
          { label: t('chapterShort', { book: data.bookName, chapter: chapterNumber }) },
        ]}
      />
      <BibleReader chapter={data} />
    </div>
  )
}
