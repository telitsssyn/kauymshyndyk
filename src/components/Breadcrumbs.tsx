import { useTranslations } from 'next-intl'
import type { ComponentProps } from 'react'

import { Link } from '@/i18n/navigation'

type Crumb = {
  href?: ComponentProps<typeof Link>['href']
  label: string
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations('common')

  return (
    <nav aria-label={t('breadcrumbs')} className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-soft">
        {items.map((item, i) => (
          <li key={i} className="flex min-w-0 items-center gap-2">
            {i > 0 ? (
              <span aria-hidden="true" className="text-ink-soft/60">
                ›
              </span>
            ) : null}
            {item.href ? (
              <Link
                href={item.href}
                className="whitespace-nowrap font-heading font-semibold uppercase tracking-wider underline-offset-4 hover:text-blue-dark hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="truncate">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
