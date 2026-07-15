import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

import { revalidateSite } from '@/lib/revalidate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Изображение',
    plural: 'Изображения',
  },
  admin: {
    group: 'Контент',
    description: 'Все фотографии и картинки сайта. Загрузите файл и заполните описание.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Описание изображения',
      required: true,
      admin: {
        description:
          'Короткое описание того, что на фото (например, «Воскресное служение в зале»). Нужно для незрячих посетителей и поисковиков.',
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'card',
        width: 768,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
      {
        name: 'hero',
        width: 1600,
        formatOptions: { format: 'webp', options: { quality: 82 } },
      },
    ],
  },
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
}
