const r1 = await fetch('https://bible.by/geneva-bible/')
const h1 = await r1.text()
console.log('Geneva links:', (h1.match(/href="\/geneva-bible\/[^"]*"/gi) || []).slice(0, 10))

const r2 = await fetch('https://bible.by/mcdonald/')
const h2 = await r2.text()
console.log('McDonald links:', (h2.match(/href="\/mcdonald\/[^"]*"/gi) || []).slice(0, 10))
