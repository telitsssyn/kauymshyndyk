import type { CollectionConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const GalleryItems: CollectionConfig = {
  slug: 'gallery',
  labels: {
    singular: 'Фото галереи',
    plural: 'Фотогалерея',
  },
  admin: {
    useAsTitle: 'caption',
    group: 'Контент',
    description:
      'Фотографии на странице «О церкви». Порядок можно менять перетаскиванием.',
  },
  access: {
    read: () => true,
  },
  orderable: true,
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Подпись',
      localized: true,
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
}
