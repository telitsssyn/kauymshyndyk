import { JSDOM } from 'jsdom'

const testChapters = [
  { slug: 'genesis', id: 1, ch: 1 },
  { slug: 'psalms', id: 19, ch: 23 },
  { slug: 'isaiah', id: 23, ch: 53 },
  { slug: 'matthew', id: 40, ch: 5 },
  { slug: 'john', id: 43, ch: 1 },
  { slug: 'romans', id: 52, ch: 8 },
  { slug: 'revelation', id: 66, ch: 1 },
]

for (const tc of testChapters) {
  const url = `https://bible.by/lopuhin-bible/${tc.id}/${tc.ch}/`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  })
  const html = await res.text()
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) {
    console.log(`[${tc.slug} ${tc.ch}] No .text div!`)
    continue
  }
  const ps = Array.from(textDiv.querySelectorAll('p')).map(p => p.textContent.trim()).filter(Boolean)
  console.log(`\n=== ${tc.slug} ${tc.ch} (${ps.length} paragraphs) ===`)
  console.log('First 4 paragraphs:')
  ps.slice(0, 4).forEach((p, i) => console.log(`  [${i}] ${p.slice(0, 100)}...`))
  console.log('Last 2 paragraphs:')
  ps.slice(-2).forEach((p, i) => console.log(`  [-${2-i}] ${p.slice(0, 100)}...`))
}
