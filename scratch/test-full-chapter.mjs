import { JSDOM } from 'jsdom'

// Test fetching full chapter (RST + CARS + Geneva + McDonald)
async function testFullExodus1() {
  const [rstHtml, carsHtml, genHtml, mcdHtml] = await Promise.all([
    fetch('https://www.bible.com/bible/400/EXO.1.SYNO').then(r => r.text()),
    fetch('https://www.bible.com/bible/385/EXO.1.CARS').then(r => r.text()),
    fetch('https://bible.by/geneva-bible/2/1/').then(r => r.text()),
    fetch('https://bible.by/mcdonald/2/1/').then(r => r.text()),
  ])

  // Parse texts
  function parseVerses(html) {
    const dom = new JSDOM(html)
    const res = {}
    dom.window.document.querySelectorAll('[data-usfm]').forEach(el => {
      const parts = el.getAttribute('data-usfm').split('.')
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10)
        if (isNaN(num)) return
        const clone = el.cloneNode(true)
        clone.querySelectorAll('[class*="__label"], [class*="__note"]').forEach(n => n.remove())
        const text = (clone.textContent || '').replace(/^#\s*/, '').replace(/\s+/g, ' ').trim()
        if (text) res[num] = (res[num] ? res[num] + ' ' : '') + text
      }
    })
    return res
  }

  const rst = parseVerses(rstHtml)
  const cars = parseVerses(carsHtml)

  // Parse commentaries
  function parseComments(html, authorKey, authorName) {
    const dom = new JSDOM(html)
    const textDiv = dom.window.document.querySelector('.text')
    const byVerse = {}
    if (!textDiv) return byVerse

    let currentVerses = []
    let currentTitle = ''
    let currentBody = []

    const save = () => {
      if (currentVerses.length > 0 && currentBody.length > 0) {
        const text = currentBody.join('\n\n')
        for (const v of currentVerses) {
          if (!byVerse[v]) byVerse[v] = []
          byVerse[v].push({
            authorKey,
            authorName,
            ...(currentTitle ? { title: currentTitle } : {}),
            text,
          })
        }
      }
      currentVerses = []
      currentTitle = ''
      currentBody = []
    }

    for (const p of textDiv.querySelectorAll('p')) {
      const pText = p.textContent.trim()
      if (!pText) continue

      // Check section header (for McDonald)
      if (/^[I|V|X|A-ZА-ЯЁ]\.\s+/.test(pText)) {
        save()
        currentTitle = pText
        continue
      }

      // Check verse ref: "1:5", "1:1-7", "1:1−7", "5" etc.
      const m = pText.match(/^(?:(\d+):)?(\d+)(?:[−-](\d+))?\s+(.*)$/)
      if (m && (!m[1] || parseInt(m[1], 10) === 1)) {
        save()
        const start = parseInt(m[2], 10)
        currentVerses = [start]
        let rest = m[4]
        const periodIdx = rest.indexOf('.')
        if (periodIdx > 0 && periodIdx < 40 && !currentTitle) {
          currentTitle = rest.slice(0, periodIdx).trim()
          rest = rest.slice(periodIdx + 1).trim()
        }
        currentBody = [rest || m[4]]
      } else if (currentVerses.length > 0) {
        currentBody.push(pText)
      }
    }
    save()
    return byVerse
  }

  const geneva = parseComments(genHtml, 'geneva', 'Женевская учебная Библия')
  const mcd = parseComments(mcdHtml, 'macdonald', 'Уильям МакДональд')

  const allNums = [...new Set([...Object.keys(rst), ...Object.keys(cars)])].map(Number).sort((a,b)=>a-b)
  const fullVerses = allNums.map(num => ({
    number: num,
    text: {
      rst: rst[num] || '',
      cars: cars[num] || '',
    },
    commentaries: [
      ...(mcd[num] || []),
      ...(geneva[num] || []),
    ]
  }))

  console.log(`Verses: ${fullVerses.length}`)
  console.log(`Verses with commentaries: ${fullVerses.filter(v => v.commentaries.length > 0).length}`)
  console.log('Verse 1:', JSON.stringify(fullVerses[0], null, 2))
}

await testFullExodus1()
