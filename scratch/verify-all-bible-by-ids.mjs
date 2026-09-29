const BIBLE_BY_IDS = {
  // OT
  'genesis': 1, 'exodus': 2, 'leviticus': 3, 'numbers': 4, 'deuteronomy': 5,
  'joshua': 6, 'judges': 7, 'ruth': 8, '1-samuel': 9, '2-samuel': 10,
  '1-kings': 11, '2-kings': 12, '1-chronicles': 13, '2-chronicles': 14,
  'ezra': 15, 'nehemiah': 16, 'esther': 17, 'job': 18, 'psalms': 19,
  'proverbs': 20, 'ecclesiastes': 21, 'song-of-solomon': 22, 'isaiah': 23,
  'jeremiah': 24, 'lamentations': 25, 'ezekiel': 26, 'daniel': 27,
  'hosea': 28, 'joel': 29, 'amos': 30, 'obadiah': 31, 'jonah': 32,
  'micah': 33, 'nahum': 34, 'habakkuk': 35, 'zephaniah': 36,
  'haggai': 37, 'zechariah': 38, 'malachi': 39,
  // NT Gospels & Acts
  'matthew': 40, 'mark': 41, 'luke': 42, 'john': 43, 'acts': 44,
  // NT General Epistles (Synodal order on bible.by)
  'james': 45, '1-peter': 46, '2-peter': 47, '1-john': 48, '2-john': 49, '3-john': 50, 'jude': 51,
  // NT Paul's Epistles
  'romans': 52, '1-corinthians': 53, '2-corinthians': 54, 'galatians': 55,
  'ephesians': 56, 'philippians': 57, 'colossians': 58,
  '1-thessalonians': 59, '2-thessalonians': 60,
  '1-timothy': 61, '2-timothy': 62, 'titus': 63, 'philemon': 64, 'hebrews': 65,
  // Revelation
  'revelation': 66,
}

for (const [slug, id] of Object.entries(BIBLE_BY_IDS)) {
  const r = await fetch(`https://bible.by/geneva-bible/${id}/1/`)
  const html = await r.text()
  const title = html.match(/<title>(.*?)<\/title>/)?.[1]
  console.log(`${slug} (${id}) -> ${title?.slice(0, 40)}`)
}
