const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (name, dbName) => {
  console.log(`checking ${name} exchange rate`)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://coinmarketcap.com/currencies/${name}`)
    console.log('went to coinmarketcap')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_beam.html`), html);
    console.log('done waiting for exchange_rate')
    const scrapeRes = await page.evaluate(() => {
      const priceValueElement = document.querySelector('.priceValue')
      const exchange_rate_usd = parseFloat(
        priceValueElement.innerText.replace(/\$|,|\s+/g, '')
      )
      const last24 = priceValueElement.parentElement.children[1]
      const last_day_percentage = (last24.children[0].className === 'icon-Caret-up' ? 1 : -1) * parseFloat(last24.innerText)
      return { exchange_rate_usd, last_day_percentage }
    })
    if (scrapeRes) {
      const {exchange_rate_usd, last_day_percentage} = scrapeRes
      await Coin.query()
        .update({ exchange_rate_usd, last_day_percentage, updated_at: new Date() })
        .where({ name: dbName ? dbName : name })
      console.log('updated balance', { exchange_rate_usd })
    }
  })
}

module.exports = updateBalance
