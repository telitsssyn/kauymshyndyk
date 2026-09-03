import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'

import { getPathname } from '@/i18n/navigation'
import type { Media } from '@/payload-types'

import { getHomePage, getSettings } from './queries'

type Href = Parameters<typeof getPathname>[0]['href']

type OgImage = { url: string; width?: number; height?: number; alt?: string }

type Options = {
  /** Канонический путь страницы из i18n/routing, например '/schedule' */
  href: Href
  /** Заголовок без названия церкви — его добавит шаблон из layout */
  title?: string
  description?: string
  /** Картинка превью: изображение из админки или готовый адрес. Без неё берётся фото из шапки главной */
  image?: Media | number | string | null
  type?: 'website' | 'article' | 'video.other'
}

// Логотип — последняя подстраховка: он есть всегда, даже на пустой базе
const FALLBACK_IMAGE: OgImage = { url: '/logo.png' }

/**
 * Картинка для превью ссылки. Своя у страницы, иначе фото из шапки главной:
 * пустое превью в мессенджере выглядит как битая ссылка.
 */
export async function resolveOgImages(image?: Options['image']): Promise<OgImage[]> {
  if (typeof image === 'string') return [{ url: image }]

  let media = typeof image === 'object' ? image : null
  if (!media) {
    const home = await getHomePage()
    media = typeof home?.heroImage === 'object' ? home.heroImage : null
  }
  if (!media?.url) return [FALLBACK_IMAGE]

  const hero = media.sizes?.hero
  return [
    {
      url: hero?.url ?? media.url,
      width: (hero?.url ? hero.width : media.width) ?? undefined,
      height: (hero?.url ? hero.height : media.height) ?? undefined,
      alt: media.alt,
    },
  ]
}

/**
 * Мета страницы вместе с Open Graph — тем, из чего WhatsApp, Telegram и соцсети
 * рисуют превью ссылки. Заполнять его приходится на каждой странице: Next не
 * подставляет в og:title заголовок страницы, а наследует весь блок openGraph
 * от layout целиком, поэтому иначе во всех превью стоял бы заголовок главной.
 */
export async function buildMetadata({
  href,
  title,
  description,
  image,
  type = 'website',
}: Options): Promise<Metadata> {
  const [settings, locale, t] = await Promise.all([
    getSettings(),
    getLocale(),
    getTranslations('meta'),
  ])
  const churchName = settings?.churchName ?? ''
  const pathname = getPathname({ locale, href })
  const text = description || settings?.tagline || t('defaultDescription')

  return {
    // Без заголовка ключ не выставляем вовсе: явный undefined затирает
    // title.default из layout, и страница осталась бы без <title>
    ...(title ? { title } : {}),
    description: text,
    alternates: { canonical: pathname },
    openGraph: {
      type,
      url: pathname,
      siteName: churchName,
      locale,
      title: title ? `${title} — ${churchName}` : t('homeTitle', { churchName }),
      description: text,
      images: await resolveOgImages(image),
    },
  }
}
