const runWithPuppeteer = require('./common')
//const fs = require('fs')
//const path = require('path')
const Coin = require('../db/model/Coin')
const { Coins } = require('../lib/coins')
const coinMarketCap = require('./coin_market_cap')

//const tmpPath = path.join(__dirname, '..', 'tmp')

const updateBalance = async (address) => {
  console.log('checking ethereum balances for', address)
  await runWithPuppeteer(async (page) => {
    await page.goto(`https://etherscan.io/address/${address}`)
    console.log('went to etherscan')
    await page.waitForTimeout(5000)
    //const html = await page.content();
    //fs.writeFileSync(path.join(tmpPath, `${Date.now()}_eth.html`), html);
    console.log('done waiting for balances')
    const scrapeRes = await page.evaluate(() => {
      const balance = parseFloat(
        document.querySelector(
          '#ContentPlaceHolder1_divSummary .card-body .col-md-8'
        ).innerText
      )
      const exchange_rate_usd = parseFloat(
        document
          .querySelector('#ethPrice span')
          .innerText.replace(/,|Eth|\:|\s+|\$/g, '')
      )
      const coins = document.querySelectorAll('.list-custom-ERC20')
      const erc20_balances = []
      for (const coin of coins) {
        const nameSelector = coin.querySelector('span.list-name')
        if (!nameSelector) continue
        const name = nameSelector.innerText
        const tokenSelector = coin.querySelector('span.list-amount')
        if (!tokenSelector) continue
        const token = tokenSelector.innerText
        const valueSelector = coin.querySelector('span.list-usd-value')
        if (!valueSelector) continue
        const value_usd = valueSelector.innerText
        const exchangeRateSelector = coin.querySelector('span.list-usd-rate')
        if (!exchangeRateSelector) continue
        const exchange_rate_usd = exchangeRateSelector.innerText
        erc20_balances.push({ name, token, exchange_rate_usd, value_usd })
      }

      return {
        balance,
        exchange_rate_usd,
        erc20_balances,
      }
    })
    console.log({ scrapeRes })
    if (scrapeRes) {
      const { balance, exchange_rate_usd, erc20_balances } = scrapeRes
      await Coin.query()
        .update({ balance, exchange_rate_usd, updated_at: new Date() })
        .where({ address, name: 'ethereum' })
      console.log('updated balance', { balance, exchange_rate_usd })
      for (const erc20 of erc20_balances) {
        const normalizedName = erc20.name.match(/\((.*?)\)/)[1].toLowerCase()
        
        const balance = parseFloat(erc20.token.replace(/,/g, ''))
        
        const value_usd = parseFloat(
          erc20.value_usd.replace(/,|@|\$/g, '')
        )
        const exchange_rate_usd = value_usd / balance

        if (isNaN(exchange_rate_usd) || !exchange_rate_usd) continue

        const found = await Coin.query().where({
          name: normalizedName,
          address,
        })

        if (found.length === 0) {
          await Coin.query().insert({
            name: normalizedName,
            address,
            explorer_same_as: 'ethereum',
            balance,
            exchange_rate_usd,
          })
        } else {
          await Coin.query()
            .update({ balance, exchange_rate_usd, updated_at: new Date() })
            .where({ name: normalizedName, address })
        }
        if (Coins[normalizedName] && Coins[normalizedName].coinMarketCapName) {
          await coinMarketCap(Coins[normalizedName].coinMarketCapName, normalizedName)
        }
      }
    }
  })
}

module.exports = updateBalance
