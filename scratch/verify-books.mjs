import { BIBLE_BOOKS } from '../src/data/bible/books.ts'
import fs from 'node:fs'

const scriptText = fs.readFileSync('scripts/fetch-bible.mjs', 'utf-8')
const booksMatch = scriptText.match(/const BOOKS = ({[\s\S]*?\n})/)
const BOOKS = eval('(' + booksMatch[1] + ')')

console.log('BIBLE_BOOKS count:', BIBLE_BOOKS.length)
console.log('fetch-bible BOOKS count:', Object.keys(BOOKS).length)

let mismatch = false
for (const b of BIBLE_BOOKS) {
  const fb = BOOKS[b.slug]
  if (!fb) {
    console.error(`Missing in fetch-bible: ${b.slug} (${b.name})`)
    mismatch = true
  } else if (fb.chapters !== b.chaptersCount) {
    console.error(`Chapter mismatch for ${b.slug}: books.ts has ${b.chaptersCount}, fetch-bible has ${fb.chapters}`)
    mismatch = true
  }
}

for (const slug of Object.keys(BOOKS)) {
  const found = BIBLE_BOOKS.find(b => b.slug === slug)
  if (!found) {
    console.error(`In fetch-bible but not in books.ts: ${slug}`)
    mismatch = true
  }
}

if (!mismatch) {
  console.log('✅ All 66 books and their chapter counts match perfectly!')
}
