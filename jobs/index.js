const Coin = require('../db/model/Coin')
const cosmos = require('./atom')
const osmosis = require('./osmo')
const eth = require('./eth')
const bitcoin = require('./bitcoin')
const coinMarketCap = require('./coin_market_cap')
const nem = require('./nem')
const cardano = require('./cardano')
const algorand = require('./algorand')
const stellar = require('./stellar')
const doge = require('./doge')

var jobInterval

var jobsRunning = false

const pendingJobs = []

const scrapeOutOfBand = async (name, address, getIo) => {
  if (jobsRunning) pendingJobs.push({name, address})
  else {
    jobsRunning = true
    await scrapeWallet(name, address)
    emitUpdate(getIo)
    jobsRunning = false
  }
}

const emitUpdate = getIo => {
  const io = getIo()
  if (!io) {
    console.error('No io')
    return
  }
  io.emit('balances')
  console.log('Emitted updated balances')
}

const scrapeWallet = async (name, address, addToCoinMarketCapJobs) => {
  const handleCoinMarketCapCoin = async (name) => {
    if (addToCoinMarketCapJobs) addToCoinMarketCapJobs(name)
    else await coinMarketCap(name)
  }

  switch (name) {
    case 'cosmos':
      try {
        await cosmos(address)
      } catch (err) {
        console.error('Error scraping cosmos', err)
      }
      break
    case 'osmosis':
      try {
        await osmosis(address)
      } catch (err) {
        console.error('Error scraping osmosis', err)
      }
      break
    case 'ethereum':
      try {
        await eth(address)
      } catch (err) {
        console.error('Error scraping ethereum', err)
      }
      break
    case 'bitcoin':
      await handleCoinMarketCapCoin(name)
      try {
        await bitcoin(address)
      } catch (err) {
        console.error('Error scraping bitcoin', err)
      }
      break
    case 'beam':
      await handleCoinMarketCapCoin(name)
      break
    case 'conceal':
      await handleCoinMarketCapCoin(name)
      break
    case 'cardano':
      await handleCoinMarketCapCoin(name)
      try {
        await cardano(address)
      } catch(err) {
        console.error('Error scraping cardano', err)
      }
      break
    case 'monero':
      await handleCoinMarketCapCoin(name)
      break
    case 'nem':
      await handleCoinMarketCapCoin(name)
      try {
        await nem(address)
      } catch(err) {
        console.log('Error scraping nem', err)
      }
      break
    case 'algorand':
      await handleCoinMarketCapCoin(name)
      try {
        await algorand(address)
      } catch(err) {
        console.log('Error scraping algorand', err)
      }
      break
    case 'stellar':
      await handleCoinMarketCapCoin(name)
      try {
        await stellar(address)
      } catch(err) {
        console.log('Error scraping stellar', err)
      }
      break
    case 'dogecoin':
      await handleCoinMarketCapCoin(name)
      try {
        await doge(address)
      } catch(err) {
        console.log('Error scraping doge', err)
      }
      break
    default:
      break
  }
}

const runJobs = async (getIo) => {
  if (jobsRunning) {
    console.log('Skipping jobs this time because previous run is still in progress')
    return
  }
  jobsRunning = true
  
  const wallets = await Coin.query()
  const coinMarketCapsToRun = []

  const addToCoinMarketCapJobs = name => {
    if (coinMarketCapsToRun.indexOf(name) === -1) coinMarketCapsToRun.push(name)
  }

  for (const wallet of wallets) {
    await scrapeWallet(wallet.name, wallet.address, addToCoinMarketCapJobs)
  }
  for (const coinMarketCapToRun of coinMarketCapsToRun) {
    try {
      await coinMarketCap(coinMarketCapToRun)
    } catch (err) {
      console.error('Error scraping', err)
    }
  }

  
  while (pendingJobs.length > 0) {
    const { name, address } = pendingJobs.shift()
    await scrapeWallet(name, address)
  }

  emitUpdate(getIo)

  jobsRunning = false
}

const scheduleJobs = (getIo) => {
  runJobs(getIo)
  clearInterval(jobInterval)
  //jobInterval = setInterval(runJobs, 20 * 1000)
  jobInterval = setInterval(runJobs.bind(this, getIo), 60 * 1000 * 5) // every 5 minutes
}

module.exports = { scheduleJobs, scrapeOutOfBand }