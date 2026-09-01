import playwright from 'playwright';

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/');
  await page.waitForTimeout(2000);
  
  // Golden Retriever - mid-jump at 0.25s
  await page.evaluate(() => document.querySelector('.pet-retriever .pet-hit').click());
  await page.waitForTimeout(250);
  await page.screenshot({ path: '/tmp/retriever-midjump.png' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/tmp/retriever-landing.png' });
  
  // Cat - mid-bounce at 0.2s
  await page.waitForTimeout(500);
  await page.evaluate(() => document.querySelector('.pet-cat .pet-hit').click());
  await page.waitForTimeout(200);
  await page.screenshot({ path: '/tmp/cat-midbounce.png' });
  
  // Dachshund - mid-peek at 0.25s
  await page.waitForTimeout(1000);
  await page.evaluate(() => document.querySelector('.pet-doxie .pet-hit').click());
  await page.waitForTimeout(250);
  await page.screenshot({ path: '/tmp/doxie-midpeek.png' });
  
  await browser.close();
  console.log('Screenshots captured!');
})();
