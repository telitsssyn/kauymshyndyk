import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { CopyButton } from '@/components/CopyButton'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { getDonatePage } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('donate')
  return { title: t('title') }
}

export default async function DonatePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [data, t] = await Promise.all([getDonatePage(), getTranslations('donate')])

  const hasKaspi = Boolean(data?.kaspiNumber || data?.kaspiLink)

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('title')}
      </BrushHeading>

      {data?.purpose ? (
        <div className="mt-6 max-w-3xl">
          <RichText data={data.purpose} />
        </div>
      ) : null}

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {hasKaspi ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl">{t('kaspiTitle')}</h2>
            {data?.kaspiNumber ? (
              <div className="mt-5">
                <p className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t('kaspiNumber')}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <span className="font-heading text-2xl font-bold">{data.kaspiNumber}</span>
                  <CopyButton value={data.kaspiNumber} />
                </div>
              </div>
            ) : null}
            {data?.kaspiLink ? (
              <a
                href={data.kaspiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-6"
              >
                {t('kaspiButton')}
              </a>
            ) : null}
            {data?.qrCode && typeof data.qrCode === 'object' ? (
              <div className="mt-6">
                <p className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t('qrTitle')}
                </p>
                <PayloadImage
                  media={data.qrCode}
                  sizes="256px"
                  className="mt-3 h-56 w-56 rounded-2xl bg-white object-contain p-2 ring-1 ring-ink/10"
                />
              </div>
            ) : null}
          </section>
        ) : null}

        {(data?.requisites ?? []).length > 0 ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl">{t('requisitesTitle')}</h2>
            <dl className="mt-5 grid gap-4">
              {(data?.requisites ?? []).map((req, i) => (
                <div key={req.id ?? i} className="grid gap-1 border-b border-ink/10 pb-3 last:border-0">
                  <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                    {req.label}
                  </dt>
                  <dd className="flex flex-wrap items-center gap-3 text-lg font-semibold break-all">
                    {req.value}
                    <CopyButton value={req.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </div>

      {data?.note ? (
        <p className="mt-8 max-w-3xl whitespace-pre-line rounded-2xl bg-mint-soft p-5 text-lg">
          {data.note}
        </p>
      ) : null}

      <p className="mt-10 text-xl font-semibold text-teal-dark">{t('thankYou')}</p>
    </div>
  )
}
