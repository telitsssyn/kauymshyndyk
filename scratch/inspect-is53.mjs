import { JSDOM } from 'jsdom'

const url = 'https://bible.by/lopuhin-bible/23/53/'
const res = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
})
const html = await res.text()
const dom = new JSDOM(html)
const textDiv = dom.window.document.querySelector('.text')
const ps = Array.from(textDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean)
console.log('Isaiah 53 paragraphs 0..10:')
ps.slice(0, 10).forEach((p, i) => console.log(`[${i}] ${p}`))
