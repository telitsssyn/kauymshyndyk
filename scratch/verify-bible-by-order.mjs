import { BIBLE_BOOKS } from '../src/data/bible/books.ts'
import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/geneva-bible/')
const html = await res.text()
const dom = new JSDOM(html)

const links = dom.window.document.querySelectorAll('a[href^="/geneva-bible/"]')
const found = new Map()

links.forEach(a => {
  const m = a.getAttribute('href').match(/^\/geneva-bible\/(\d+)\/1\/$/)
  if (m) {
    const num = parseInt(m[1], 10)
    const title = a.textContent.trim()
    if (!found.has(num)) {
      found.set(num, title)
    }
  }
})

console.log('Total books in bible.by nav:', found.size)
for (let i = 0; i < BIBLE_BOOKS.length; i++) {
  const ourBook = BIBLE_BOOKS[i]
  const bibleByBook = found.get(i + 1)
  console.log(`${i + 1}. ours: "${ourBook.name}" vs bible.by: "${bibleByBook}"`)
}
