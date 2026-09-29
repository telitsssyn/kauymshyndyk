import { JSDOM } from 'jsdom'

const res = await fetch('https://www.bible.com/bible/385/EXO.1.CARS')
const html = await res.text()
const dom = new JSDOM(html)
const els = dom.window.document.querySelectorAll('[data-usfm="EXO.1.1"]')
for (const el of els) {
  console.log('--- CARS ELEMENT ---')
  console.log('Tag:', el.tagName, 'Class:', el.className)
  console.log('outerHTML:\n', el.outerHTML)
  console.log('Child nodes:')
  for (const child of el.children) {
    console.log('  child tag:', child.tagName, 'class:', child.className, 'text:', child.textContent)
  }
}
