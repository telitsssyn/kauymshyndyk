import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

function parseLopukhinChapter(html, chapterNum) {
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) return {}

  const ps = Array.from(textDiv.querySelectorAll('p'))
    .map(p => {
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

      const rest = m[3] ? m[3].trim() : ''
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

const res = await fetch('https://bible.by/lopuhin-bible/1/1/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
})
const html = await res.text()
const lopukhin = parseLopukhinChapter(html, 1)

console.log('Genesis 1 verses with Lopukhin:', Object.keys(lopukhin).length)
console.log('Verse 1:', lopukhin[1]?.text.slice(0, 200))
console.log('Verse 1 crossRefs:', lopukhin[1]?.crossReferences)
console.log('Verse 2:', lopukhin[2]?.text.slice(0, 200))
