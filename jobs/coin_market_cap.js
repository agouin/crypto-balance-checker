const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (name) => {
  console.log(`checking ${name} exchange rate`)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://coinmarketcap.com/currencies/${name}`)
    console.log('went to coinmarketcap')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_beam.html`), html);
    console.log('done waiting for exchange_rate')
    const scrapeRes = await page.evaluate(() =>
      parseFloat(
        document.querySelector('.priceValue').innerText.replace(/\$|,|\s+/g, '')
      )
    )
    if (scrapeRes) {
      const exchange_rate_usd = scrapeRes
      await Coin.query()
        .update({ exchange_rate_usd, updated_at: new Date() })
        .where({ name })
      console.log('updated balance', { exchange_rate_usd })
    }
  })
}

module.exports = updateBalance
