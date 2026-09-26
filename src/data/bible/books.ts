import type { BibleBookMeta } from './types'

export const BIBLE_BOOKS: BibleBookMeta[] = [
  // Ветхий Завет (Пятикнижие и исторические книги)
  { slug: 'genesis', name: 'Бытие', shortName: 'Быт', testament: 'old', chaptersCount: 50, availableChapters: [1, 2] },
  { slug: 'exodus', name: 'Исход', shortName: 'Исх', testament: 'old', chaptersCount: 40, availableChapters: [] },
  { slug: 'leviticus', name: 'Левит', shortName: 'Лев', testament: 'old', chaptersCount: 27, availableChapters: [] },
  { slug: 'numbers', name: 'Числа', shortName: 'Чис', testament: 'old', chaptersCount: 36, availableChapters: [] },
  { slug: 'deuteronomy', name: 'Второзаконие', shortName: 'Втор', testament: 'old', chaptersCount: 34, availableChapters: [] },
  { slug: 'psalms', name: 'Псалтирь', shortName: 'Пс', testament: 'old', chaptersCount: 150, availableChapters: [] },
  { slug: 'proverbs', name: 'Притчи', shortName: 'Притч', testament: 'old', chaptersCount: 31, availableChapters: [] },
  { slug: 'isaiah', name: 'Исаия', shortName: 'Ис', testament: 'old', chaptersCount: 66, availableChapters: [] },

  // Новый Завет (Евангелия и послания)
  { slug: 'matthew', name: 'Евангелие от Матфея', shortName: 'Мф', testament: 'new', chaptersCount: 28, availableChapters: [] },
  { slug: 'mark', name: 'Евангелие от Марка', shortName: 'Мк', testament: 'new', chaptersCount: 16, availableChapters: [] },
  { slug: 'luke', name: 'Евангелие от Луки', shortName: 'Лк', testament: 'new', chaptersCount: 24, availableChapters: [] },
  { slug: 'john', name: 'Евангелие от Иоанна', shortName: 'Ин', testament: 'new', chaptersCount: 21, availableChapters: [] },
  { slug: 'acts', name: 'Деяния Апостолов', shortName: 'Деян', testament: 'new', chaptersCount: 28, availableChapters: [] },
  { slug: 'romans', name: 'Послание к Римлянам', shortName: 'Рим', testament: 'new', chaptersCount: 16, availableChapters: [] },
  { slug: '1-corinthians', name: '1-е Коринфянам', shortName: '1Кор', testament: 'new', chaptersCount: 16, availableChapters: [] },
  { slug: 'revelation', name: 'Откровение', shortName: 'Откр', testament: 'new', chaptersCount: 22, availableChapters: [] },
]
