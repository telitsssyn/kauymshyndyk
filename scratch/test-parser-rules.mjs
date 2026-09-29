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

  // Regex for verse header:
  // e.g. "Быт 1:1. В начале", "1Цар 1:3. И ходил", "Ис 53:1. [Господи!]", "1:5. Текст", "1:1-3. Текст"
  const headerRegex = new RegExp(`^(?:[0-3]?[А-Яа-яЁё]+\\.?\\s*)?${chapterNum}:(\\d+)(?:[−-](\\d+))?\\.?\\s*(.*)$`)

  for (const p of ps) {
    // Ignore footer/ads/copyrights
    if (/Публикуется с разрешения|ПОДДЕРЖАТЬ СЛУЖЕНИЕ|Обратите внимание|bible\.by/i.test(p)) {
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

  // If there is chapter intro and verse 1 exists, prepend intro to verse 1 or keep as intro
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

const testCases = [
  { slug: 'genesis', id: 1, ch: 1 },
  { slug: '1-samuel', id: 9, ch: 1 },
  { slug: 'isaiah', id: 23, ch: 53 },
  { slug: 'matthew', id: 40, ch: 5 },
  { slug: 'john', id: 43, ch: 1 },
  { slug: 'romans', id: 52, ch: 8 },
]

for (const tc of testCases) {
  const url = `https://bible.by/lopuhin-bible/${tc.id}/${tc.ch}/`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
  })
  const html = await res.text()
  const result = parseLopukhinChapter(html, tc.ch)
  const verseNums = Object.keys(result).map(Number).sort((a,b)=>a-b)
  console.log(`\n${tc.slug} ${tc.ch}: Parsed ${verseNums.length} verses with commentary`)
  console.log(`Verses covered: ${verseNums.slice(0, 10).join(', ')}... ${verseNums.slice(-5).join(', ')}`)
  console.log(`Verse 1 commentary preview: ${result[1][0].slice(0, 150)}...`)
}
