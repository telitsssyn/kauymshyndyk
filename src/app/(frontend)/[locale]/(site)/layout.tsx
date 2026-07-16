import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { getSettings } from '@/lib/queries'

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, t] = await Promise.all([getSettings(), getTranslations('common')])

  return (
    <>
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
    </>
  )
}
