import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { RichText } from '@/components/RichText'
import { Link } from '@/i18n/navigation'
import { getFirstVisit } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('firstTime')
  return { title: t('title'), description: t('subtitle') }
}

export default async function FirstTimePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [data, t] = await Promise.all([getFirstVisit(), getTranslations()])

  return (
    <div className="container-site py-10 sm:py-14">
      <div className="max-w-3xl">
        <BrushHeading as="h1" className="text-4xl sm:text-5xl">
          {t('firstTime.title')}
        </BrushHeading>
        <p className="mt-5 text-xl text-ink-soft">{t('firstTime.subtitle')}</p>
        {data?.intro ? (
          <div className="mt-6">
            <RichText data={data.intro} />
          </div>
        ) : null}
      </div>

      {(data?.sections ?? []).length > 0 ? (
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {(data?.sections ?? []).map((section, i) => (
            <section key={section.id ?? i} className="card p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ice font-heading text-xl font-bold text-blue-dark"
                >
                  {i + 1}
                </span>
                <h2 className="text-2xl">{section.title}</h2>
              </div>
              <div className="mt-4">
                <RichText data={section.content} />
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {(data?.faq ?? []).length > 0 ? (
        <section className="mt-14 max-w-3xl">
          <BrushHeading as="h2" className="text-3xl sm:text-4xl">
            {t('firstTime.faqTitle')}
          </BrushHeading>
          <div className="mt-6 grid gap-3">
            {(data?.faq ?? []).map((item, i) => (
              <details key={item.id ?? i} className="card group px-6 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {item.question}
                  <span
                    aria-hidden="true"
                    className="font-heading text-2xl text-blue-dark transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 whitespace-pre-line text-ink-soft">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/schedule" className="btn-primary">
          {t('firstTime.scheduleCta')}
        </Link>
        <Link href="/contacts" className="btn-outline">
          {t('firstTime.contactsCta')}
        </Link>
      </div>
    </div>
  )
}
