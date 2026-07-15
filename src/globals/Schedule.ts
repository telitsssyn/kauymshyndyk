import type { GlobalConfig } from 'payload'

import { revalidateSite } from '@/lib/revalidate'

const timeField = {
  name: 'time',
  type: 'text' as const,
  label: 'Время',
  required: true,
  admin: {
    description: 'В формате ЧЧ:ММ, например 11:00',
  },
  validate: (value: string | null | undefined) => {
    if (!value) return 'Укажите время'
    return /^([01]?\d|2[0-3]):[0-5]\d$/.test(value)
      ? true
      : 'Время должно быть в формате ЧЧ:ММ, например 11:00'
  },
}

export const Schedule: GlobalConfig = {
  slug: 'schedule',
  label: 'Расписание',
  admin: {
    group: 'Страницы',
    description:
      'Типовая неделя богослужений + отдельные праздничные служения и объявление об изменениях.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'announcement',
      type: 'textarea',
      label: 'Объявление об изменениях',
      localized: true,
      admin: {
        description:
          'Показывается заметной плашкой на главной и на странице расписания. Оставьте пустым, если изменений нет.',
      },
    },
    {
      name: 'regularServices',
      type: 'array',
      label: 'Типовая неделя',
      labels: {
        singular: 'Служение',
        plural: 'Служения',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'day',
              type: 'select',
              label: 'День недели',
              required: true,
              options: [
                { label: 'Понедельник', value: 'monday' },
                { label: 'Вторник', value: 'tuesday' },
                { label: 'Среда', value: 'wednesday' },
                { label: 'Четверг', value: 'thursday' },
                { label: 'Пятница', value: 'friday' },
                { label: 'Суббота', value: 'saturday' },
                { label: 'Воскресенье', value: 'sunday' },
              ],
            },
            timeField,
          ],
        },
        {
          name: 'title',
          type: 'text',
          label: 'Название служения',
          required: true,
          localized: true,
        },
        {
          name: 'note',
          type: 'text',
          label: 'Примечание',
          localized: true,
        },
      ],
    },
    {
      name: 'specialServices',
      type: 'array',
      label: 'Праздничные и особые служения',
      labels: {
        singular: 'Служение',
        plural: 'Служения',
      },
      admin: {
        description: 'Разовые служения с конкретной датой. Прошедшие даты на сайте не показываются.',
      },
      fields: [
        {
          name: 'date',
          type: 'date',
          label: 'Дата и время',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd.MM.yyyy HH:mm' },
          },
        },
        {
          name: 'title',
          type: 'text',
          label: 'Название служения',
          required: true,
          localized: true,
        },
        {
          name: 'note',
          type: 'text',
          label: 'Примечание',
          localized: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [() => revalidateSite()],
  },
}
