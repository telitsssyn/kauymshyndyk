import type { Metadata } from 'next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Inter, Oswald } from 'next/font/google'
import { notFound } from 'next/navigation'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { routing } from '@/i18n/routing'
import { getSettings } from '@/lib/queries'

import '../styles.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  const t = await getTranslations('meta')
  const churchName = settings?.churchName ?? ''

  return {
    metadataBase: process.env.NEXT_PUBLIC_SERVER_URL
      ? new URL(process.env.NEXT_PUBLIC_SERVER_URL)
      : undefined,
    title: {
      default: t('homeTitle', { churchName }),
      template: `%s — ${churchName}`,
    },
    description: settings?.tagline || t('defaultDescription'),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }
  setRequestLocale(locale)

  const settings = await getSettings()
  const t = await getTranslations('common')

  return (
    <html lang={locale} className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
          >
            {t('skipToContent')}
          </a>
          <Header churchName={settings?.churchName ?? ''} />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer settings={settings} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
