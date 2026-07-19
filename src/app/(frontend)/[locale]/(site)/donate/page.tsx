import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
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

  const qr = data?.qrCode && typeof data.qrCode === 'object' ? data.qrCode : null
  const steps = data?.steps ?? []
  const hasQrCard = Boolean(qr || data?.qrCaption)
  const hasStepsCard = Boolean(data?.instructionTitle || steps.length > 0)

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

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {hasQrCard ? (
          <section className="card flex flex-col items-center p-6 text-center sm:p-8">
            <h2 className="text-2xl sm:text-3xl">{t('qrTitle')}</h2>
            {qr ? (
              <PayloadImage
                media={qr}
                sizes="320px"
                className="mt-6 w-64 rounded-2xl bg-white object-contain p-2 ring-1 ring-ink/10 sm:w-72"
              />
            ) : null}
            {data?.qrCaption ? (
              <p className="mt-6 whitespace-pre-line font-heading text-lg font-semibold">
                {data.qrCaption}
              </p>
            ) : null}
          </section>
        ) : null}

        {hasStepsCard ? (
          <section className="card p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl">{data?.instructionTitle || t('howTitle')}</h2>
            <ol className="mt-6 space-y-4">
              {steps.map((step, i) => (
                <li key={step.id ?? i} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ice font-heading text-lg font-bold text-blue-dark"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 text-lg">{step.text}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      {data?.note ? (
        <p className="mt-8 max-w-3xl whitespace-pre-line rounded-2xl bg-ice-soft p-5 text-lg">
          {data.note}
        </p>
      ) : null}

      <p className="mt-10 text-xl font-semibold text-blue-dark">{t('thankYou')}</p>
    </div>
  )
}
