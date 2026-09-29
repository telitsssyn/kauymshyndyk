const start = Date.now()
const res = await fetch('https://bible.by/lopuhin-bible/1/1/', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  }
})
console.log('Status:', res.status, 'Time:', Date.now() - start, 'ms')
