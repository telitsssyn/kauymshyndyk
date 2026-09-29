import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('public/bible')
const samples = []

const books = fs.readdirSync(bibleDir)
for (const b of books) {
  const bPath = path.join(bibleDir, b)
  if (!fs.statSync(bPath).isDirectory()) continue
  for (const f of fs.readdirSync(bPath)) {
    if (!f.endsWith('.json')) continue
    const d = JSON.parse(fs.readFileSync(path.join(bPath, f), 'utf-8'))
    for (const v of d.verses || []) {
      for (const t of ['rst', 'cars']) {
        const text = v.text?.[t] || ''
        if (/[А-Яа-яЁё0-9\s]+\s+\d+:\d+[\s−-]*\d*\.?$/.test(text)) {
          samples.push({ book: b, ch: f, num: v.number, trans: t, text })
        }
      }
    }
  }
}

console.log('Sample trailing references (first 10):')
for (const s of samples.slice(0, 10)) {
  console.log(`[${s.book} ${s.ch}:${s.num} ${s.trans}] ...${s.text.slice(-50)}`)
}
