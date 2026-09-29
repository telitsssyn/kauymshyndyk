import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

const VERSIONS = {
  rst: { id: 400, abbrev: 'SYNO' },
  cars: { id: 385, abbrev: 'CARS' },
}

const BOOKS = {
  'genesis': { id: 'GEN', chapters: 50 }, 'exodus': { id: 'EXO', chapters: 40 },
  'leviticus': { id: 'LEV', chapters: 27 }, 'numbers': { id: 'NUM', chapters: 36 },
  'deuteronomy': { id: 'DEU', chapters: 34 }, 'joshua': { id: 'JOS', chapters: 24 },
  'judges': { id: 'JDG', chapters: 21 }, 'ruth': { id: 'RUT', chapters: 4 },
  '1-samuel': { id: '1SA', chapters: 31 }, '2-samuel': { id: '2SA', chapters: 24 },
  '1-kings': { id: '1KI', chapters: 22 }, '2-kings': { id: '2KI', chapters: 25 },
  '1-chronicles': { id: '1CH', chapters: 29 }, '2-chronicles': { id: '2CH', chapters: 36 },
  'ezra': { id: 'EZR', chapters: 10 }, 'nehemiah': { id: 'NEH', chapters: 13 },
  'esther': { id: 'EST', chapters: 10 }, 'job': { id: 'JOB', chapters: 42 },
  'psalms': { id: 'PSA', chapters: 150 }, 'proverbs': { id: 'PRO', chapters: 31 },
  'ecclesiastes': { id: 'ECC', chapters: 12 }, 'song-of-solomon': { id: 'SNG', chapters: 8 },
  'isaiah': { id: 'ISA', chapters: 66 }, 'jeremiah': { id: 'JER', chapters: 52 },
  'lamentations': { id: 'LAM', chapters: 5 }, 'ezekiel': { id: 'EZK', chapters: 48 },
  'daniel': { id: 'DAN', chapters: 12 }, 'hosea': { id: 'HOS', chapters: 14 },
  'joel': { id: 'JOL', chapters: 3 }, 'amos': { id: 'AMO', chapters: 9 },
  'obadiah': { id: 'OBA', chapters: 1 }, 'jonah': { id: 'JON', chapters: 4 },
  'micah': { id: 'MIC', chapters: 7 }, 'nahum': { id: 'NAM', chapters: 3 },
  'habakkuk': { id: 'HAB', chapters: 3 }, 'zephaniah': { id: 'ZEP', chapters: 3 },
  'haggai': { id: 'HAG', chapters: 2 }, 'zechariah': { id: 'ZEC', chapters: 14 },
  'malachi': { id: 'MAL', chapters: 4 },
  'matthew': { id: 'MAT', chapters: 28 }, 'mark': { id: 'MRK', chapters: 16 },
  'luke': { id: 'LUK', chapters: 24 }, 'john': { id: 'JHN', chapters: 21 },
  'acts': { id: 'ACT', chapters: 28 }, 'romans': { id: 'ROM', chapters: 16 },
  '1-corinthians': { id: '1CO', chapters: 16 }, '2-corinthians': { id: '2CO', chapters: 13 },
  'galatians': { id: 'GAL', chapters: 6 }, 'ephesians': { id: 'EPH', chapters: 6 },
  'philippians': { id: 'PHP', chapters: 4 }, 'colossians': { id: 'COL', chapters: 4 },
  '1-thessalonians': { id: '1TH', chapters: 5 }, '2-thessalonians': { id: '2TH', chapters: 3 },
  '1-timothy': { id: '1TI', chapters: 6 }, '2-timothy': { id: '2TI', chapters: 4 },
  'titus': { id: 'TIT', chapters: 3 }, 'philemon': { id: 'PHM', chapters: 1 },
  'hebrews': { id: 'HEB', chapters: 13 }, 'james': { id: 'JAS', chapters: 5 },
  '1-peter': { id: '1PE', chapters: 5 }, '2-peter': { id: '2PE', chapters: 3 },
  '1-john': { id: '1JN', chapters: 5 }, '2-john': { id: '2JN', chapters: 1 },
  '3-john': { id: '3JN', chapters: 1 }, 'jude': { id: 'JUD', chapters: 1 },
  'revelation': { id: 'REV', chapters: 22 },
}

async function fetchCleanTranslation(bookId, chapter, versionKey, retries = 3) {
  const ver = VERSIONS[versionKey]
  const url = `https://www.bible.com/bible/${ver.id}/${bookId}.${chapter}.${ver.abbrev}`
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url)
      if (!res.ok) {
        if (res.status === 429 && attempt < retries) {
          await new Promise((r) => setTimeout(r, attempt * 2000))
          continue
        }
        throw new Error(`HTTP ${res.status}`)
      }
      const html = await res.text()
      const dom = new JSDOM(html)
      dom.window.document.querySelectorAll('[class*="__note"], [class*="note"]').forEach((n) => n.remove())
      const elements = dom.window.document.querySelectorAll('[class*="__verse"][data-usfm]')
      const verses = {}
      elements.forEach((el) => {
        const usfm = el.getAttribute('data-usfm')
        const parts = usfm.split('.')
        if (parts.length === 3 && parts[0] === bookId && parts[1] === String(chapter)) {
          const vNum = parseInt(parts[2], 10)
          if (isNaN(vNum)) return
          const clone = el.cloneNode(true)
          clone.querySelectorAll('[class*="__label"], [class*="label"]').forEach((n) => n.remove())
          let text = (clone.textContent || '')
            .replace(/^#\s*/, '')
            .replace(/^\d+\s+/, '')
            .replace(/\s+/g, ' ')
            .trim()
          if (!verses[vNum]) verses[vNum] = ''
          if (text) {
            verses[vNum] += (verses[vNum] ? ' ' : '') + text
          }
        }
      })
      return verses
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, attempt * 1000))
    }
  }
}

async function repairChapter(bookSlug, chapter) {
  const book = BOOKS[bookSlug]
  if (!book) return
  const fPath = path.resolve(`public/bible/${bookSlug}/${chapter}.json`)
  if (!fs.existsSync(fPath)) return

  const existing = JSON.parse(fs.readFileSync(fPath, 'utf-8'))
  const [rstVerses, carsVerses] = await Promise.all([
    fetchCleanTranslation(book.id, chapter, 'rst'),
    fetchCleanTranslation(book.id, chapter, 'cars'),
  ])

  const allNums = new Set([
    ...Object.keys(rstVerses).map(Number),
    ...Object.keys(carsVerses).map(Number),
  ])
  const sorted = [...allNums].sort((a, b) => a - b)
  if (sorted.length === 0) return

  existing.verses = sorted.map((num) => {
    const prev = existing.verses?.find((v) => v.number === num)
    return {
      number: num,
      text: {
        rst: rstVerses[num] || prev?.text?.rst || '',
        cars: carsVerses[num] || prev?.text?.cars || '',
      },
      commentaries: prev?.commentaries || [],
    }
  })

  fs.writeFileSync(fPath, JSON.stringify(existing, null, 2))
}

// ─── Find all affected chapters ───

function findAffected() {
  const bibleDir = path.resolve('public/bible')
  const affected = []
  for (const [slug, meta] of Object.entries(BOOKS)) {
    const bPath = path.join(bibleDir, slug)
    if (!fs.existsSync(bPath)) continue
    for (let ch = 1; ch <= meta.chapters; ch++) {
      const fPath = path.join(bPath, `${ch}.json`)
      if (!fs.existsSync(fPath)) continue
      const d = JSON.parse(fs.readFileSync(fPath, 'utf-8'))
      let issue = false
      for (const v of d.verses || []) {
        for (const t of ['rst', 'cars']) {
          const text = v.text?.[t] || ''
          if (/^\d+\s+/.test(text)) issue = true
          if (/[А-Яа-яЁё0-9\s]+\s+\d+:\d+[\s−-]*\d*\.?$/.test(text)) issue = true
        }
        if (!v.text?.rst || !v.text?.cars) issue = true
      }
      if (issue) affected.push({ slug, ch })
    }
  }
  return affected
}

async function run() {
  const affected = findAffected()
  console.log(`Найдено глав с артефактами: ${affected.length}`)
  let count = 0
  const concurrency = 3
  
  for (let i = 0; i < affected.length; i += concurrency) {
    const chunk = affected.slice(i, i + concurrency)
    await Promise.all(chunk.map(async ({ slug, ch }) => {
      try {
        await repairChapter(slug, ch)
        count++
        console.log(`  ✓ [${count}/${affected.length}] Исправлено: ${slug} ${ch}`)
      } catch (err) {
        console.error(`  ✗ Ошибка ${slug} ${ch}:`, err.message)
      }
    }))
    await new Promise((r) => setTimeout(r, 400))
  }
  console.log(`\n🎉 Все ${count} глав успешно очищены!`)
}

run().catch(console.error)
