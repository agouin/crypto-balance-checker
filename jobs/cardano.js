const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking ada balance for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://cardanoscan.io/address/${address}`)
    console.log('went to cardanoscan')
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_nem.html`), html);
    console.log('done waiting for balance')
    const scrapeRes = await page.evaluate(() => {
      const tableRows = document.querySelectorAll('table>tbody>tr')
      const balance = parseFloat(tableRows[0].querySelectorAll('td')[1].innerText.replace(/\$|₳|,|\s+/g, ''))
      return { balance }
    })
    //console.log({scrapeRes})
    if (scrapeRes) {
      const { balance } = scrapeRes
      await Coin.query()
        .update({ balance, updated_at: new Date() })
        .where({ address, name: 'cardano' })
      console.log('updated ada balance', { balance })
    }
  })
}

module.exports = updateBalance
