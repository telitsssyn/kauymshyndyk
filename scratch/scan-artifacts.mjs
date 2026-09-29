import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('public/bible')
let totalVerses = 0
let versesWithLeadingDigit = 0
let versesWithTrailingRef = 0

const books = fs.readdirSync(bibleDir)
for (const b of books) {
  const bPath = path.join(bibleDir, b)
  if (!fs.statSync(bPath).isDirectory()) continue
  for (const f of fs.readdirSync(bPath)) {
    if (!f.endsWith('.json')) continue
    const d = JSON.parse(fs.readFileSync(path.join(bPath, f), 'utf-8'))
    for (const v of d.verses || []) {
      totalVerses++
      for (const t of ['rst', 'cars']) {
        const text = v.text?.[t] || ''
        if (/^\d+\s+/.test(text)) {
          versesWithLeadingDigit++
        }
        // Match trailing biblical citations like "Зак. 13:4", "Быт 1:1" etc.
        if (/[А-Яа-яЁё0-9\s]+\s+\d+:\d+[\s−-]*\d*\.?$/.test(text)) {
          versesWithTrailingRef++
        }
      }
    }
  }
}

console.log('Total verses in Bible:', totalVerses)
console.log('Verses with leading digit:', versesWithLeadingDigit)
console.log('Verses with trailing reference:', versesWithTrailingRef)
