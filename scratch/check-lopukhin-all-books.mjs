const BIBLE_BY_IDS = {
  'genesis': 1, 'exodus': 2, 'leviticus': 3, 'numbers': 4, 'deuteronomy': 5,
  'joshua': 6, 'judges': 7, 'ruth': 8, '1-samuel': 9, '2-samuel': 10,
  '1-kings': 11, '2-kings': 12, '1-chronicles': 13, '2-chronicles': 14,
  'ezra': 15, 'nehemiah': 16, 'esther': 17, 'job': 18, 'psalms': 19,
  'proverbs': 20, 'ecclesiastes': 21, 'song-of-solomon': 22, 'isaiah': 23,
  'jeremiah': 24, 'lamentations': 25, 'ezekiel': 26, 'daniel': 27,
  'hosea': 28, 'joel': 29, 'amos': 30, 'obadiah': 31, 'jonah': 32,
  'micah': 33, 'nahum': 34, 'habakkuk': 35, 'zephaniah': 36,
  'haggai': 37, 'zechariah': 38, 'malachi': 39,
  'matthew': 40, 'mark': 41, 'luke': 42, 'john': 43, 'acts': 44,
  'james': 45, '1-peter': 46, '2-peter': 47, '1-john': 48, '2-john': 49, '3-john': 50, 'jude': 51,
  'romans': 52, '1-corinthians': 53, '2-corinthians': 54, 'galatians': 55,
  'ephesians': 56, 'philippians': 57, 'colossians': 58,
  '1-thessalonians': 59, '2-thessalonians': 60,
  '1-timothy': 61, '2-timothy': 62, 'titus': 63, 'philemon': 64, 'hebrews': 65,
  'revelation': 66,
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
}

console.log('Checking all 66 books for Lopukhin commentary on bible.by...')

const missing = []
const available = []

for (const [slug, id] of Object.entries(BIBLE_BY_IDS)) {
  const url = `https://bible.by/lopuhin-bible/${id}/1/`
  try {
    const res = await fetch(url, { headers })
    if (res.status === 200) {
      available.push({ slug, id })
    } else {
      missing.push({ slug, id, status: res.status })
    }
  } catch (err) {
    missing.push({ slug, id, error: err.message })
  }
}

console.log(`Available: ${available.length} / 66`)
if (missing.length > 0) {
  console.log('Missing books:', missing)
} else {
  console.log('ALL 66 books are available in Lopukhin on bible.by!')
}
