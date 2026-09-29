import { JSDOM } from 'jsdom'

const r = await fetch('https://www.bible.com/bible/400/EXO.1.SYNO')
const t = await r.text()
const d = new JSDOM(t)
const els = d.window.document.querySelectorAll('[data-usfm]')
els.forEach(el => {
  const u = el.getAttribute('data-usfm')
  const p = u.split('.')
  if (p.length === 3) {
    const n = parseInt(p[2])
    const txt = el.textContent.substring(0, 80)
    console.log(n + ': ' + txt)
  }
})
