import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const MinistriesPage: GlobalConfig = {
  slug: 'ministries-page',
  label: 'Служения',
  admin: {
    group: 'Страницы',
    description:
      'Страница о крещении, бракосочетании, погребении и молитвенной поддержке: что нужно и как договориться.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'intro',
      type: 'richText',
      label: 'Вступление',
      localized: true,
    },
    {
      name: 'items',
      type: 'array',
      label: 'Служения',
      labels: {
        singular: 'Служение',
        plural: 'Служения',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Название',
          required: true,
          localized: true,
          admin: {
            description: 'Например: «Водное крещение», «Бракосочетание», «Молитва о нуждах».',
          },
        },
        {
          name: 'description',
          type: 'richText',
          label: 'Описание: что это и что нужно',
          required: true,
          localized: true,
        },
        {
          name: 'howToArrange',
          type: 'textarea',
          label: 'Как договориться',
          localized: true,
        },
      ],
    },
    {
      name: 'contactNote',
      type: 'textarea',
      label: 'Общий контакт для вопросов',
      localized: true,
      admin: {
        description: 'Например: «Позвоните или напишите нам — поможем и подскажем».',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
