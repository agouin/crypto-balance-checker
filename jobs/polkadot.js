const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking dot balance for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://blockchair.com/polkadot/address/${address}`)
    console.log('went to blockchair')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_nem.html`), html);
    console.log('done waiting for balance')
    const scrapeRes = await page.evaluate(() => {
      const spans = document.querySelectorAll('.account-hash__balance__values>span')
      const balance = parseFloat(spans[0].innerText.replace(/\$|XLM|,|\s+/g, ''))
      return { balance }
    })
    //console.log({scrapeRes})
    if (scrapeRes) {
      const { balance } = scrapeRes
      await Coin.query()
        .update({ balance, updated_at: new Date() })
        .where({ address, name: 'polkadot' })
      console.log('updated dot balance', { balance })
    }
  })
}

module.exports = updateBalance
