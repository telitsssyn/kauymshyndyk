import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('public/bible')
let totalBooks = 0
let totalChapters = 0
let totalVerses = 0
let totalCommentaries = 0
let macdonaldCount = 0
let genevaCount = 0

const books = fs.readdirSync(bibleDir)
for (const b of books) {
  const bPath = path.join(bibleDir, b)
  if (!fs.statSync(bPath).isDirectory()) continue
  totalBooks++
  for (const f of fs.readdirSync(bPath)) {
    if (!f.endsWith('.json')) continue
    totalChapters++
    const d = JSON.parse(fs.readFileSync(path.join(bPath, f), 'utf-8'))
    for (const v of d.verses || []) {
      totalVerses++
      for (const c of v.commentaries || []) {
        totalCommentaries++
        if (c.authorKey === 'macdonald') macdonaldCount++
        if (c.authorKey === 'geneva') genevaCount++
      }
    }
  }
}

console.log('=== BIBLE STATISTICS ===')
console.log('Books:', totalBooks, '/ 66')
console.log('Chapters:', totalChapters, '/ 1189')
console.log('Total verses:', totalVerses)
console.log('Total commentaries:', totalCommentaries)
console.log('  - MacDonald commentaries:', macdonaldCount)
console.log('  - Geneva commentaries:', genevaCount)
