import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

function parseLopukhinChapter(html, chapterNum) {
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) return {}

  const ps = Array.from(textDiv.querySelectorAll('p'))
    .map(p => {
      // Extract links before stripping text
      const links = Array.from(p.querySelectorAll('span.link'))
        .map(s => s.textContent.trim())
        .filter(Boolean)
      const text = p.textContent.replace(/\u00A0/g, ' ').trim()
      return { text, links }
    })
    .filter(p => Boolean(p.text))

  const byVerse = {}
  let currentVerses = []
  let currentBody = []
  let currentLinks = []
  let chapterIntro = []

  const save = () => {
    if (currentVerses.length > 0 && currentBody.length > 0) {
      const text = currentBody.join('\n\n').trim()
      if (text) {
        const uniqueLinks = [...new Set(currentLinks)].filter(l => !l.match(/^\d+:\d+$/))
        for (const v of currentVerses) {
          byVerse[v] = {
            authorKey: 'lopukhin',
            authorName: 'Александр Лопухин',
            text,
            ...(uniqueLinks.length > 0 ? { crossReferences: uniqueLinks } : {})
          }
        }
      }
    }
    currentVerses = []
    currentBody = []
    currentLinks = []
  }

  const headerRegex = new RegExp(`^(?:[0-3]?[А-Яа-яЁё]+\\.?\\s*)?${chapterNum}:(\\d+)(?:[−-](\\d+))?\\.?\\s*(.*)$`)

  for (const { text: p, links } of ps) {
    if (/Публикуется с разрешения|ПОДДЕРЖАТЬ СЛУЖЕНИЕ|Обратите внимание|bible\\.by/i.test(p)) {
      continue
    }

    const m = p.match(headerRegex)
    if (m) {
      save()
      const vStart = parseInt(m[1], 10)
      const vEnd = m[2] ? parseInt(m[2], 10) : vStart
      const verses = []
      for (let v = vStart; v <= vEnd; v++) verses.push(v)
      currentVerses = verses
      currentBody = []
      currentLinks = []

      // If the verse header line itself has remaining text (like a quote or phrase)
      const rest = m[3] ? m[3].trim() : ''
      // If rest is not empty and not just punctuation
      if (rest && rest.length > 1) {
        currentBody.push(`«${rest}»`)
      }
    } else if (currentVerses.length > 0) {
      currentBody.push(p)
      currentLinks.push(...links)
    } else {
      chapterIntro.push(p)
    }
  }
  save()

  if (chapterIntro.length > 0) {
    const introText = chapterIntro.join('\n\n').trim()
    if (byVerse[1]) {
      byVerse[1].text = `${introText}\n\n${byVerse[1].text}`
    } else {
      byVerse[1] = {
        authorKey: 'lopukhin',
        authorName: 'Александр Лопухин',
        text: introText
      }
    }
  }

  return byVerse
}

const file1Sam = path.resolve('public/bible/1-samuel/1.json')
const data = JSON.parse(fs.readFileSync(file1Sam, 'utf-8'))

const res = await fetch('https://bible.by/lopuhin-bible/9/1/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
})
const html = await res.text()
const lopukhin = parseLopukhinChapter(html, 1)

for (const v of data.verses) {
  // Deduplicate and filter macdonald
  const macs = (v.commentaries || []).filter(c => c.authorKey === 'macdonald')
  const newComms = []
  if (macs.length > 0) {
    // Merge if multiple
    if (macs.length === 1) {
      newComms.push(macs[0])
    } else {
      const mergedText = macs.map(m => m.text).join('\n\n')
      newComms.push({ ...macs[0], text: mergedText })
    }
  }
  if (lopukhin[v.number]) {
    newComms.push(lopukhin[v.number])
  }
  v.commentaries = newComms
}

console.log('Verse 1 commentaries count:', data.verses[0].commentaries.length)
console.log('Authors in Verse 1:', data.verses[0].commentaries.map(c => c.authorName))
console.log('Verse 1 MacDonald text snippet:', data.verses[0].commentaries[0]?.text.slice(0, 100))
console.log('Verse 1 Lopukhin text snippet:', data.verses[0].commentaries[1]?.text.slice(0, 100))
console.log('Verse 1 Lopukhin crossRefs:', data.verses[0].commentaries[1]?.crossReferences)
