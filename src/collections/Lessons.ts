import type { CollectionConfig, NumberFieldSingleValidation } from 'payload'
import {
  BlocksFeature,
  EXPERIMENTAL_TableFeature,
  HeadingFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { BibleQuoteBlock } from '@/blocks/BibleQuote'
import { YouTubeBlock } from '@/blocks/YouTube'
import { revalidateContent } from '@/lib/revalidate'

// Номер урока — его адрес на сайте (/kursy/<курс>/<номер>), поэтому
// в пределах одного курса он не должен повторяться.
const validateNumber: NumberFieldSingleValidation = async (value, { data, id, req }) => {
  if (value === null || value === undefined) return 'Укажите номер урока'
  if (!Number.isInteger(value) || value < 0) return 'Номер — целое число: 0, 1, 2…'

  const course = (data as { course?: number | { id: number } | null })?.course
  const courseId = typeof course === 'object' && course ? course.id : course
  if (!courseId || !req?.payload) return true

  const existing = await req.payload.find({
    collection: 'lessons',
    where: {
      and: [
        { course: { equals: courseId } },
        { number: { equals: value } },
        ...(id ? [{ id: { not_equals: id } }] : []),
      ],
    },
    limit: 1,
    depth: 0,
    draft: true,
    req,
  })
  return existing.docs.length === 0 ? true : `В этом курсе уже есть урок №${value}`
}

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: {
    singular: 'Урок',
    plural: 'Уроки',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['number', 'title', 'course', '_status'],
    group: 'Курсы',
    description:
      'Урок можно сохранять как черновик и дописывать постепенно — на сайте он появится, когда нажмёте «Опубликовать».',
  },
  defaultSort: 'number',
  access: {
    read: () => true,
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'course',
          type: 'relationship',
          relationTo: 'courses',
          label: 'Курс',
          required: true,
          admin: { width: '70%' },
        },
        {
          name: 'number',
          type: 'number',
          label: 'Номер урока',
          required: true,
          min: 0,
          validate: validateNumber,
          admin: {
            width: '30%',
            description: 'Как в названии файла: 0 — введение, дальше 1, 2, 3…',
          },
        },
      ],
    },
    {
      name: 'title',
      type: 'text',
      label: 'Тема',
      required: true,
      localized: true,
      admin: {
        description: 'Коротко, одним-двумя словами: «Грех», «Любовь Бога».',
      },
    },
    {
      name: 'subtitle',
      type: 'text',
      label: 'Подзаголовок',
      localized: true,
      admin: {
        description: 'Вторая часть заголовка: «Что ломает отношения».',
      },
    },
    {
      name: 'youtubeUrl',
      type: 'text',
      label: 'Ссылка на видео YouTube',
      admin: {
        description:
          'Видео показывается вверху урока. Можно оставить пустой, пока записи нет, — тогда загрузите картинку ниже.',
      },
      validate: (value: string | null | undefined) => {
        if (!value) return true
        return /(?:youtube\.com|youtu\.be)\//.test(value)
          ? true
          : 'Ссылка должна вести на YouTube (youtube.com или youtu.be)'
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Картинка (пока нет видео)',
      admin: {
        description:
          'Показывается вместо видео, пока не заполнена ссылка на YouTube. Когда вставите ссылку — сайт сам переключится на видео.',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Текст урока',
      required: true,
      localized: true,
      admin: {
        description:
          'Подзаголовки разделов — «Заголовок 2». Цитаты из Библии вставляйте блоком «Цитата из Библии» (кнопка «+» или «/»).',
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // Заголовок урока уже стоит вверху страницы, в тексте — только разделы
          ...defaultFeatures.filter((feature) => feature.key !== 'heading'),
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3'] }),
          BlocksFeature({ blocks: [BibleQuoteBlock, YouTubeBlock] }),
          EXPERIMENTAL_TableFeature(),
        ],
      }),
    },
    {
      name: 'homework',
      type: 'richText',
      label: 'Задание на неделю',
      localized: true,
      admin: {
        description: 'Показывается после текста урока в отдельной рамке. Удобно списком.',
      },
      editor: lexicalEditor({
        features: ({ defaultFeatures }) =>
          defaultFeatures.filter((feature) => feature.key !== 'heading'),
      }),
    },
  ],
  hooks: {
    afterChange: [() => revalidateContent()],
    afterDelete: [() => revalidateContent()],
  },
}
