import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/lopuhin-bible/9/1/')
console.log('Status:', res.status)
const html = await res.text()
const dom = new JSDOM(html)
const textDiv = dom.window.document.querySelector('.text')
if (textDiv) {
  const ps = Array.from(textDiv.querySelectorAll('p')).slice(0, 15).map(p => p.textContent.trim())
  console.log('1 Samuel 1 sample paragraphs:')
  ps.forEach((p, i) => console.log(`[${i}] ${p}`))
}
