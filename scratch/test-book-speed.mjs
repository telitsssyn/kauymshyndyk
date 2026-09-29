import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

function parseLopukhinChapter(html, chapterNum) {
  const dom = new JSDOM(html)
  const textDiv = dom.window.document.querySelector('.text')
  if (!textDiv) return {}

  const ps = Array.from(textDiv.querySelectorAll('p'))
    .map(p => p.textContent.replace(/\u00A0/g, ' ').trim())
    .filter(Boolean)

  const byVerse = {}
  let currentVerses = []
  let currentBody = []
  let chapterIntro = []

  const save = () => {
    if (currentVerses.length > 0 && currentBody.length > 0) {
      const text = currentBody.join('\n\n').trim()
      if (text) {
        for (const v of currentVerses) {
          if (!byVerse[v]) byVerse[v] = []
          byVerse[v].push(text)
        }
      }
    }
    currentVerses = []
    currentBody = []
  }

  const headerRegex = new RegExp(`^(?:[0-3]?[А-Яа-яЁё]+\\.?\\s*)?${chapterNum}:(\\d+)(?:[−-](\\d+))?\\.?\\s*(.*)$`)

  for (const p of ps) {
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
    } else if (currentVerses.length > 0) {
      currentBody.push(p)
    } else {
      chapterIntro.push(p)
    }
  }
  save()

  if (chapterIntro.length > 0) {
    const introText = chapterIntro.join('\n\n').trim()
    if (byVerse[1]) {
      byVerse[1][0] = `${introText}\n\n${byVerse[1][0]}`
    } else {
      byVerse[1] = [introText]
    }
  }

  return byVerse
}

async function testBook(slug, bibleById, totalChapters) {
  console.log(`Starting ${slug} (${totalChapters} chapters)...`)
  const start = Date.now()
  let totalVersesWithComm = 0

  // 5 parallel requests
  const concurrency = 6
  const chapters = Array.from({ length: totalChapters }, (_, i) => i + 1)
  
  for (let i = 0; i < chapters.length; i += concurrency) {
    const chunk = chapters.slice(i, i + concurrency)
    await Promise.all(chunk.map(async (ch) => {
      const url = `https://bible.by/lopuhin-bible/${bibleById}/${ch}/`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        }
      })
      if (res.ok) {
        const html = await res.text()
        const parsed = parseLopukhinChapter(html, ch)
        totalVersesWithComm += Object.keys(parsed).length
      }
    }))
  }

  console.log(`Finished ${slug} in ${(Date.now() - start) / 1000}s! Total verses with Lopukhin: ${totalVersesWithComm}`)
}

await testBook('romans', 52, 16)
await testBook('genesis', 1, 50)
