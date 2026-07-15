import { revalidatePath } from 'next/cache.js'

// Сайт небольшой, поэтому при любом изменении контента сбрасываем кэш целиком:
// контент-менеджер сохраняет запись и сразу видит результат на сайте.
export const revalidateSite = (): void => {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Вне контекста Next (например, при запуске seed-скрипта) revalidatePath недоступен.
  }
}
