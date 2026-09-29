import fs from 'node:fs'
import path from 'node:path'

const BOOKS_META = {
  'genesis': 50, 'exodus': 40, 'leviticus': 27, 'numbers': 36, 'deuteronomy': 34,
  'joshua': 24, 'judges': 21, 'ruth': 4, '1-samuel': 31, '2-samuel': 24,
  '1-kings': 22, '2-kings': 25, '1-chronicles': 29, '2-chronicles': 36,
  'ezra': 10, 'nehemiah': 13, 'esther': 10, 'job': 42, 'psalms': 150,
  'proverbs': 31, 'ecclesiastes': 12, 'song-of-solomon': 8, 'isaiah': 66,
  'jeremiah': 52, 'lamentations': 5, 'ezekiel': 48, 'daniel': 12,
  'hosea': 14, 'joel': 3, 'amos': 9, 'obadiah': 1, 'jonah': 4,
  'micah': 7, 'nahum': 3, 'habakkuk': 3, 'zephaniah': 3,
  'haggai': 2, 'zechariah': 14, 'malachi': 4,
  'matthew': 28, 'mark': 16, 'luke': 24, 'john': 21, 'acts': 28,
  'romans': 16, '1-corinthians': 16, '2-corinthians': 13, 'galatians': 6,
  'ephesians': 6, 'philippians': 4, 'colossians': 4,
  '1-thessalonians': 5, '2-thessalonians': 3, '1-timothy': 6, '2-timothy': 4,
  'titus': 3, 'philemon': 1, 'hebrews': 13, 'james': 5,
  '1-peter': 5, '2-peter': 3, '1-john': 5, '2-john': 1, '3-john': 1,
  'jude': 1, 'revelation': 22
}

const bibleDir = path.resolve('public/bible')
let affectedChapters = []

for (const [slug, totalCh] of Object.entries(BOOKS_META)) {
  const bPath = path.join(bibleDir, slug)
  if (!fs.existsSync(bPath)) continue
  for (let ch = 1; ch <= totalCh; ch++) {
    const fPath = path.join(bPath, `${ch}.json`)
    if (!fs.existsSync(fPath)) continue
    const d = JSON.parse(fs.readFileSync(fPath, 'utf-8'))
    let hasIssue = false
    for (const v of d.verses || []) {
      for (const t of ['rst', 'cars']) {
        const text = v.text?.[t] || ''
        if (/^\d+\s+/.test(text)) hasIssue = true
        if (/[А-Яа-яЁё0-9\s]+\s+\d+:\d+[\s−-]*\d*\.?$/.test(text)) hasIssue = true
      }
      // Also check empty rst or cars when one exists
      if (!v.text?.rst && v.text?.cars) hasIssue = true
      if (v.text?.rst && !v.text?.cars) hasIssue = true
    }
    if (hasIssue) {
      affectedChapters.push({ slug, ch })
    }
  }
}

console.log(`Total affected chapters out of 1189: ${affectedChapters.length}`)
console.log('Sample affected chapters (first 10):', affectedChapters.slice(0, 10))
