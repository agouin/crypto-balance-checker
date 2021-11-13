const getValue = (record) => {
  if (!record) return 0
  const {exchange_rate_usd, balance} = record
  if (exchange_rate_usd == null || balance == null || isNaN(exchange_rate_usd) || isNaN(balance)) return 0
  const value = balance * exchange_rate_usd
  if (typeof value !== 'number') return 0
  return value
}

module.exports = {
  getValue
}