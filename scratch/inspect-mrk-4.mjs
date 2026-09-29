import { JSDOM } from 'jsdom'

const res = await fetch('https://www.bible.com/bible/385/MRK.1.CARS')
const html = await res.text()
const dom = new JSDOM(html)

const els4 = dom.window.document.querySelectorAll('[data-usfm="MRK.1.4"]')
console.log('Total MRK.1.4 elements:', els4.length)
els4.forEach((el, i) => {
  console.log(`--- EL 4[${i}] --- tag: ${el.tagName}, class: ${el.className}`)
  console.log(el.outerHTML)
})
