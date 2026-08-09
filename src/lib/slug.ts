import type { CollectionSlug, FieldHook, Payload } from 'payload'

const translitMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // казахские буквы — на будущее для локали kk
  ә: 'a', ғ: 'g', қ: 'q', ң: 'n', ө: 'o', ұ: 'u', ү: 'u', һ: 'h', і: 'i',
}

// Запасная основа: заголовок совсем без букв и цифр (например, одни эмодзи)
// даёт пустой слаг, а пустой адрес страницы не открывается.
const FALLBACK_SLUG = 'zapis'

export const slugify = (input: string): string =>
  input
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

// Слаг уникален в пределах коллекции: одинаковые названия в разные годы
// («Рождественское служение») иначе роняют сохранение ошибкой уникальности.
// Подбираем ближайший свободный: novost, novost-2, novost-3…
const findFreeSlug = async (
  payload: Payload,
  collection: CollectionSlug,
  base: string,
  currentId: string | number | undefined,
): Promise<string> => {
  for (let suffix = 1; suffix < 100; suffix++) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`
    const taken = { slug: { equals: candidate } }
    const existing = await payload.find({
      collection,
      where:
        currentId === undefined
          ? taken
          : { and: [taken, { id: { not_equals: currentId } }] },
      limit: 1,
      depth: 0,
    })
    if (existing.docs.length === 0) return candidate
  }
  // Сотня одинаковых названий — до такого не дойдёт, но пустую строку не вернём
  return base
}

export const formatSlugHook: FieldHook = async ({
  collection,
  data,
  originalDoc,
  req,
  value,
}) => {
  const source =
    typeof value === 'string' && value.trim() !== ''
      ? value
      : ((data?.title as string | undefined) ?? '')
  if (!source) return value

  const base = slugify(source) || FALLBACK_SLUG

  // Вне контекста коллекции (например, в юнит-тестах) проверять занятость негде
  if (!collection || !req?.payload) return base

  const currentId = originalDoc?.id ?? data?.id
  return findFreeSlug(req.payload, collection.slug as CollectionSlug, base, currentId)
}
