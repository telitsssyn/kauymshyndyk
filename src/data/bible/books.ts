import type { BibleBookMeta } from './types'

export const BIBLE_BOOKS: BibleBookMeta[] = [
  // ────────────── Ветхий Завет ──────────────

  // Пятикнижие Моисея
  { slug: 'genesis', name: 'Бытие', shortName: 'Быт', testament: 'old', chaptersCount: 50 },
  { slug: 'exodus', name: 'Исход', shortName: 'Исх', testament: 'old', chaptersCount: 40 },
  { slug: 'leviticus', name: 'Левит', shortName: 'Лев', testament: 'old', chaptersCount: 27 },
  { slug: 'numbers', name: 'Числа', shortName: 'Чис', testament: 'old', chaptersCount: 36 },
  { slug: 'deuteronomy', name: 'Второзаконие', shortName: 'Втор', testament: 'old', chaptersCount: 34 },

  // Исторические книги
  { slug: 'joshua', name: 'Иисус Навин', shortName: 'Нав', testament: 'old', chaptersCount: 24 },
  { slug: 'judges', name: 'Книга Судей', shortName: 'Суд', testament: 'old', chaptersCount: 21 },
  { slug: 'ruth', name: 'Руфь', shortName: 'Руфь', testament: 'old', chaptersCount: 4 },
  { slug: '1-samuel', name: '1 Царств', shortName: '1Цар', testament: 'old', chaptersCount: 31 },
  { slug: '2-samuel', name: '2 Царств', shortName: '2Цар', testament: 'old', chaptersCount: 24 },
  { slug: '1-kings', name: '3 Царств', shortName: '3Цар', testament: 'old', chaptersCount: 22 },
  { slug: '2-kings', name: '4 Царств', shortName: '4Цар', testament: 'old', chaptersCount: 25 },
  { slug: '1-chronicles', name: '1 Паралипоменон', shortName: '1Пар', testament: 'old', chaptersCount: 29 },
  { slug: '2-chronicles', name: '2 Паралипоменон', shortName: '2Пар', testament: 'old', chaptersCount: 36 },
  { slug: 'ezra', name: 'Ездра', shortName: 'Езд', testament: 'old', chaptersCount: 10 },
  { slug: 'nehemiah', name: 'Неемия', shortName: 'Неем', testament: 'old', chaptersCount: 13 },
  { slug: 'esther', name: 'Есфирь', shortName: 'Есф', testament: 'old', chaptersCount: 10 },

  // Учительные (поэтические) книги
  { slug: 'job', name: 'Иов', shortName: 'Иов', testament: 'old', chaptersCount: 42 },
  { slug: 'psalms', name: 'Псалтирь', shortName: 'Пс', testament: 'old', chaptersCount: 150 },
  { slug: 'proverbs', name: 'Притчи', shortName: 'Притч', testament: 'old', chaptersCount: 31 },
  { slug: 'ecclesiastes', name: 'Екклесиаст', shortName: 'Еккл', testament: 'old', chaptersCount: 12 },
  { slug: 'song-of-solomon', name: 'Песня Песней', shortName: 'Песн', testament: 'old', chaptersCount: 8 },

  // Большие пророки
  { slug: 'isaiah', name: 'Исаия', shortName: 'Ис', testament: 'old', chaptersCount: 66 },
  { slug: 'jeremiah', name: 'Иеремия', shortName: 'Иер', testament: 'old', chaptersCount: 52 },
  { slug: 'lamentations', name: 'Плач Иеремии', shortName: 'Плач', testament: 'old', chaptersCount: 5 },
  { slug: 'ezekiel', name: 'Иезекииль', shortName: 'Иез', testament: 'old', chaptersCount: 48 },
  { slug: 'daniel', name: 'Даниил', shortName: 'Дан', testament: 'old', chaptersCount: 12 },

  // Малые пророки
  { slug: 'hosea', name: 'Осия', shortName: 'Ос', testament: 'old', chaptersCount: 14 },
  { slug: 'joel', name: 'Иоиль', shortName: 'Иоил', testament: 'old', chaptersCount: 3 },
  { slug: 'amos', name: 'Амос', shortName: 'Ам', testament: 'old', chaptersCount: 9 },
  { slug: 'obadiah', name: 'Авдий', shortName: 'Авд', testament: 'old', chaptersCount: 1 },
  { slug: 'jonah', name: 'Иона', shortName: 'Ион', testament: 'old', chaptersCount: 4 },
  { slug: 'micah', name: 'Михей', shortName: 'Мих', testament: 'old', chaptersCount: 7 },
  { slug: 'nahum', name: 'Наум', shortName: 'Наум', testament: 'old', chaptersCount: 3 },
  { slug: 'habakkuk', name: 'Аввакум', shortName: 'Авв', testament: 'old', chaptersCount: 3 },
  { slug: 'zephaniah', name: 'Софония', shortName: 'Соф', testament: 'old', chaptersCount: 3 },
  { slug: 'haggai', name: 'Аггей', shortName: 'Агг', testament: 'old', chaptersCount: 2 },
  { slug: 'zechariah', name: 'Захария', shortName: 'Зах', testament: 'old', chaptersCount: 14 },
  { slug: 'malachi', name: 'Малахия', shortName: 'Мал', testament: 'old', chaptersCount: 4 },

  // ────────────── Новый Завет ──────────────

  // Евангелия
  { slug: 'matthew', name: 'Евангелие от Матфея', shortName: 'Мф', testament: 'new', chaptersCount: 28 },
  { slug: 'mark', name: 'Евангелие от Марка', shortName: 'Мк', testament: 'new', chaptersCount: 16 },
  { slug: 'luke', name: 'Евангелие от Луки', shortName: 'Лк', testament: 'new', chaptersCount: 24 },
  { slug: 'john', name: 'Евангелие от Иоанна', shortName: 'Ин', testament: 'new', chaptersCount: 21 },

  // Деяния
  { slug: 'acts', name: 'Деяния Апостолов', shortName: 'Деян', testament: 'new', chaptersCount: 28 },

  // Послания Павла
  { slug: 'romans', name: 'Послание к Римлянам', shortName: 'Рим', testament: 'new', chaptersCount: 16 },
  { slug: '1-corinthians', name: '1-е Коринфянам', shortName: '1Кор', testament: 'new', chaptersCount: 16 },
  { slug: '2-corinthians', name: '2-е Коринфянам', shortName: '2Кор', testament: 'new', chaptersCount: 13 },
  { slug: 'galatians', name: 'Галатам', shortName: 'Гал', testament: 'new', chaptersCount: 6 },
  { slug: 'ephesians', name: 'Ефесянам', shortName: 'Еф', testament: 'new', chaptersCount: 6 },
  { slug: 'philippians', name: 'Филиппийцам', shortName: 'Флп', testament: 'new', chaptersCount: 4 },
  { slug: 'colossians', name: 'Колоссянам', shortName: 'Кол', testament: 'new', chaptersCount: 4 },
  { slug: '1-thessalonians', name: '1-е Фессалоникийцам', shortName: '1Фес', testament: 'new', chaptersCount: 5 },
  { slug: '2-thessalonians', name: '2-е Фессалоникийцам', shortName: '2Фес', testament: 'new', chaptersCount: 3 },
  { slug: '1-timothy', name: '1-е Тимофею', shortName: '1Тим', testament: 'new', chaptersCount: 6 },
  { slug: '2-timothy', name: '2-е Тимофею', shortName: '2Тим', testament: 'new', chaptersCount: 4 },
  { slug: 'titus', name: 'Титу', shortName: 'Тит', testament: 'new', chaptersCount: 3 },
  { slug: 'philemon', name: 'Филимону', shortName: 'Флм', testament: 'new', chaptersCount: 1 },

  // Соборные послания
  { slug: 'hebrews', name: 'Евреям', shortName: 'Евр', testament: 'new', chaptersCount: 13 },
  { slug: 'james', name: 'Иакова', shortName: 'Иак', testament: 'new', chaptersCount: 5 },
  { slug: '1-peter', name: '1-е Петра', shortName: '1Пет', testament: 'new', chaptersCount: 5 },
  { slug: '2-peter', name: '2-е Петра', shortName: '2Пет', testament: 'new', chaptersCount: 3 },
  { slug: '1-john', name: '1-е Иоанна', shortName: '1Ин', testament: 'new', chaptersCount: 5 },
  { slug: '2-john', name: '2-е Иоанна', shortName: '2Ин', testament: 'new', chaptersCount: 1 },
  { slug: '3-john', name: '3-е Иоанна', shortName: '3Ин', testament: 'new', chaptersCount: 1 },
  { slug: 'jude', name: 'Иуды', shortName: 'Иуд', testament: 'new', chaptersCount: 1 },

  // Пророческая
  { slug: 'revelation', name: 'Откровение', shortName: 'Откр', testament: 'new', chaptersCount: 22 },
]
