import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/geneva-bible/2/1/')
const html = await res.text()
const dom = new JSDOM(html)
console.log('--- GENEVA 2/1 ---')
console.log('Title:', dom.window.document.title)
const content = dom.window.document.querySelector('.content, .text, article, #content, .reading-content')
console.log('Main container:', content?.className || 'not found by selector')

// Let's inspect all elements that contain verse numbers or comments
const allP = dom.window.document.querySelectorAll('p')
for (let i = 0; i < Math.min(allP.length, 15); i++) {
  console.log(`P${i}:`, allP[i].textContent.trim().slice(0, 100))
}
