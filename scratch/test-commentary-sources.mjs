async function testUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    })
    console.log(url, 'STATUS:', res.status)
    const text = await res.text()
    console.log(url, 'LENGTH:', text.length, 'TITLE:', text.match(/<title>(.*?)<\/title>/i)?.[1])
  } catch (err) {
    console.error(url, 'ERROR:', err.message)
  }
}

await testUrl('https://bible.by/fauth/mcdonald/genesis/1/')
await testUrl('https://bible.by/geneva/book/01/1/')
await testUrl('https://blagovestnik.org/books/macdonald/index.htm')
