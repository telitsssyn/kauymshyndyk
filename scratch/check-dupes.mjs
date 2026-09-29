import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('public/bible')
let macdonaldDupes = 0
let genevaDupes = 0

for (const b of fs.readdirSync(bibleDir)) {
  const bPath = path.join(bibleDir, b)
  if (!fs.statSync(bPath).isDirectory()) continue
  for (const f of fs.readdirSync(bPath)) {
    if (!f.endsWith('.json')) continue
    const data = JSON.parse(fs.readFileSync(path.join(bPath, f), 'utf-8'))
    for (const v of data.verses || []) {
      const macCount = (v.commentaries || []).filter(c => c.authorKey === 'macdonald').length
      const genCount = (v.commentaries || []).filter(c => c.authorKey === 'geneva').length
      if (macCount > 1) macdonaldDupes++
      if (genCount > 1) genevaDupes++
    }
  }
}

console.log('Verses with duplicate MacDonald commentaries:', macdonaldDupes)
console.log('Verses with duplicate Geneva commentaries:', genevaDupes)
