import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { MapEmbed } from '@/components/MapEmbed'
import { SocialLinks } from '@/components/SocialLinks'
import { getSettings } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contacts')
  return { title: t('title') }
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, t] = await Promise.all([getSettings(), getTranslations()])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Church',
    name: settings?.churchName,
    address: settings?.address || undefined,
    telephone: settings?.phone || undefined,
    email: settings?.email || undefined,
    url: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
    sameAs: [settings?.instagram, settings?.youtube].filter(Boolean),
  }

  return (
    <div className="container-site py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('contacts.title')}
      </BrushHeading>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="card p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl">{t('contacts.getInTouch')}</h2>
          <dl className="mt-6 grid gap-5 text-lg">
            {settings?.address ? (
              <div>
                <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t('common.address')}
                </dt>
                <dd className="mt-1">{settings.address}</dd>
              </div>
            ) : null}
            {settings?.phone ? (
              <div>
                <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t('common.phone')}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}
                    className="whitespace-nowrap font-semibold text-teal-dark underline underline-offset-4"
                  >
                    {settings.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {settings?.email ? (
              <div>
                <dt className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-soft">
                  {t('common.email')}
                </dt>
                <dd className="mt-1">
                  <a
                    href={`mailto:${settings.email}`}
                    className="font-semibold text-teal-dark underline underline-offset-4"
                  >
                    {settings.email}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="card p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl">{t('contacts.socialTitle')}</h2>
          <SocialLinks settings={settings} className="mt-6" />
          <p className="mt-6 text-lg text-ink-soft">{t('contacts.visitUs')}</p>
        </section>
      </div>

      {settings?.mapEmbedUrl ? (
        <section className="mt-10">
          <h2 className="text-2xl sm:text-3xl">{t('contacts.mapTitle')}</h2>
          <div className="mt-6">
            <MapEmbed src={settings.mapEmbedUrl} title={t('contacts.mapTitle')} />
          </div>
        </section>
      ) : null}
    </div>
  )
}
