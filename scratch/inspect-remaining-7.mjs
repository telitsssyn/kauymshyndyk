import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('public/bible')
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
        if (/^\d+\s+/.test(text)) {
          console.log(`[${b} ${f}:${v.number} ${t}]: ${text.slice(0, 70)}`)
        }
      }
    }
  }
}
