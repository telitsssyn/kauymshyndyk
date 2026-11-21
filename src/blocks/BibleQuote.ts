import type { Block } from 'payload'

export const BibleQuoteBlock: Block = {
  slug: 'bibleQuote',
  labels: {
    singular: 'Цитата из Библии',
    plural: 'Цитаты из Библии',
  },
  fields: [
    {
      name: 'text',
      type: 'textarea',
      label: 'Текст стиха',
      required: true,
      admin: {
        description: 'Вставьте текст вместе с кавычками, как в материале урока.',
      },
    },
    {
      name: 'reference',
      type: 'text',
      label: 'Ссылка',
      required: true,
      admin: {
        description:
          'Например: Матфея 22:37–40 или 1 Иоанна 4:19. На сайте ссылка сама откроет эту главу в разделе «Библия».',
      },
    },
  ],
}
