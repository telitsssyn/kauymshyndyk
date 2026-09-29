import { JSDOM } from 'jsdom'

async function getV1(url) {
  const res = await fetch(url)
  const html = await res.text()
  const dom = new JSDOM(html)
  const el = dom.window.document.querySelector('[data-usfm="GEN.1.1"]')
  const clone = el?.cloneNode(true)
  clone?.querySelectorAll('[class*="__label"], [class*="__note"]').forEach(n => n.remove())
  return clone?.textContent?.trim()
}

console.log('385 (CARS):', await getV1('https://www.bible.com/bible/385/GEN.1.CARS'))
console.log('840 (CARSA):', await getV1('https://www.bible.com/bible/840/GEN.1.CARS'))
