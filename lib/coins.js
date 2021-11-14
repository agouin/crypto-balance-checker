const Coins = {
  cosmos: {
    label: 'Cosmos (ATOM)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://www.mintscan.io/cosmos/account/',
    img: true
  },
  ethereum: {
    label: 'Ethereum (ETH)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  osmosis: {
    label: 'Osmosis (OSMO)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://www.mintscan.io/osmosis/account/',
    img: true
  },
  bitcoin: {
    label: 'Bitcoin (BTC)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://blockchair.com/bitcoin/address/',
    img: true
  },
  beam: {
    label: 'Beam (BEAM)',
    canDetermineBalanceFromAddress: false,
    img: true
  },
  xrp: {
    label: 'Ripple (XRP)',
    canDetermineBalanceFromAddress: false,
    img: true
  },
  conceal: {
    label: 'Conceal (CCX)',
    canDetermineBalanceFromAddress: false,
    img: true
  },
  cardano: {
    label: 'Cardano (ADA)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://cardanoscan.io/address/',
    img: true
  },
  monero: {
    label: 'Monero (XMR)',
    canDetermineBalanceFromAddress: false,
    img: true
  },
  mad: {
    label: 'MADNetwork Token (MAD)',
    hideAdd: true,
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  shib: {
    label: 'Shiba Inu Token (SHIB)',
    hideAdd: true,
    coinMarketCapName: 'shiba-inu',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  coval: {
    label: 'Circuits of Value Token (COVAL)',
    hideAdd: true,
    coinMarketCapName: 'circuits-of-value',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  foam: {
    label: 'FOAM Token (FOAM)',
    hideAdd: true,
    coinMarketCapName: 'foam',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  link: {
    label: 'ChainLink Token (LINK)',
    hideAdd: true,
    coinMarketCapName: 'chainlink',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  lrc: {
    label: 'Loopring Coin Token (LRC)',
    hideAdd: true,
    coinMarketCapName: 'loopring',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  zrx: {
    label: '0x Token (ZRX)',
    hideAdd: true,
    coinMarketCapName: '0x',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  grt: {
    label: 'Graph Token (GRT)',
    hideAdd: true,
    coinMarketCapName: 'the-graph',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  nem: {
    label: 'NEM (XEM)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://explorer.nemtool.com/#/s_account?account=',
    img: true
  },
  luna: {
    label: 'Terra (LUNA)',
    hideAdd: true,
    coinMarketCapName: 'terra-luna',
    urlPrefix: 'https://www.mintscan.io/osmosis/account/',
    img: true
  },
  lpt: {
    label: 'Livepeer Token (LPT)',
    hideAdd: true,
    coinMarketCapName: 'livepeer',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  omg: {
    label: 'Omise Go (OMG)',
    hideAdd: true,
    coinMarketCapName: 'omg',
    urlPrefix: 'https://etherscan.io/address/',
    img: true
  },
  algorand: {
    label: 'Algorand (ALGO)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://algoexplorer.io/address/',
    img: true
  },
  stellar: {
    label: 'Stellar (XLM)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://blockchair.com/stellar/account/',
    img: true
  },
  polkadot: {
    label: 'Polkadot (DOT)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://blockchair.com/polkadot/account/',
    img: true
  },
  dogecoin: {
    label: 'Dogecoin (DOGE)',
    canDetermineBalanceFromAddress: true,
    urlPrefix: 'https://blockchair.com/dogecoin/account/',
    img: true
  }
}

module.exports = { Coins }