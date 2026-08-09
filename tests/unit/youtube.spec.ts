import { describe, expect, it } from 'vitest'

import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'

const ID = 'dQw4w9WgXcQ'

describe('extractVideoId', () => {
  // Контент-менеджер копирует адрес из строки браузера — а он бывает очень разным
  it.each([
    ['обычная ссылка', `https://www.youtube.com/watch?v=${ID}`],
    ['без www', `https://youtube.com/watch?v=${ID}`],
    ['с меткой времени', `https://www.youtube.com/watch?v=${ID}&t=42s`],
    ['параметр v не первый', `https://www.youtube.com/watch?app=desktop&v=${ID}`],
    ['короткая ссылка', `https://youtu.be/${ID}`],
    ['короткая с параметром', `https://youtu.be/${ID}?t=42`],
    ['shorts', `https://www.youtube.com/shorts/${ID}`],
    ['трансляция', `https://www.youtube.com/live/${ID}`],
    ['embed', `https://www.youtube.com/embed/${ID}`],
  ])('распознаёт: %s', (_case, url) => {
    expect(extractVideoId(url)).toBe(ID)
  })

  it.each([
    ['пустая строка', ''],
    ['не ссылка', 'посмотрите на нашем канале'],
    ['чужой сервис', 'https://vimeo.com/123456789'],
    ['канал, а не видео', 'https://www.youtube.com/@kauymshyndyk'],
  ])('возвращает null: %s', (_case, url) => {
    expect(extractVideoId(url)).toBeNull()
  })
})

describe('youtubeThumbnail', () => {
  it('собирает адрес обложки', () => {
    expect(youtubeThumbnail(ID)).toBe(`https://i.ytimg.com/vi/${ID}/hqdefault.jpg`)
  })
})
