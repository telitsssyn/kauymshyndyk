import { JSDOM } from 'jsdom';

async function test() {
  const r = await fetch('https://www.bible.com/bible/400/EXO.1.SYNO');
  const t = await r.text();
  const dom = new JSDOM(t);
  const verses = dom.window.document.querySelectorAll('[data-usfm]');
  const result = {};
  verses.forEach(v => {
    const usfm = v.getAttribute('data-usfm');
    const content = v.textContent;
    if (!result[usfm]) result[usfm] = '';
    result[usfm] += content + ' ';
  });
  console.log(JSON.stringify(result, null, 2));
}
test();
