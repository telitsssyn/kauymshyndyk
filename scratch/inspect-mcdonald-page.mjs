import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/mcdonald/40/1/')
const html = await res.text()
const dom = new JSDOM(html)
console.log('Title:', dom.window.document.title)
const h1 = dom.window.document.querySelector('h1')
console.log('H1:', h1?.textContent)

// Let's find commentary blocks
const paragraphs = dom.window.document.querySelectorAll('p, div.commentary, .comm-text')
console.log('Total paragraphs:', paragraphs.length)
for (let i = 0; i < Math.min(paragraphs.length, 10); i++) {
  const p = paragraphs[i]
  console.log(`P${i} [${p.className}]:`, p.textContent.slice(0, 80))
}
