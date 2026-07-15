import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Всё, кроме админки, API Payload, служебных путей Next и файлов
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
