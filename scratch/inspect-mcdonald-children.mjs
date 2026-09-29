import { JSDOM } from 'jsdom'

const res = await fetch('https://bible.by/mcdonald/2/1/')
const html = await res.text()
const dom = new JSDOM(html)
const textDiv = dom.window.document.querySelector('.text')
if (textDiv) {
  for (const child of textDiv.children) {
    console.log(child.tagName, child.className, child.textContent.slice(0, 60))
  }
}
