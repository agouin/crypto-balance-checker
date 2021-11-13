const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking algo balance for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://algoexplorer.io/address/${address}`)
    console.log('went to algoexplorer')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_nem.html`), html);
    console.log('done waiting for balance')
    const scrapeRes = await page.evaluate(() => {
      const balance = parseFloat(document.querySelectorAll('.paper-card-intern')[1].querySelector('.paper-value').innerText.replace(/\$|BTC|,|\s+/g, ''))
      return { balance }
    })
    //console.log({scrapeRes})
    if (scrapeRes) {
      const { balance } = scrapeRes
      await Coin.query()
        .update({ balance, updated_at: new Date() })
        .where({ address, name: 'algorand' })
      console.log('updated algo balance', { balance })
    }
  })
}

module.exports = updateBalance
