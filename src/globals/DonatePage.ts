import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const DonatePage: GlobalConfig = {
  slug: 'donate-page',
  label: 'Пожертвования',
  admin: {
    group: 'Страницы',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'purpose',
      type: 'richText',
      label: 'На что идут средства',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'kaspiNumber',
          type: 'text',
          label: 'Номер Kaspi',
        },
        {
          name: 'kaspiLink',
          type: 'text',
          label: 'Ссылка Kaspi',
          admin: {
            description: 'Ссылка на перевод из приложения Kaspi (если есть).',
          },
        },
      ],
    },
    {
      name: 'qrCode',
      type: 'upload',
      relationTo: 'media',
      label: 'QR-код для пожертвования',
    },
    {
      name: 'requisites',
      type: 'array',
      label: 'Банковские реквизиты',
      labels: {
        singular: 'Реквизит',
        plural: 'Реквизиты',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              label: 'Название',
              required: true,
              admin: {
                description: 'Например: «БИН», «ИИК», «Банк», «Получатель».',
              },
            },
            {
              name: 'value',
              type: 'text',
              label: 'Значение',
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: 'note',
      type: 'textarea',
      label: 'Примечание',
      localized: true,
      admin: {
        description: 'Например: «В назначении платежа укажите "Добровольное пожертвование"».',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
