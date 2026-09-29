import { JSDOM } from 'jsdom'

async function fetchTranslationFixed(bookId, chapter, url) {
  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html)

  // 1. Remove all footnotes and notes from the entire document first!
  dom.window.document.querySelectorAll('[class*="__note"]').forEach(n => n.remove())

  // 2. Select ONLY verse elements with data-usfm matching this book and chapter
  const verseElements = dom.window.document.querySelectorAll('[class*="__verse"][data-usfm]')

  const verses = {}
  verseElements.forEach(el => {
    const usfm = el.getAttribute('data-usfm')
    const parts = usfm.split('.')
    if (parts.length === 3 && parts[0] === bookId && parts[1] === String(chapter)) {
      const vNum = parseInt(parts[2], 10)
      if (isNaN(vNum)) return

      const clone = el.cloneNode(true)
      // Remove labels (verse number badges)
      clone.querySelectorAll('[class*="__label"]').forEach(n => n.remove())

      let text = (clone.textContent || '')
        .replace(/^#\s*/, '')
        .replace(/^\d+\s*/, '') // Remove any leading verse number if still present
        .replace(/\s+/g, ' ')
        .trim()

      if (!verses[vNum]) verses[vNum] = ''
      if (text) {
        verses[vNum] += (verses[vNum] ? ' ' : '') + text
      }
    }
  })
  return verses
}

const carsFixed = await fetchTranslationFixed('MRK', 1, 'https://www.bible.com/bible/385/MRK.1.CARS')
console.log('Fixed MRK 1:4 CARS:', carsFixed[4])
console.log('Fixed MRK 1:5 CARS:', carsFixed[5])
console.log('Fixed MRK 1:6 CARS:', carsFixed[6])
