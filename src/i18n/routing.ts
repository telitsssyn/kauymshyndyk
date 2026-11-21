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
    '/youth': { ru: '/molodezh' },
    '/news': { ru: '/novosti' },
    '/news/[slug]': { ru: '/novosti/[slug]' },
    '/sermons': { ru: '/propovedi' },
    '/sermons/[slug]': { ru: '/propovedi/[slug]' },
    '/bible': { ru: '/bibliya' },
    '/bible/[book]/[chapter]': { ru: '/bibliya/[book]/[chapter]' },
    '/courses': { ru: '/kursy' },
    '/courses/[course]': { ru: '/kursy/[course]' },
    '/courses/[course]/[lesson]': { ru: '/kursy/[course]/[lesson]' },
    '/donate': { ru: '/pozhertvovaniya' },
    '/contacts': { ru: '/kontakty' },
    '/privacy': { ru: '/politika-konfidentsialnosti' },
    '/terms': { ru: '/usloviya-ispolzovaniya' },
    '/links': { ru: '/link' },
  },
})

export type AppPathname = keyof typeof routing.pathnames
