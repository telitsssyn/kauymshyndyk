const r1 = await fetch('https://bible.by/geneva-bible/')
const h1 = await r1.text()
const genBooks = [...new Set([...h1.matchAll(/href="\/geneva-bible\/(\d+)\/1\/"/g)].map(m => parseInt(m[1], 10)))].sort((a,b)=>a-b)
console.log('Geneva books on bible.by:', genBooks.length, 'min:', genBooks[0], 'max:', genBooks[genBooks.length-1])

const r2 = await fetch('https://bible.by/mcdonald/')
const h2 = await r2.text()
const mcdBooks = [...new Set([...h2.matchAll(/href="\/mcdonald\/(\d+)\/1\/"/g)].map(m => parseInt(m[1], 10)))].sort((a,b)=>a-b)
console.log('McDonald books on bible.by:', mcdBooks.length, 'min:', mcdBooks[0], 'max:', mcdBooks[mcdBooks.length-1])
