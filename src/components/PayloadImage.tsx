import type { Media } from '@/payload-types'

type Props = {
  media: Media | number | null | undefined
  /** Атрибут sizes для адаптивной загрузки, например "(min-width: 768px) 50vw, 100vw" */
  sizes?: string
  className?: string
  priority?: boolean
}

// Отдаём размеры, сгенерированные Payload (webp), без оптимизатора Next —
// чтобы не упираться в лимиты трансформаций на бесплатном тарифе Vercel.
export function PayloadImage({ media, sizes = '100vw', className, priority }: Props) {
  if (!media || typeof media === 'number' || !media.url) return null

  const entries: string[] = []
  const s = media.sizes
  if (s?.thumbnail?.url && s.thumbnail.width) entries.push(`${s.thumbnail.url} ${s.thumbnail.width}w`)
  if (s?.card?.url && s.card.width) entries.push(`${s.card.url} ${s.card.width}w`)
  if (s?.hero?.url && s.hero.width) entries.push(`${s.hero.url} ${s.hero.width}w`)
  if (media.width) entries.push(`${media.url} ${media.width}w`)

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      srcSet={entries.length > 0 ? entries.join(', ') : undefined}
      sizes={entries.length > 0 ? sizes : undefined}
      alt={media.alt}
      width={media.width ?? undefined}
      height={media.height ?? undefined}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  )
}
