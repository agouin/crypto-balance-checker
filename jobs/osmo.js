const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')
const { Coins } = require('../lib/coins')
const coinMarketCap = require('./coin_market_cap')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking osmo balance for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://mintscan.io/osmosis/account/${address}`)
    console.log('went to mintscan')
    await page.waitForFunction(
      () => !document.querySelector('.Loading_loadingWrapper__120qG')
    )
    await page.waitForTimeout(2000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_osmo.html`), html);
    console.log('done waiting for balance')
    const scrapeRes = await page.evaluate(() => {
      const coins = document.querySelectorAll('.TokenRow_container__1Uu8J')
      const returnValue = []
      for (const coin of coins) {
        const name = coin.querySelector('.TokenRow_assetName__2NUVE').innerText
        const values = coin.querySelectorAll('.TokenRow_value__KiHzz')
        const balance = parseFloat(
         values[0].innerText.replace(/\$|,|\s+/g, '')
        )
        const value = parseFloat(
          values[1].children[0].innerText.replace(/≈|\$|,|\s+/g, '')
        )
        const exchange_rate_usd_text = parseFloat(coin
          .querySelector('.TokenRow_price__16pGz')
          .innerText.replace(/≈|\$|,|\s+/g, ''))
        const exchange_rate_usd = value / balance
        returnValue.push({ name, balance, exchange_rate_usd: (isNaN(exchange_rate_usd) || (exchange_rate_usd === 0 && exchange_rate_usd_text > 0)) ? exchange_rate_usd_text : exchange_rate_usd })
      }
      return returnValue
      // for (const coin of coins) {
      //   const name = coin.querySelector('.TokenCards_name__17j6j').innerText

      //   if (
      //     coin.querySelector('.TokenCards_name__17j6j').innerText === 'OSMO'
      //   ) {
      //     const balance = parseFloat(
      //       coin
      //         .querySelector('.TokenCards_prices__160oH')
      //         .innerText.replace(/\$|,|\s+/g, '')
      //     )
      //     const value = parseFloat(
      //       coin
      //         .querySelector('.TokenCards_value__30Xey')
      //         .innerText.replace(/≈|\$|,|\s+/g, '')
      //     )
      //     const exchange_rate_usd = value / balance
      //     return { balance, exchange_rate_usd }
      //   }
      // }
      // return 0
    })
    console.log({scrapeRes})
    if (scrapeRes) {
      for (const coin of scrapeRes) {
        const { name, balance, exchange_rate_usd } = coin
        if (isNaN(balance) || balance == 0) continue
        const normalizedName = name === 'OSMO' ? 'osmosis': name.toLowerCase()
        const found = await Coin.query().where({
          name: normalizedName,
          address,
        })

        if (found.length === 0) {
          await Coin.query().insert({
            name: normalizedName,
            address,
            balance,
            exchange_rate_usd,
            explorer_same_as: 'osmosis',
          })
        } else {
          await Coin.query()
            .update({ balance, exchange_rate_usd, updated_at: new Date() })
            .where({ name: normalizedName, address })
        }

        if (Coins[normalizedName] && Coins[normalizedName].coinMarketCapName) {
          await coinMarketCap(Coins[normalizedName].coinMarketCapName, normalizedName)
        }

        console.log('updated balance', { name: normalizedName, balance, exchange_rate_usd })
      }
    }
  })
}

module.exports = updateBalance
