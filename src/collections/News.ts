import type { CollectionConfig } from 'payload'
import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'

import { YouTubeBlock } from '@/blocks/YouTube'
import { revalidateSite } from '@/lib/revalidate'
import { formatSlugHook } from '@/lib/slug'

export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: 'Новость',
    plural: 'Новости и события',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedDate', 'eventDate'],
    group: 'Контент',
    description:
      'Новости и анонсы событий. Если у новости заполнена «Дата события» — она показывается как событие.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Заголовок',
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
        description: 'Заполняется автоматически из заголовка. Менять не обязательно.',
      },
      hooks: {
        beforeValidate: [formatSlugHook],
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Дата публикации',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd.MM.yyyy' },
      },
    },
    {
      name: 'eventDate',
      type: 'date',
      label: 'Дата и время события',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd.MM.yyyy HH:mm' },
        description: 'Заполните только для анонсов: встреч, праздничных служений и т.п.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка',
      required: true,
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Короткое описание',
      localized: true,
      admin: {
        description: '1–2 предложения для карточки новости и поисковиков.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Текст',
      required: true,
      localized: true,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [YouTubeBlock] }),
        ],
      }),
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
    afterDelete: [() => revalidateSite()],
  },
}
