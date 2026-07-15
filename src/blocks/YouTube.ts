import type { Block } from 'payload'

export const YouTubeBlock: Block = {
  slug: 'youtube',
  labels: {
    singular: 'Видео YouTube',
    plural: 'Видео YouTube',
  },
  fields: [
    {
      name: 'url',
      type: 'text',
      label: 'Ссылка на видео',
      required: true,
      admin: {
        description:
          'Скопируйте адрес видео из браузера, например: https://www.youtube.com/watch?v=XXXXXXXX или https://youtu.be/XXXXXXXX',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Укажите ссылку на видео'
        return /(?:youtube\.com|youtu\.be)\//.test(value)
          ? true
          : 'Ссылка должна вести на YouTube (youtube.com или youtu.be)'
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Подпись под видео',
    },
  ],
}
