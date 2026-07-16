import type { CollectionConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'
import { formatSlugHook } from '@/lib/slug'

export const Sermons: CollectionConfig = {
  slug: 'sermons',
  labels: {
    singular: 'Проповедь',
    plural: 'Проповеди',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'date', 'scripture'],
    group: 'Контент',
    description:
      'Вставьте ссылку на видео с YouTube — обложка подтянется автоматически.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название проповеди',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Адрес страницы (слаг)',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Заполняется автоматически из названия. Менять не обязательно.',
      },
      hooks: {
        beforeValidate: [formatSlugHook],
      },
    },
    {
      name: 'date',
      type: 'date',
      label: 'Дата проповеди',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
      },
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: 'Ссылка на видео YouTube',
      required: true,
      admin: {
        description:
          'Скопируйте адрес видео из браузера, например: https://www.youtube.com/watch?v=XXXXXXXX',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Укажите ссылку на видео'
        return /(?:youtube\.com|youtu\.be)\//.test(value)
          ? true
          : 'Ссылка должна вести на YouTube (youtube.com или youtu.be)'
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'scripture',
          type: 'text',
          label: 'Место Писания',
          localized: true,
          admin: {
            description: 'Например: «2Кор.3:1-18». Показывается плашкой на карточке.',
          },
        },
        {
          name: 'preacher',
          type: 'text',
          label: 'Проповедник',
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Короткое описание',
      localized: true,
      admin: {
        description: 'Пара предложений о чём проповедь (не обязательно).',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
}
