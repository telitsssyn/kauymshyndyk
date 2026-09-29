import { JSDOM } from 'jsdom'

const res = await fetch('https://www.bible.com/bible/385/MRK.1.CARS')
const html = await res.text()
const dom = new JSDOM(html)

for (const vNum of [4, 5]) {
  console.log(`\n=== VERSE ${vNum} ===`)
  const els = dom.window.document.querySelectorAll(`[data-usfm="MRK.1.${vNum}"]`)
  els.forEach(el => {
    console.log('outerHTML:', el.outerHTML)
  })
}
