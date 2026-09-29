import { JSDOM } from 'jsdom';

async function test() {
  const r = await fetch('https://www.bible.com/bible/840/EXO.1.CARS');
  const t = await r.text();
  const dom = new JSDOM(t);
  const elements = dom.window.document.querySelectorAll('[data-usfm]');
  const result = {};
  elements.forEach(el => {
    const usfm = el.getAttribute('data-usfm');
    const parts = usfm.split('.');
    if (parts.length === 3) {
      const vNum = parts[2];
      const text = el.textContent.trim(); 
      if (!result[vNum]) result[vNum] = '';
      result[vNum] += text + ' ';
    }
  });
  console.log(result['1'], '\n', result['2']);
}
test();
