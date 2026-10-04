export type TranslationKey = 'rst' | 'cars'

export interface TranslationMeta {
  key: TranslationKey
  name: string
  shortName: string
  badge: string
  description: string
}

export type CommentaryAuthorKey = 'macdonald' | 'lopukhin'

export interface CommentaryAuthorMeta {
  key: CommentaryAuthorKey
  name: string
  shortName: string
  tagline: string
}

export interface VerseCommentary {
  authorKey: CommentaryAuthorKey
  authorName: string
  title?: string
  text: string
  crossReferences?: string[]
}

export interface BibleVerse {
  number: number
  text: Record<TranslationKey, string>
  commentaries: VerseCommentary[]
}

export interface BibleChapter {
  bookSlug: string
  bookName: string
  chapter: number
  totalChapters: number
  verses: BibleVerse[]
}

/**
 * Глава без толкований — то, что нужно для отрисовки страницы.
 * Толкования занимают бо́льшую часть файла главы (до сотен КБ), поэтому
 * в HTML они не попадают и подгружаются только по клику на стих.
 */
export interface BibleVerseText {
  number: number
  text: Record<TranslationKey, string>
  hasCommentary: boolean
}

export interface BibleChapterText extends Omit<BibleChapter, 'verses'> {
  verses: BibleVerseText[]
}

export const toChapterText = (chapter: BibleChapter): BibleChapterText => ({
  bookSlug: chapter.bookSlug,
  bookName: chapter.bookName,
  chapter: chapter.chapter,
  totalChapters: chapter.totalChapters,
  verses: chapter.verses.map((v) => ({
    number: v.number,
    text: v.text,
    hasCommentary: v.commentaries.length > 0,
  })),
})

export interface BibleBookMeta {
  slug: string
  name: string
  shortName: string
  testament: 'old' | 'new'
  chaptersCount: number
}

export const BIBLE_TRANSLATIONS: TranslationMeta[] = [
  {
    key: 'rst',
    name: 'Синодальный перевод',
    shortName: 'Синодальный',
    badge: 'РСТ',
    description: 'Традиционный классический перевод Библии на русский язык',
  },
  {
    key: 'cars',
    name: 'Восточный перевод',
    shortName: 'Восточный',
    badge: 'CARS',
    description: 'Священное Писание в Восточном переводе Института перевода Библии',
  },
]

export const COMMENTARY_AUTHORS: CommentaryAuthorMeta[] = [
  {
    key: 'macdonald',
    name: 'Уильям МакДональд',
    shortName: 'МакДональд',
    tagline: 'Практический евангельский комментарий',
  },
  {
    key: 'lopukhin',
    name: 'Александр Лопухин',
    shortName: 'Лопухин',
    tagline: 'Классическая православная Толковая Библия',
  },
]
