import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

export default function NotFoundPage() {
  const t = useTranslations('notFound')

  return (
    <div className="container-site flex flex-col items-start gap-5 py-20">
      <p className="chip">404</p>
      <h1 className="text-4xl sm:text-5xl">{t('title')}</h1>
      <p className="text-xl text-ink-soft">{t('text')}</p>
      <Link href="/" className="btn-primary mt-2">
        {t('goHome')}
      </Link>
    </div>
  )
}
