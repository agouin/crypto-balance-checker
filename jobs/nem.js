const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking xem balance for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://explorer.nemtool.com/#/s_account?account=${address}`)
    console.log('went to nemtool')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_nem.html`), html);
    console.log('done waiting for balance')
    const balance = await page.evaluate(() => parseFloat(document.querySelectorAll('tbody tr')[2].querySelectorAll('td')[1].innerText.replace(/\$|,|\s+/g, '')))
    //console.log({scrapeRes})
    if (balance) {
      await Coin.query()
        .update({ balance, updated_at: new Date() })
        .where({ address, name: 'nem' })
      console.log('updated xem balance', { balance })
    }
  })
}

module.exports = updateBalance
