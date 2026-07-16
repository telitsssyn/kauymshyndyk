import { defineRouting } from 'next-intl/routing'

// Внутренние (канонические) пути — ключи; публичные адреса для каждой локали — значения.
// При добавлении казахского/английского: добавить локаль в locales и адреса в pathnames.
export const routing = defineRouting({
  locales: ['ru'],
  defaultLocale: 'ru',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/first-time': { ru: '/vpervye' },
    '/schedule': { ru: '/raspisanie' },
    '/about': { ru: '/o-tserkvi' },
    '/ministries': { ru: '/sluzheniya' },
    '/news': { ru: '/novosti' },
    '/news/[slug]': { ru: '/novosti/[slug]' },
    '/donate': { ru: '/pozhertvovaniya' },
    '/contacts': { ru: '/kontakty' },
    '/links': { ru: '/link' },
  },
})

export type AppPathname = keyof typeof routing.pathnames
