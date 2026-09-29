// scripts/fetch-bible.mjs
// Скачивает переводы Библии (Синодальный + Восточный/CARS) с bible.com
// и толкования (Женевская Библия + Уильям МакДональд) с bible.by
// и сохраняет в public/bible/<book>/<chapter>.json
//
// Использование:
//   node scripts/fetch-bible.mjs exodus 1        — одна глава (с комментариями)
//   node scripts/fetch-bible.mjs exodus           — все главы книги
//   node scripts/fetch-bible.mjs --nt             — весь Новый Завет (27 книг)
//   node scripts/fetch-bible.mjs --ot             — весь Ветхий Завет (39 книг)
//   node scripts/fetch-bible.mjs --all            — ВСЯ Библия (66 книг)
//   node scripts/fetch-bible.mjs --force ...      — перезаписать существующие
//   node scripts/fetch-bible.mjs --no-comments ...— только тексты без комментариев

import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

// ─── Конфигурация переводов ───

const VERSIONS = {
  rst: { id: 400, abbrev: 'SYNO' },
  cars: { id: 385, abbrev: 'CARS' },
}

// ─── bible.by ID mapping (Synodal order) ───

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

// ─── Каталог всех 66 книг Библии ───

const BOOKS = {
  // Ветхий Завет
  'genesis':         { id: 'GEN', name: 'Бытие',               chapters: 50, testament: 'old' },
  'exodus':          { id: 'EXO', name: 'Исход',               chapters: 40, testament: 'old' },
  'leviticus':       { id: 'LEV', name: 'Левит',               chapters: 27, testament: 'old' },
  'numbers':         { id: 'NUM', name: 'Числа',               chapters: 36, testament: 'old' },
  'deuteronomy':     { id: 'DEU', name: 'Второзаконие',        chapters: 34, testament: 'old' },
  'joshua':          { id: 'JOS', name: 'Иисус Навин',         chapters: 24, testament: 'old' },
  'judges':          { id: 'JDG', name: 'Книга Судей',         chapters: 21, testament: 'old' },
  'ruth':            { id: 'RUT', name: 'Руфь',                chapters: 4,  testament: 'old' },
  '1-samuel':        { id: '1SA', name: '1 Царств',            chapters: 31, testament: 'old' },
  '2-samuel':        { id: '2SA', name: '2 Царств',            chapters: 24, testament: 'old' },
  '1-kings':         { id: '1KI', name: '3 Царств',            chapters: 22, testament: 'old' },
  '2-kings':         { id: '2KI', name: '4 Царств',            chapters: 25, testament: 'old' },
  '1-chronicles':    { id: '1CH', name: '1 Паралипоменон',     chapters: 29, testament: 'old' },
  '2-chronicles':    { id: '2CH', name: '2 Паралипоменон',     chapters: 36, testament: 'old' },
  'ezra':            { id: 'EZR', name: 'Ездра',               chapters: 10, testament: 'old' },
  'nehemiah':        { id: 'NEH', name: 'Неемия',              chapters: 13, testament: 'old' },
  'esther':          { id: 'EST', name: 'Есфирь',              chapters: 10, testament: 'old' },
  'job':             { id: 'JOB', name: 'Иов',                 chapters: 42, testament: 'old' },
  'psalms':          { id: 'PSA', name: 'Псалтирь',            chapters: 150,testament: 'old' },
  'proverbs':        { id: 'PRO', name: 'Притчи',              chapters: 31, testament: 'old' },
  'ecclesiastes':    { id: 'ECC', name: 'Екклесиаст',          chapters: 12, testament: 'old' },
  'song-of-solomon': { id: 'SNG', name: 'Песня Песней',        chapters: 8,  testament: 'old' },
  'isaiah':          { id: 'ISA', name: 'Исаия',               chapters: 66, testament: 'old' },
  'jeremiah':        { id: 'JER', name: 'Иеремия',             chapters: 52, testament: 'old' },
  'lamentations':    { id: 'LAM', name: 'Плач Иеремии',        chapters: 5,  testament: 'old' },
  'ezekiel':         { id: 'EZK', name: 'Иезекииль',           chapters: 48, testament: 'old' },
  'daniel':          { id: 'DAN', name: 'Даниил',              chapters: 12, testament: 'old' },
  'hosea':           { id: 'HOS', name: 'Осия',                chapters: 14, testament: 'old' },
  'joel':            { id: 'JOL', name: 'Иоиль',               chapters: 3,  testament: 'old' },
  'amos':            { id: 'AMO', name: 'Амос',                chapters: 9,  testament: 'old' },
  'obadiah':         { id: 'OBA', name: 'Авдий',               chapters: 1,  testament: 'old' },
  'jonah':           { id: 'JON', name: 'Иона',                chapters: 4,  testament: 'old' },
  'micah':           { id: 'MIC', name: 'Михей',               chapters: 7,  testament: 'old' },
  'nahum':           { id: 'NAM', name: 'Наум',                chapters: 3,  testament: 'old' },
  'habakkuk':        { id: 'HAB', name: 'Аввакум',             chapters: 3,  testament: 'old' },
  'zephaniah':       { id: 'ZEP', name: 'Софония',             chapters: 3,  testament: 'old' },
  'haggai':          { id: 'HAG', name: 'Аггей',               chapters: 2,  testament: 'old' },
  'zechariah':       { id: 'ZEC', name: 'Захария',             chapters: 14, testament: 'old' },
  'malachi':         { id: 'MAL', name: 'Малахия',             chapters: 4,  testament: 'old' },

  // Новый Завет
  'matthew':           { id: 'MAT', name: 'Евангелие от Матфея',    chapters: 28, testament: 'new' },
  'mark':              { id: 'MRK', name: 'Евангелие от Марка',     chapters: 16, testament: 'new' },
  'luke':              { id: 'LUK', name: 'Евангелие от Луки',      chapters: 24, testament: 'new' },
  'john':              { id: 'JHN', name: 'Евангелие от Иоанна',    chapters: 21, testament: 'new' },
  'acts':              { id: 'ACT', name: 'Деяния Апостолов',       chapters: 28, testament: 'new' },
  'romans':            { id: 'ROM', name: 'Послание к Римлянам',    chapters: 16, testament: 'new' },
  '1-corinthians':     { id: '1CO', name: '1-е Коринфянам',         chapters: 16, testament: 'new' },
  '2-corinthians':     { id: '2CO', name: '2-е Коринфянам',         chapters: 13, testament: 'new' },
  'galatians':         { id: 'GAL', name: 'Галатам',                chapters: 6,  testament: 'new' },
  'ephesians':         { id: 'EPH', name: 'Ефесянам',               chapters: 6,  testament: 'new' },
  'philippians':       { id: 'PHP', name: 'Филиппийцам',            chapters: 4,  testament: 'new' },
  'colossians':        { id: 'COL', name: 'Колоссянам',             chapters: 4,  testament: 'new' },
  '1-thessalonians':   { id: '1TH', name: '1-е Фессалоникийцам',    chapters: 5,  testament: 'new' },
  '2-thessalonians':   { id: '2TH', name: '2-е Фессалоникийцам',    chapters: 3,  testament: 'new' },
  '1-timothy':         { id: '1TI', name: '1-е Тимофею',            chapters: 6,  testament: 'new' },
  '2-timothy':         { id: '2TI', name: '2-е Тимофею',            chapters: 4,  testament: 'new' },
  'titus':             { id: 'TIT', name: 'Титу',                   chapters: 3,  testament: 'new' },
  'philemon':          { id: 'PHM', name: 'Филимону',               chapters: 1,  testament: 'new' },
  'hebrews':           { id: 'HEB', name: 'Евреям',                 chapters: 13, testament: 'new' },
  'james':             { id: 'JAS', name: 'Иакова',                 chapters: 5,  testament: 'new' },
  '1-peter':           { id: '1PE', name: '1-е Петра',              chapters: 5,  testament: 'new' },
  '2-peter':           { id: '2PE', name: '2-е Петра',              chapters: 3,  testament: 'new' },
  '1-john':            { id: '1JN', name: '1-е Иоанна',             chapters: 5,  testament: 'new' },
  '2-john':            { id: '2JN', name: '2-е Иоанна',             chapters: 1,  testament: 'new' },
  '3-john':            { id: '3JN', name: '3-е Иоанна',             chapters: 1,  testament: 'new' },
  'jude':              { id: 'JUD', name: 'Иуды',                   chapters: 1,  testament: 'new' },
  'revelation':        { id: 'REV', name: 'Откровение',             chapters: 22, testament: 'new' },
}

// ─── Загрузка текста перевода с bible.com ───

function cleanVerseText(raw) {
  let text = raw
  text = text.replace(/^#\s*/, '')
  text = text.replace(/\s+/g, ' ').trim()
  return text
}

async function fetchTranslation(bookId, chapter, versionKey, retries = 3) {
  const ver = VERSIONS[versionKey]
  const url = `https://www.bible.com/bible/${ver.id}/${bookId}.${chapter}.${ver.abbrev}`

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          console.warn(`    ⚠ Ограничение частоты запросов (${url}), ожидание ${attempt * 2}с...`)
          await new Promise((r) => setTimeout(r, attempt * 2000))
          continue
        }
        throw new Error(`HTTP ${res.status} for ${url}`)
      }

      const html = await res.text()
      const dom = new JSDOM(html)

      // 1. Удаляем все сноски и перекрёстные ссылки из всего документа
      dom.window.document.querySelectorAll('[class*="__note"], [class*="note"]').forEach((n) => n.remove())

      // 2. Выбираем только контейнеры стихов, соответствующие текущей книге и главе
      const elements = dom.window.document.querySelectorAll('[class*="__verse"][data-usfm]')

      const verses = {}
      elements.forEach((el) => {
        const usfm = el.getAttribute('data-usfm')
        const parts = usfm.split('.')
        // Строгая проверка: parts[0] совпадает с ID книги, parts[1] совпадает с номером главы
        if (parts.length === 3 && parts[0] === bookId && parts[1] === String(chapter)) {
          const vNum = parseInt(parts[2], 10)
          if (isNaN(vNum)) return

          const clone = el.cloneNode(true)
          // Удаляем бейджи с номерами стихов
          clone.querySelectorAll('[class*="__label"], [class*="label"]').forEach((n) => n.remove())

          let text = cleanVerseText(clone.textContent || '')
          // Убираем номер стиха в начале, ТОЛЬКО если он совпадает с номером стиха (защита от чисел в тексте вроде «72 000 волов»)
          const leadMatch = text.match(/^(\d+)\s+/)
          if (leadMatch && parseInt(leadMatch[1], 10) === vNum) {
            text = text.slice(leadMatch[0].length)
          }

          if (!verses[vNum]) verses[vNum] = ''
          if (text) {
            verses[vNum] += (verses[vNum] ? ' ' : '') + text
          }
        }
      })
      return verses
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`    ⚠ Попытка ${attempt} не удалась (${url}): ${err.message}. Повтор...`)
      await new Promise((r) => setTimeout(r, attempt * 1000))
    }
  }
}

// ─── Загрузка комментариев с bible.by ───

function parseCommentaryHtml(html, chapterNum, authorKey, authorName) {
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  const byVerse = {}
  if (!textDiv) return byVerse

  let currentVerses = []
  let currentTitle = ''
  let currentBody = []

  const save = () => {
    if (currentVerses.length > 0 && currentBody.length > 0) {
      const text = currentBody.join('\n\n').trim()
      if (text) {
        for (const v of currentVerses) {
          if (!byVerse[v]) byVerse[v] = []
          byVerse[v].push({
            authorKey,
            authorName,
            ...(currentTitle ? { title: currentTitle } : {}),
            text,
          })
        }
      }
    }
    currentVerses = []
    currentTitle = ''
    currentBody = []
  }

  for (const p of textDiv.querySelectorAll('p')) {
    const pText = p.textContent.trim()
    if (!pText) continue

    // Заголовки разделов (МакДональд: "I. ...", "А. ...")
    if (/^[I|V|X|A-ZА-ЯЁ]\.\s+/.test(pText)) {
      save()
      currentTitle = pText
      continue
    }

    // Ссылка на стих вида "1:5", "1:1-7", "1:1−7", "5" и т.д.
    const m = pText.match(/^(?:(\d+):)?(\d+)(?:[−-](\d+))?\s+(.*)$/)
    if (m && (!m[1] || parseInt(m[1], 10) === chapterNum)) {
      save()
      const start = parseInt(m[2], 10)
      currentVerses = [start]
      let rest = m[4]

      // Извлекаем возможный подзаголовок (первое предложение)
      const periodIdx = rest.indexOf('.')
      if (periodIdx > 0 && periodIdx < 45 && !currentTitle) {
        currentTitle = rest.slice(0, periodIdx).trim()
        rest = rest.slice(periodIdx + 1).trim()
      }
      currentBody = [rest || m[4]]
    } else if (currentVerses.length > 0) {
      // Игнорируем копирайты и футеры
      if (/Публикуется с разрешения|ПОДДЕРЖАТЬ СЛУЖЕНИЕ|Обратите внимание/i.test(pText)) {
        continue
      }
      currentBody.push(pText)
    }
  }
  save()
  return byVerse
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
        const uniqueLinks = [...new Set(currentLinks)]
          .filter((l) => !l.match(/^\d+:\d+$/) && l.length > 2)
          .slice(0, 8)
        for (const v of currentVerses) {
          byVerse[v] = [{
            authorKey: 'lopukhin',
            authorName: 'Александр Лопухин',
            text,
            ...(uniqueLinks.length > 0 ? { crossReferences: uniqueLinks } : {}),
          }]
        }
      }
    }
    currentVerses = []
    currentBody = []
    currentLinks = []
  }

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

  if (chapterIntro.length > 0) {
    const introText = chapterIntro.join('\n\n').trim()
    if (byVerse[1] && byVerse[1][0]) {
      byVerse[1][0].text = `${introText}\n\n${byVerse[1][0].text}`
    } else {
      byVerse[1] = [{
        authorKey: 'lopukhin',
        authorName: 'Александр Лопухин',
        text: introText,
      }]
    }
  }

  return byVerse
}

async function fetchCommentaries(bookSlug, chapter) {
  const bibleById = BIBLE_BY_IDS[bookSlug]
  if (!bibleById) return { lopukhin: {}, macdonald: {} }

  const lopukhinUrl = `https://bible.by/lopuhin-bible/${bibleById}/${chapter}/`
  const mcdUrl = `https://bible.by/mcdonald/${bibleById}/${chapter}/`

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }

  const [lopHtml, mcdHtml] = await Promise.all([
    fetch(lopukhinUrl, { headers }).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
    fetch(mcdUrl, { headers }).then((r) => (r.ok ? r.text() : '')).catch(() => ''),
  ])

  const lopukhin = lopHtml ? parseLopukhinHtml(lopHtml, chapter) : {}
  const macdonald = mcdHtml ? parseCommentaryHtml(mcdHtml, chapter, 'macdonald', 'Уильям МакДональд') : {}

  return { lopukhin, macdonald }
}

// ─── Загрузка и сборка одной главы ───

async function fetchChapter(bookSlug, chapter, options = {}) {
  const { force = false, includeComments = true } = options
  const book = BOOKS[bookSlug]
  if (!book) throw new Error(`Неизвестная книга: ${bookSlug}`)

  const outDir = path.resolve(process.cwd(), `public/bible/${bookSlug}`)
  fs.mkdirSync(outDir, { recursive: true })
  const outPath = path.join(outDir, `${chapter}.json`)

  // Если файл уже есть и force не задан
  let existingData = null
  if (fs.existsSync(outPath)) {
    try {
      existingData = JSON.parse(fs.readFileSync(outPath, 'utf-8'))
      if (!force && existingData?.verses?.length > 0 && existingData.verses[0]?.text?.rst) {
        // Проверяем, нужно ли обогатить комментариями
        const hasComments = existingData.verses.some((v) => v.commentaries?.length > 0)
        if (!includeComments || hasComments) {
          console.log(`    ⏭ ${book.name}, гл. ${chapter} — уже есть`)
          return { skipped: true, data: existingData }
        }
      }
    } catch {
      // Игнорируем ошибку чтения
    }
  }

  console.log(`  📖 ${book.name}, глава ${chapter}/${book.chapters}...`)

  // Скачиваем тексты параллельно
  const [rstVerses, carsVerses] = await Promise.all([
    fetchTranslation(book.id, chapter, 'rst'),
    fetchTranslation(book.id, chapter, 'cars'),
  ])

  // Скачиваем комментарии
  let comms = { geneva: {}, macdonald: {} }
  if (includeComments) {
    comms = await fetchCommentaries(bookSlug, chapter)
  }

  // Собираем все номера стихов
  const allVerseNums = new Set([
    ...Object.keys(rstVerses).map(Number),
    ...Object.keys(carsVerses).map(Number),
  ])
  const sortedVerseNums = [...allVerseNums].sort((a, b) => a - b)

  if (sortedVerseNums.length === 0) {
    console.warn(`    ⚠ Стихи не найдены!`)
    return null
  }

  const chapterData = {
    bookSlug,
    bookName: book.name,
    chapter,
    totalChapters: book.chapters,
    verses: sortedVerseNums.map((num) => {
      // Существующие комментарии имеют приоритет, если они уже были
      const existingVerse = existingData?.verses?.find((v) => v.number === num)
      let verseComments = existingVerse?.commentaries?.length ? existingVerse.commentaries : []

      if (verseComments.length === 0 && includeComments) {
        verseComments = [
          ...(comms.macdonald[num] || []),
          ...(comms.lopukhin[num] || []),
        ]
      }

      return {
        number: num,
        text: {
          rst: rstVerses[num] || existingVerse?.text?.rst || '',
          cars: carsVerses[num] || existingVerse?.text?.cars || '',
        },
        commentaries: verseComments,
      }
    }),
  }

  fs.writeFileSync(outPath, JSON.stringify(chapterData, null, 2))
  const commCount = chapterData.verses.filter((v) => v.commentaries.length > 0).length
  console.log(`    ✓ [${chapter}/${book.chapters}] ${sortedVerseNums.length} стихов (с комм.: ${commCount}) → ${bookSlug}/${chapter}.json`)
  return chapterData
}

// ─── Пакетная загрузка книги ───

async function fetchBook(bookSlug, options = {}) {
  const book = BOOKS[bookSlug]
  if (!book) throw new Error(`Неизвестная книга: ${bookSlug}`)

  console.log(`\n📚 ${book.name} (${book.chapters} глав)`)

  let success = 0
  let fail = 0

  for (let ch = 1; ch <= book.chapters; ch++) {
    try {
      const res = await fetchChapter(bookSlug, ch, options)
      success++
      if (!res?.skipped) {
        // Вежливая задержка между главами только если был сетевой запрос
        await new Promise((r) => setTimeout(r, 400))
      }
    } catch (err) {
      console.error(`    ✗ Глава ${ch}: ${err.message}`)
      fail++
    }
  }

  console.log(`✅ ${book.name}: ${success} готово, ${fail} ошибок`)
}

// ─── Пакетная загрузка группы книг ───

async function fetchBooks(slugList, groupName, options = {}) {
  console.log(`\n🔥 Запуск: ${groupName} (${slugList.length} книг)\n`)
  let totalSuccess = 0
  const startTime = Date.now()
  for (let i = 0; i < slugList.length; i++) {
    const slug = slugList[i]
    console.log(`\n==============================\n[${i + 1}/${slugList.length}] Книга: ${BOOKS[slug].name}\n==============================`)
    await fetchBook(slug, options)
    totalSuccess++
  }
  const elapsedMin = ((Date.now() - startTime) / 60000).toFixed(1)
  console.log(`\n🎉 Завершено: ${groupName}! Всего обработано книг: ${totalSuccess} за ${elapsedMin} мин.`)
}

// ─── CLI ───

const rawArgs = process.argv.slice(2)
const force = rawArgs.includes('--force')
const noComments = rawArgs.includes('--no-comments')
const args = rawArgs.filter((a) => !a.startsWith('--'))
const options = { force, includeComments: !noComments }

if (rawArgs.includes('--all')) {
  fetchBooks(Object.keys(BOOKS), 'Вся Библия (66 книг)', options).catch(console.error)
} else if (rawArgs.includes('--nt') || rawArgs.includes('--new-testament')) {
  const ntSlugs = Object.keys(BOOKS).filter((s) => BOOKS[s].testament === 'new')
  fetchBooks(ntSlugs, 'Новый Завет (27 книг)', options).catch(console.error)
} else if (rawArgs.includes('--ot') || rawArgs.includes('--old-testament')) {
  const otSlugs = Object.keys(BOOKS).filter((s) => BOOKS[s].testament === 'old')
  fetchBooks(otSlugs, 'Ветхий Завет (39 книг)', options).catch(console.error)
} else if (args.length === 2) {
  const [bookSlug, ch] = args
  fetchChapter(bookSlug, parseInt(ch, 10), options).catch(console.error)
} else if (args.length === 1) {
  fetchBook(args[0], options).catch(console.error)
} else {
  console.log(`
📖 Скрипт загрузки Библии
  Переводы:  Синодальный (bible.com SYNO) + Восточный (bible.com CARS)
  Толкования: Новая Женевская Библия + Уильям МакДональд (bible.by)

Использование:
  node scripts/fetch-bible.mjs <книга> <глава>     — одна глава
  node scripts/fetch-bible.mjs <книга>             — все главы книги
  node scripts/fetch-bible.mjs --nt               — весь Новый Завет (27 книг, 260 глав)
  node scripts/fetch-bible.mjs --ot               — весь Ветхий Завет (39 книг, 929 глав)
  node scripts/fetch-bible.mjs --all              — ВСЯ Библия (66 книг, 1189 глав)

Опции:
  --force          — перезаписать существующие файлы
  --no-comments    — не скачивать комментарии (только тексты)

Примеры:
  node scripts/fetch-bible.mjs exodus 1 --force
  node scripts/fetch-bible.mjs matthew
  node scripts/fetch-bible.mjs --nt
`)
}
