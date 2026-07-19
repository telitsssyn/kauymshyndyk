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
      name: 'qrCode',
      type: 'upload',
      relationTo: 'media',
      label: 'QR-код для пожертвования',
      admin: {
        description:
          'Картинка с QR-кодом (например, Halyk QR). Показывается крупно в левой карточке.',
      },
    },
    {
      name: 'qrCaption',
      type: 'textarea',
      label: 'Подпись под QR-кодом',
      localized: true,
      admin: {
        description:
          'Например, название получателя и адрес. Каждая строка подписи — с новой строки.',
      },
    },
    {
      name: 'instructionTitle',
      type: 'text',
      label: 'Заголовок инструкции',
      localized: true,
      admin: {
        description: 'Например: «Пожертвование через приложение Halyk Bank».',
      },
    },
    {
      name: 'steps',
      type: 'array',
      label: 'Шаги инструкции',
      labels: {
        singular: 'Шаг',
        plural: 'Шаги',
      },
      admin: {
        description: 'Показываются пронумерованным списком в правой карточке.',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          label: 'Текст шага',
          required: true,
          localized: true,
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
