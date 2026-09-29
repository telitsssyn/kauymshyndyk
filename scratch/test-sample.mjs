import { JSDOM } from 'jsdom'

async function checkChapter(url) {
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
      
      const clone = el.cloneNode(true)
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

const tests = [
  'https://www.bible.com/bible/400/MAT.1.SYNO',
  'https://www.bible.com/bible/385/MAT.1.CARS',
  'https://www.bible.com/bible/400/PSA.23.SYNO',
  'https://www.bible.com/bible/385/PSA.23.CARS',
  'https://www.bible.com/bible/400/JHN.1.SYNO',
  'https://www.bible.com/bible/385/JHN.1.CARS',
]

for (const u of tests) {
  const v = await checkChapter(u)
  console.log(u.split('/').slice(-1)[0], 'count:', Object.keys(v).length, 'v1:', v[1]?.slice(0, 70), 'v2:', v[2]?.slice(0, 70))
}
