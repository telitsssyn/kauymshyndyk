import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Настройки сайта',
  admin: {
    group: 'Настройки',
    description: 'Название, контакты, соцсети и карта. Эти данные показываются на всех страницах.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'churchName',
      type: 'text',
      label: 'Название церкви',
      required: true,
      localized: true,
    },
    {
      name: 'tagline',
      type: 'textarea',
      label: 'Краткое описание',
      localized: true,
      admin: {
        description: 'Одно-два предложения о церкви. Показывается на главной и в поисковиках.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'phone',
          type: 'text',
          label: 'Телефон',
        },
        {
          name: 'email',
          type: 'text',
          label: 'Электронная почта',
        },
      ],
    },
    {
      name: 'address',
      type: 'text',
      label: 'Адрес',
      localized: true,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'instagram',
          type: 'text',
          label: 'Ссылка на Instagram',
        },
        {
          name: 'youtube',
          type: 'text',
          label: 'Ссылка на YouTube',
        },
      ],
    },
    {
      name: 'mapEmbedUrl',
      type: 'textarea',
      label: 'Ссылка карты 2ГИС для встраивания',
      admin: {
        description:
          'Откройте 2gis.kz, найдите здание церкви, нажмите «Поделиться» → «Виджет» и скопируйте адрес из кода (значение src="...").',
      },
    },
    {
      name: 'mapLink',
      type: 'text',
      label: 'Ссылка на точку в 2ГИС (маршрут)',
      admin: {
        description:
          'Откройте 2gis.kz, найдите здание церкви, нажмите «Поделиться» → «Скопировать ссылку». Используется для кнопки «Как добраться».',
      },
    },
    {
      name: 'defaultOgImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Картинка для соцсетей по умолчанию',
      admin: {
        description: 'Показывается при отправке ссылки на сайт в мессенджерах, если у страницы нет своей обложки.',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
