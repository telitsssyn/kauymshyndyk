import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/lopuhin-bible/1/1/')
const html = await res.text()
const dom = new JSDOM(html)
const ps = Array.from(dom.window.document.querySelectorAll('.text p')).slice(0, 10)
ps.forEach((p, i) => {
  console.log(`\n--- [${i}] ---`)
  console.log('HTML:', p.innerHTML)
  console.log('TEXT:', p.textContent.trim())
})
