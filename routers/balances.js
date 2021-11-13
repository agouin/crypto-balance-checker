const Router = require('@koa/router')
const Coin = require('../db/model/Coin')

const getRouter = (jobs, getIo) => {
  const router = new Router({ prefix: '/balances' })

  const getValue = (record) => {
    if (!record) return 0
    const { exchange_rate_usd, balance } = record
    if (
      exchange_rate_usd == null ||
      balance == null ||
      isNaN(exchange_rate_usd) ||
      isNaN(balance)
    )
      return 0
    const value = balance * exchange_rate_usd
    if (typeof value !== 'number') return 0
    return value
  }

  router.get('/', async (ctx) => {
    console.log('got request for all balances')
    const balances = (await Coin.query()).sort(
      (b, a) => getValue(a) - getValue(b)
    )
    let total = 0
    for (const { exchange_rate_usd, balance } of balances) {
      const addition = exchange_rate_usd * balance
      if (!isNaN(addition)) total += addition
    }
    ctx.body = {
      balances,
      total,
    }
  })

  router.post('/:id', async (ctx) => {
    const { id } = ctx.params
    console.log('id', id)
    const coin = await Coin.query().findById(id)
    if (!coin) {
      ctx.status = 404
      ctx.body = 'Does not exist'
      return
    }

    const { balance } = ctx.request.body
    try {
      await Coin.query().findById(id).patch({ balance })

      ctx.status = 200
      ctx.body = 'OK'
    } catch (err) {
      ctx.status = 500
      ctx.body = `Error updating balance: ${err}`
      return
    }
  })

  router.delete('/:id', async (ctx) => {
    const { id } = ctx.params
    console.log('id', id)
    const coin = await Coin.query().findById(id)
    if (!coin) {
      ctx.status = 404
      ctx.body = 'Does not exist'
      return
    }

    try {
      await Coin.query().deleteById(id)
      ctx.status = 200
      ctx.body = 'OK'
    } catch (err) {
      ctx.status = 500
      ctx.body = `Error deleting wallet: ${err}`
      return
    }
  })

  router.delete('/', async (ctx) => {
    const ids = ctx.request.body
    console.log('ids', ids)

    try {
      await Coin.query().delete().whereIn('id', ids)
      ctx.status = 200
      ctx.body = 'OK'
    } catch (err) {
      ctx.status = 500
      ctx.body = `Error deleting wallets: ${err}`
      return
    }
  })

  router.post('/', async (ctx) => {
    console.log('insert wallet', ctx.request.body)
    const newWallet = await Coin.query().insert(ctx.request.body)
    jobs.scrapeOutOfBand(newWallet.name, newWallet.address, getIo)
    ctx.body = newWallet.id
  })

  return router
}

module.exports = { getRouter }
