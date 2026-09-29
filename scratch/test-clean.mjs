import { JSDOM } from 'jsdom'

async function testFetch(url) {
  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html)
  const verses = {}
  
  const elements = dom.window.document.querySelectorAll('[data-usfm]')
  elements.forEach((el) => {
    const usfm = el.getAttribute('data-usfm')
    const parts = usfm.split('.')
    if (parts.length === 3) {
      const vNum = parseInt(parts[2], 10)
      if (isNaN(vNum)) return
      
      // Clone element so we can mutate safely
      const clone = el.cloneNode(true)
      // Remove labels (verse numbers) and notes (cross-references, footnotes)
      clone.querySelectorAll('[class*="__label"], [class*="__note"]').forEach(n => n.remove())
      
      let text = clone.textContent || ''
      text = text.replace(/\s+/g, ' ').trim()
      
      if (!verses[vNum]) verses[vNum] = ''
      if (text) {
        verses[vNum] += (verses[vNum] ? ' ' : '') + text
      }
    }
  })
  return verses
}

const rstVerses = await testFetch('https://www.bible.com/bible/400/EXO.1.SYNO')
const carsVerses = await testFetch('https://www.bible.com/bible/385/EXO.1.CARS')

console.log('RST V1:', rstVerses[1])
console.log('RST V2:', rstVerses[2])
console.log('RST V3:', rstVerses[3])
console.log('RST V5:', rstVerses[5])
console.log('CARS V1:', carsVerses[1])
console.log('CARS V2:', carsVerses[2])
console.log('Total verses RST:', Object.keys(rstVerses).length)
console.log('Total verses CARS:', Object.keys(carsVerses).length)
