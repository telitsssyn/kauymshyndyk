import type { CollectionConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const Ministers: CollectionConfig = {
  slug: 'ministers',
  labels: {
    singular: 'Служитель',
    plural: 'Служители',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Контент',
    description: 'Команда церкви на странице «О церкви». Порядок можно менять перетаскиванием.',
  },
  access: {
    read: () => true,
  },
  orderable: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя и фамилия',
      required: true,
    },
    {
      name: 'role',
      type: 'text',
      label: 'Служение',
      required: true,
      localized: true,
      admin: {
        description: 'Например: «Пастор», «Лидер прославления», «Молодёжный служитель».',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото',
    },
    {
      name: 'bio',
      type: 'richText',
      label: 'Пара слов о служителе',
      localized: true,
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
}
