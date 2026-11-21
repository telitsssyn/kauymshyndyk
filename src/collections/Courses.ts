import type { CollectionConfig } from 'payload'

import { revalidateContent } from '@/lib/revalidate'
import { formatSlugHook } from '@/lib/slug'

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: 'Курс',
    plural: 'Курсы',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Курсы',
    description:
      'Курс — это набор уроков. Сами уроки добавляются в разделе «Уроки», там же выбирается курс.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название',
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
      name: 'description',
      type: 'textarea',
      label: 'Описание',
      localized: true,
      admin: {
        description: '2–3 предложения: о чём курс и для кого. Показывается в карточке и на странице курса.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Обложка',
      admin: {
        description: 'Необязательно. Горизонтальная картинка, лучше 16:9.',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateContent()],
    afterDelete: [() => revalidateContent()],
  },
}
