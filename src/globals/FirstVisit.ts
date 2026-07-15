import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const FirstVisit: GlobalConfig = {
  slug: 'first-visit',
  label: '«Я здесь впервые»',
  admin: {
    group: 'Страницы',
    description: 'Страница для тех, кто собирается прийти в первый раз. Тёплый, дружелюбный тон.',
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
      name: 'sections',
      type: 'array',
      label: 'Разделы',
      labels: {
        singular: 'Раздел',
        plural: 'Разделы',
      },
      admin: {
        description: 'Например: «Как одеться», «Что происходит на служении», «Где вход».',
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
          name: 'content',
          type: 'richText',
          label: 'Текст',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'faq',
      type: 'array',
      label: 'Частые вопросы',
      labels: {
        singular: 'Вопрос',
        plural: 'Вопросы',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          label: 'Вопрос',
          required: true,
          localized: true,
        },
        {
          name: 'answer',
          type: 'textarea',
          label: 'Ответ',
          required: true,
          localized: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
