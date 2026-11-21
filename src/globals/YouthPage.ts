import type { GlobalConfig } from 'payload'

import { revalidateContent } from '@/lib/revalidate'

export const YouthPage: GlobalConfig = {
  slug: 'youth-page',
  label: 'Молодёжь',
  admin: {
    group: 'Страницы',
    description: 'Фотография в начале страницы молодёжного служения.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото в начале страницы',
      admin: {
        description:
          'Горизонтальное фото с молодёжной встречи — показывается справа от заголовка и обрезается до пропорции 4:3. Без фото первый блок будет только с текстом.',
      },
    },
  ],
  hooks: {
    afterChange: [() => revalidateContent()],
  },
}
