import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { RichText } from '@/components/RichText'
import { getMinistriesPage, getSettings } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ministries')
  return { title: t('title') }
}

export default async function MinistriesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [data, settings, t] = await Promise.all([
    getMinistriesPage(),
    getSettings(),
    getTranslations('ministries'),
  ])

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('title')}
      </BrushHeading>

      {data?.intro ? (
        <div className="mt-6 max-w-3xl">
          <RichText data={data.intro} />
        </div>
      ) : null}

      {(data?.items ?? []).length > 0 ? (
        <div className="mt-10 grid gap-6">
          {(data?.items ?? []).map((item, i) => (
            <section key={item.id ?? i} className="card p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl">{item.title}</h2>
              <div className="mt-4 max-w-3xl">
                <RichText data={item.description} />
              </div>
              {item.howToArrange ? (
                <div className="mt-6 rounded-2xl bg-mint-soft p-5">
                  <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-teal-dark">
                    {t('howToArrange')}
                  </h3>
                  <p className="mt-2 whitespace-pre-line text-lg">{item.howToArrange}</p>
                </div>
              ) : null}
            </section>
          ))}
        </div>
      ) : null}

      {data?.contactNote || settings?.phone ? (
        <section className="mt-12 rounded-3xl bg-teal-dark p-8 text-white sm:p-10">
          <h2 className="text-2xl sm:text-3xl">{t('contactTitle')}</h2>
          {data?.contactNote ? (
            <p className="mt-3 max-w-2xl text-lg text-white/90">{data.contactNote}</p>
          ) : null}
          {settings?.phone ? (
            <a
              href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
              className="btn mt-6 bg-white text-teal-dark hover:bg-mint"
            >
              {settings.phone}
            </a>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
