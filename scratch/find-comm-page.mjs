const res = await fetch('https://bible.by/commentaries/')
const html = await res.text()
const matches = html.match(/href="([^"]*(?:mcdonald|geneva|zhenev|makdonald)[^"]*)"/gi) || []
console.log('Matches:', [...new Set(matches)])
if (matches.length === 0) {
  const allLinks = html.match(/href="\/commentaries\/[^"]*"/gi) || []
  console.log('All comm links:', [...new Set(allLinks)].slice(0, 30))
}
