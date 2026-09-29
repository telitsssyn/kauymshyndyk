const res = await fetch('https://bible.by/')
const html = await res.text()
const matches = html.match(/href="([^"]*(?:comm|mcdonald|geneva|fauth|bcomm)[^"]*)"/gi)
console.log('Matches:', [...new Set(matches)].slice(0, 30))
