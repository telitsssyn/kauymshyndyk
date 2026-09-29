// scripts/migrate-to-lopukhin.mjs
// Заменяет комментарии Женевской Библии на Толкования Александра Лопухина
// во всех 66 книгах Библии (1 189 глав).
// Комментарии Уильяма МакДональда сохраняются без изменений (с устранением дубликатов).

import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

const BIBLE_BY_IDS = {
  // Ветхий Завет (1-39)
  'genesis': 1, 'exodus': 2, 'leviticus': 3, 'numbers': 4, 'deuteronomy': 5,
  'joshua': 6, 'judges': 7, 'ruth': 8, '1-samuel': 9, '2-samuel': 10,
  '1-kings': 11, '2-kings': 12, '1-chronicles': 13, '2-chronicles': 14,
  'ezra': 15, 'nehemiah': 16, 'esther': 17, 'job': 18, 'psalms': 19,
  'proverbs': 20, 'ecclesiastes': 21, 'song-of-solomon': 22, 'isaiah': 23,
  'jeremiah': 24, 'lamentations': 25, 'ezekiel': 26, 'daniel': 27,
  'hosea': 28, 'joel': 29, 'amos': 30, 'obadiah': 31, 'jonah': 32,
  'micah': 33, 'nahum': 34, 'habakkuk': 35, 'zephaniah': 36,
  'haggai': 37, 'zechariah': 38, 'malachi': 39,
  // Евангелия и Деяния (40-44)
  'matthew': 40, 'mark': 41, 'luke': 42, 'john': 43, 'acts': 44,
  // Соборные послания (45-51)
  'james': 45, '1-peter': 46, '2-peter': 47, '1-john': 48, '2-john': 49, '3-john': 50, 'jude': 51,
  // Послания Павла (52-65)
  'romans': 52, '1-corinthians': 53, '2-corinthians': 54, 'galatians': 55,
  'ephesians': 56, 'philippians': 57, 'colossians': 58,
  '1-thessalonians': 59, '2-thessalonians': 60,
  '1-timothy': 61, '2-timothy': 62, 'titus': 63, 'philemon': 64, 'hebrews': 65,
  // Откровение (66)
  'revelation': 66,
}

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

function parseLopukhinHtml(html, chapterNum) {
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) return {}

  const ps = Array.from(textDiv.querySelectorAll('p'))
    .map((p) => {
      const links = Array.from(p.querySelectorAll('span.link'))
        .map((s) => s.textContent.trim())
        .filter(Boolean)
      const text = p.textContent.replace(/\u00A0/g, ' ').trim()
      return { text, links }
    })
    .filter((p) => Boolean(p.text))

  const byVerse = {}
  let currentVerses = []
  let currentBody = []
  let currentLinks = []
  let chapterIntro = []

  const save = () => {
    if (currentVerses.length > 0 && currentBody.length > 0) {
      const text = currentBody.join('\n\n').trim()
      if (text) {
        // Убираем самоссылки вроде "1:1" или пустые
        const uniqueLinks = [...new Set(currentLinks)]
          .filter((l) => !l.match(/^\d+:\d+$/) && l.length > 2)
          .slice(0, 8)
        for (const v of currentVerses) {
          byVerse[v] = {
            authorKey: 'lopukhin',
            authorName: 'Александр Лопухин',
            text,
            ...(uniqueLinks.length > 0 ? { crossReferences: uniqueLinks } : {}),
          }
        }
      }
    }
    currentVerses = []
    currentBody = []
    currentLinks = []
  }

  // Регулярное выражение для заголовка стиха:
  // "Быт 1:1. В начале", "1Цар 1:3. И ходил", "Ис 53:1. [Господи!]", "1:5. Текст"
  const headerRegex = new RegExp(
    `^(?:[0-3]?[А-Яа-яЁё]+\\.?\\s*)?${chapterNum}:(\\d+)(?:[−-](\\d+))?\\.?\\s*(.*)$`,
  )

  for (const { text: p, links } of ps) {
    if (/Публикуется с разрешения|ПОДДЕРЖАТЬ СЛУЖЕНИЕ|Обратите внимание|bible\\.by/i.test(p)) {
      continue
    }

    const m = p.match(headerRegex)
    if (m) {
      save()
      const vStart = parseInt(m[1], 10)
      const vEnd = m[2] ? parseInt(m[2], 10) : vStart
      const verses = []
      for (let v = vStart; v <= vEnd; v++) verses.push(v)
      currentVerses = verses
      currentBody = []
      currentLinks = []

      const rest = m[3] ? m[3].trim() : ''
      if (rest && rest.length > 1) {
        currentBody.push(`«${rest}»`)
      }
    } else if (currentVerses.length > 0) {
      currentBody.push(p)
      currentLinks.push(...links)
    } else {
      chapterIntro.push(p)
    }
  }
  save()

  // Введение к главе прикрепляем к первому стиху
  if (chapterIntro.length > 0) {
    const introText = chapterIntro.join('\n\n').trim()
    if (byVerse[1]) {
      byVerse[1].text = `${introText}\n\n${byVerse[1].text}`
    } else {
      byVerse[1] = {
        authorKey: 'lopukhin',
        authorName: 'Александр Лопухин',
        text: introText,
      }
    }
  }

  return byVerse
}

async function fetchLopukhinWithRetry(bibleById, chapterNum, retries = 3) {
  const url = `https://bible.by/lopuhin-bible/${bibleById}/${chapterNum}/`
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS })
      if (!res.ok) {
        if (res.status === 404) return {}
        if (res.status === 429) {
          await new Promise((r) => setTimeout(r, attempt * 2000))
          continue
        }
        throw new Error(`HTTP ${res.status} for ${url}`)
      }
      const html = await res.text()
      return parseLopukhinHtml(html, chapterNum)
    } catch (err) {
      if (attempt === retries) {
        console.warn(`    ⚠ Ошибка загрузки Лопухина для ${bibleById}/${chapterNum}: ${err.message}`)
        return {}
      }
      await new Promise((r) => setTimeout(r, attempt * 1000))
    }
  }
  return {}
}

async function processBook(bookSlug) {
  const bibleById = BIBLE_BY_IDS[bookSlug]
  if (!bibleById) {
    console.warn(`Неизвестная книга: ${bookSlug}`)
    return
  }

  const bookDir = path.resolve(process.cwd(), `public/bible/${bookSlug}`)
  if (!fs.existsSync(bookDir)) {
    console.warn(`Папка не найдена: ${bookDir}`)
    return
  }

  const chapterFiles = fs
    .readdirSync(bookDir)
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

  let bookVersesUpdated = 0
  let bookLopukhinAdded = 0
  let bookMacdonaldKept = 0

  const concurrency = 6
  for (let i = 0; i < chapterFiles.length; i += concurrency) {
    const chunk = chapterFiles.slice(i, i + concurrency)
    await Promise.all(
      chunk.map(async (file) => {
        const filePath = path.join(bookDir, file)
        const chapterNum = parseInt(file.replace('.json', ''), 10)
        let data
        try {
          data = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        } catch {
          return
        }

        const lopukhinByVerse = await fetchLopukhinWithRetry(bibleById, chapterNum)

        for (const v of data.verses || []) {
          // 1. Сохраняем МакДональда и устраняем дубликаты
          const macs = (v.commentaries || []).filter((c) => c.authorKey === 'macdonald')
          const newCommentaries = []
          if (macs.length > 0) {
            bookMacdonaldKept++
            if (macs.length === 1) {
              newCommentaries.push(macs[0])
            } else {
              // Объединяем, если было несколько записей
              const mergedText = macs.map((m) => m.text).join('\n\n')
              newCommentaries.push({
                authorKey: 'macdonald',
                authorName: 'Уильям МакДональд',
                title: macs[0].title,
                text: mergedText,
                crossReferences: macs[0].crossReferences,
              })
            }
          }

          // 2. Добавляем Лопухина
          if (lopukhinByVerse[v.number]) {
            newCommentaries.push(lopukhinByVerse[v.number])
            bookLopukhinAdded++
          }

          v.commentaries = newCommentaries
          bookVersesUpdated++
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      }),
    )
  }

  return {
    chapters: chapterFiles.length,
    verses: bookVersesUpdated,
    macdonald: bookMacdonaldKept,
    lopukhin: bookLopukhinAdded,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const targetBooks = args.length > 0 ? args : Object.keys(BIBLE_BY_IDS)

  console.log(`=== МИГРАЦИЯ НА ТОЛКОВАНИЯ ЛОПУХИНА ===`)
  console.log(`Книг для обработки: ${targetBooks.length}`)
  const globalStart = Date.now()

  let totalChapters = 0
  let totalVerses = 0
  let totalMacdonald = 0
  let totalLopukhin = 0

  for (let idx = 0; idx < targetBooks.length; idx++) {
    const slug = targetBooks[idx]
    process.stdout.write(`[${idx + 1}/${targetBooks.length}] ${slug}... `)
    const start = Date.now()
    const stats = await processBook(slug)
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)
    if (stats) {
      totalChapters += stats.chapters
      totalVerses += stats.verses
      totalMacdonald += stats.macdonald
      totalLopukhin += stats.lopukhin
      console.log(
        `✓ (${stats.chapters} гл., ${stats.lopukhin} Лопухин, ${stats.macdonald} МакДональд, ${elapsed}с)`,
      )
    }
  }

  const totalTime = ((Date.now() - globalStart) / 1000).toFixed(1)
  console.log(`\n=== МИГРАЦИЯ ЗАВЕРШЕНА за ${totalTime}с ===`)
  console.log(`Обработано глав: ${totalChapters}`)
  console.log(`Обработано стихов: ${totalVerses}`)
  console.log(`Комментариев Лопухина добавлено: ${totalLopukhin}`)
  console.log(`Комментариев МакДональда сохранено: ${totalMacdonald}`)
}

main().catch((err) => {
  console.error('Критическая ошибка миграции:', err)
  process.exit(1)
})
