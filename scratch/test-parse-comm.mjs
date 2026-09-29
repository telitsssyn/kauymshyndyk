import { JSDOM } from 'jsdom'

async function parseCommentaries(bookNum, chapterNum) {
  // Geneva
  const genevaUrl = `https://bible.by/geneva-bible/${bookNum}/${chapterNum}/`
  const genRes = await fetch(genevaUrl)
  const genHtml = await genRes.text()
  const genDom = new JSDOM(genHtml)
  const genText = genDom.window.document.querySelector('.text')
  
  const genevaByVerse = {}
  if (genText) {
    let currentVerses = []
    let currentTitle = ''
    let currentBody = []
    
    const saveCurrent = () => {
      if (currentVerses.length > 0 && currentBody.length > 0) {
        const text = currentBody.join('\n\n')
        for (const v of currentVerses) {
          if (!genevaByVerse[v]) genevaByVerse[v] = []
          genevaByVerse[v].push({
            authorKey: 'geneva',
            authorName: 'Женевская учебная Библия',
            title: currentTitle || undefined,
            text,
          })
        }
      }
      currentVerses = []
      currentTitle = ''
      currentBody = []
    }
    
    for (const p of genText.querySelectorAll('p')) {
      const pText = p.textContent.trim()
      if (!pText) continue
      
      // Match "1:5", "1:1-7", "1:1−7", "5" etc.
      // E.g. ^(?:(\d+):)?(\d+)(?:[−-](\d+))?\s*(.*)$
      const m = pText.match(/^(?:(\d+):)?(\d+)(?:[−-](\d+))?\s+(.*)$/)
      if (m && (!m[1] || parseInt(m[1], 10) === chapterNum)) {
        saveCurrent()
        const start = parseInt(m[2], 10)
        const end = m[3] ? parseInt(m[3], 10) : start
        // Only attach to first verse of range or all? Usually start verse
        currentVerses = [start]
        
        let rest = m[4]
        // Maybe has a title like "семьдесят. См. Быт..."
        const periodIdx = rest.indexOf('.')
        if (periodIdx > 0 && periodIdx < 40) {
          currentTitle = rest.slice(0, periodIdx).trim()
          rest = rest.slice(periodIdx + 1).trim()
        }
        currentBody = [rest || m[4]]
      } else if (currentVerses.length > 0) {
        currentBody.push(pText)
      }
    }
    saveCurrent()
  }
  
  // McDonald
  const mcdUrl = `https://bible.by/mcdonald/${bookNum}/${chapterNum}/`
  const mcdRes = await fetch(mcdUrl)
  const mcdHtml = await mcdRes.text()
  const mcdDom = new JSDOM(mcdHtml)
  const mcdText = mcdDom.window.document.querySelector('.text')
  
  const mcdByVerse = {}
  if (mcdText) {
    let currentVerses = []
    let currentTitle = ''
    let currentBody = []
    
    const saveCurrent = () => {
      if (currentVerses.length > 0 && currentBody.length > 0) {
        const text = currentBody.join('\n\n')
        for (const v of currentVerses) {
          if (!mcdByVerse[v]) mcdByVerse[v] = []
          mcdByVerse[v].push({
            authorKey: 'macdonald',
            authorName: 'Уильям МакДональд',
            title: currentTitle || undefined,
            text,
          })
        }
      }
      currentVerses = []
      currentTitle = ''
      currentBody = []
    }
    
    for (const p of mcdText.querySelectorAll('p')) {
      const pText = p.textContent.trim()
      if (!pText) continue
      
      const m = pText.match(/^(?:(\d+):)?(\d+)(?:[−-](\d+))?\s+(.*)$/)
      if (m && (!m[1] || parseInt(m[1], 10) === chapterNum)) {
        saveCurrent()
        const start = parseInt(m[2], 10)
        currentVerses = [start]
        currentBody = [m[4]]
      } else if (/^[I|V|X|A-ZА-ЯЁ]\.\s+/.test(pText)) {
        // Section header like "I. ИЗРАИЛЬ В ЕГИПЕТСКОМ РАБСТВЕ"
        saveCurrent()
        currentTitle = pText
      } else if (currentVerses.length > 0) {
        currentBody.push(pText)
      }
    }
    saveCurrent()
  }
  
  console.log('Geneva verses with comms:', Object.keys(genevaByVerse))
  console.log('McDonald verses with comms:', Object.keys(mcdByVerse))
  console.log('Exodus 1:1 Geneva:', genevaByVerse[1])
  console.log('Exodus 1:1 McDonald:', mcdByVerse[1])
}

await parseCommentaries(2, 1)
