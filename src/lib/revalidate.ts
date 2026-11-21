import { revalidatePath } from 'next/cache.js'

// Пути здесь — не адреса страниц, а маршруты из папки src/app (вместе с группами
// в скобках): так Next помечает готовые страницы в кэше.
const SITE = '/(frontend)/[locale]/(site)'

// Без type путь — обычный адрес, а не маршрут из папки app
type Target = { path: string; type?: 'page' | 'layout' }

/**
 * Всё, что зависит от контента из админки. Тип layout сбрасывает раздел целиком,
 * вместе с вложенными страницами (лента новостей и каждая новость).
 *
 * Библии здесь нет намеренно: 1189 глав от новостей и расписания не зависят,
 * и пересобирать их после каждого сохранения в админке незачем.
 *
 * Новый раздел сайта нужно добавить сюда — за этим следит tests/unit/revalidate.spec.ts.
 */
export const CONTENT_TARGETS: Target[] = [
  { path: SITE, type: 'page' }, // главная
  { path: `${SITE}/about`, type: 'layout' },
  { path: `${SITE}/contacts`, type: 'layout' },
  { path: `${SITE}/courses`, type: 'layout' },
  { path: `${SITE}/donate`, type: 'layout' },
  { path: `${SITE}/first-time`, type: 'layout' },
  { path: `${SITE}/news`, type: 'layout' },
  { path: `${SITE}/privacy`, type: 'layout' },
  { path: `${SITE}/schedule`, type: 'layout' },
  { path: `${SITE}/sermons`, type: 'layout' },
  { path: `${SITE}/terms`, type: 'layout' },
  { path: `${SITE}/youth`, type: 'layout' },
  { path: '/(frontend)/[locale]/links', type: 'layout' },
  { path: '/sitemap.xml' },
]

// Вне контекста Next (например, при запуске seed-скрипта) revalidatePath недоступен.
const safely = (run: () => void): void => {
  try {
    run()
  } catch {
    // сбрасывать нечего
  }
}

/**
 * Изменился контент: новость, проповедь, расписание, тексты страниц, фотографии.
 * Контент-менеджер сохраняет запись и сразу видит результат на сайте.
 */
export const revalidateContent = (): void => {
  safely(() => {
    for (const { path, type } of CONTENT_TARGETS) revalidatePath(path, type)
  })
}

/**
 * Изменились настройки сайта: название и контакты стоят в шапке, подвале и
 * мета-тегах каждой страницы, включая главы Библии, — сбрасываем кэш целиком.
 */
export const revalidateSite = (): void => {
  safely(() => revalidatePath('/', 'layout'))
}
