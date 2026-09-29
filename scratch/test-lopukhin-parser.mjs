import { JSDOM } from 'jsdom'

const testCases = [
  { slug: 'genesis', id: 1, ch: 1 },
  { slug: '1-samuel', id: 9, ch: 1 },
  { slug: 'matthew', id: 40, ch: 1 },
  { slug: 'romans', id: 52, ch: 1 },
  { slug: 'psalms', id: 19, ch: 1 },
]

for (const tc of testCases) {
  const url = `https://bible.by/lopuhin-bible/${tc.id}/${tc.ch}/`
  const res = await fetch(url)
  console.log(`\n=== ${tc.slug} ${tc.ch} (Status: ${res.status}) ===`)
  if (!res.ok) continue
  const html = await res.text()
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) {
    console.log('No .text div')
    continue
  }
  const ps = Array.from(textDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean)
  console.log(`Total paragraphs: ${ps.length}`)
  // Find lines that look like verse headings
  const verseLines = ps.filter(p => {
    // Look for patterns like "Быт 1:1.", "1Цар 1:1.", "Мф 1:1.", "1:1." or starts with book name + chapter:verse
    return /^(?:[0-3]?[А-Яа-яЁё]+\.?\s*)?\d+:\d+/.test(p)
  })
  console.log(`Detected verse headers: ${verseLines.length}`)
  console.log('Sample verse headers:', verseLines.slice(0, 5))
}
