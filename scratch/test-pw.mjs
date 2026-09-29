import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://bible.by/macdonald/2/1/');
  const title = await page.title();
  console.log('Title:', title);
  
  await browser.close();
}
run().catch(console.error);
