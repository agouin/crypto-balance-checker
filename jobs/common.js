const puppeteer = require('puppeteer')

const runWithPuppeteer = async (pageFunction) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox'],
    executablePath: '/usr/bin/chromium',
    //pipe: true
  })
  console.log('puppeteer launched')
  const page = await browser.newPage()
  console.log("new page opened")
  await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36');
  await page.setViewport({width: 1920, height: 1080});
  await pageFunction(page)
  browser.close()
}

module.exports = runWithPuppeteer