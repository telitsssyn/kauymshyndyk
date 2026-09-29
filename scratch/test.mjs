import fs from 'fs';

async function test() {
  const r = await fetch('https://www.bible.com/bible/400/EXO.1.SYNO');
  const t = await r.text();
  const match = t.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
  if (match) {
    const data = JSON.parse(match[1]);
    console.log(Object.keys(data.props.pageProps));
    fs.writeFileSync('scratch/data.json', JSON.stringify(data.props.pageProps, null, 2));
  } else {
    console.log('no next data');
  }
}
test();
