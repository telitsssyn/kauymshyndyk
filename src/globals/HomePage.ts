import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  label: 'Главная страница',
  admin: {
    group: 'Страницы',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroSubtitle',
      type: 'textarea',
      label: 'Подзаголовок в шапке',
      localized: true,
      admin: {
        description: 'Короткая приветственная фраза под названием церкви.',
      },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото в шапке',
    },
    {
      name: 'aboutText',
      type: 'richText',
      label: 'Блок «О нас»',
      localized: true,
    },
    {
      name: 'aboutImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото к блоку «О нас»',
    },
    {
      name: 'firstVisitTeaser',
      type: 'textarea',
      label: 'Тизер «Я здесь впервые»',
      localized: true,
      admin: {
        description: 'Приглашение для новичков со ссылкой на страницу «Я здесь впервые».',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
