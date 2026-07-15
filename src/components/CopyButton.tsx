'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function CopyButton({ value }: { value: string }) {
  const t = useTranslations('donate')
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Буфер обмена недоступен (например, по http) — молча пропускаем
    }
  }

  return (
    <button type="button" onClick={copy} className="btn-outline px-4 text-sm" aria-live="polite">
      {copied ? t('copied') : t('copy')}
    </button>
  )
}
