import { JSDOM } from 'jsdom'

const res = await fetch('https://www.bible.com/bible/385/MRK.1.CARS')
const html = await res.text()
const idx = html.indexOf('Зак. 13:4')
console.log('Index of Зак. 13:4 in CARS HTML:', idx)
if (idx !== -1) {
  console.log(html.slice(idx - 100, idx + 100))
}

const res2 = await fetch('https://www.bible.com/bible/400/MRK.1.SYNO')
const html2 = await res2.text()
const idx2 = html2.indexOf('Зак. 13:4')
console.log('Index of Зак. 13:4 in SYNO HTML:', idx2)
if (idx2 !== -1) {
  console.log(html2.slice(idx2 - 100, idx2 + 100))
}
