import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  label: 'О церкви',
  admin: {
    group: 'Страницы',
    description:
      'История церкви. Служители и фотогалерея добавляются в разделах «Служители» и «Фотогалерея».',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'history',
      type: 'richText',
      label: 'История церкви',
      localized: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Фото в начале страницы',
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
