import { Table, Button, Input, message, Popconfirm } from 'antd'
import { GetServerSideProps } from 'next'
import {
  RedoOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import ServerSideAPI from '../lib/api/internal'
import API from '../lib/api/local'
import { useState, useEffect, useRef } from 'react'
import AddCoinModal from '../components/modals/AddCoinModal'
import { Coins } from '../lib/coins'
import classes from './index.module.scss'
import { getValue } from '../lib/utils'
import { io } from 'socket.io-client'

const PoweredBy = [
  { name: 'CoinMarketCap', href: 'https://coinmarketcap.com' },
  { name: 'Mintscan', href: 'https://mintscan.io' },
  { name: 'Blockchair', href: 'https://blockchair.com' },
  { name: 'Etherscan', href: 'https://etherscan.io' },
  { name: 'Cardanoscan', href: 'https://cardanoscan.io' },
  { name: 'AlgoExplorer', href: 'https://algoexplorer.io' },
  { name: 'nem', href: 'https://explorer.nemtool.com' },
]

const timeDifference = (current, previous) => {
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365
  const elapsed = current - previous

  if (elapsed < msPerMinute) return Math.round(elapsed / 1000) + ' seconds ago'
  if (elapsed < msPerHour)
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  if (elapsed < msPerDay) return Math.round(elapsed / msPerHour) + ' hours ago'
  if (elapsed < msPerMonth) return Math.round(elapsed / msPerDay) + ' days ago'
  if (elapsed < msPerYear)
    return Math.round(elapsed / msPerMonth) + ' months ago'
  return Math.round(elapsed / msPerYear) + ' years ago'
}

const toAndString = (input) => {
  if (input.length === 1) return input[0]
  const last = input.pop()
  return input.join(', ') + ', and ' + last
}

const fallbackCopyTextToClipboard = (text) => {
  var textArea = document.createElement('textarea')
  textArea.value = text

  // Avoid scrolling to bottom
  textArea.style.top = '0'
  textArea.style.left = '0'
  textArea.style.position = 'fixed'

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    var successful = document.execCommand('copy')
    var msg = successful ? 'successful' : 'unsuccessful'
    console.log('Fallback: Copying text command was ' + msg)
    message.success('Copied to clipboard')
  } catch (err) {
    message.error('Error copying to clipboard')
    console.error('Fallback: Oops, unable to copy', err)
  }

  document.body.removeChild(textArea)
}

const copyTextToClipboard = async (text) => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text)
    return
  }
  try {
    await navigator.clipboard.writeText(text)
    console.log('Async: Copying to clipboard was successful!')
    message.success('Copied to clipboard')
  } catch (err) {
    message.error('Error copying to clipboard')
    console.error('Async: Could not copy text: ', err)
  }
}

const getCopyAndNav = (record) => {
  const href =
    record.explorer_same_as &&
    Coins[record.explorer_same_as] &&
    Coins[record.explorer_same_as].urlPrefix
      ? `${Coins[record.explorer_same_as].urlPrefix}${record.address}`
      : Coins[record.name] && Coins[record.name].urlPrefix
      ? `${Coins[record.name].urlPrefix}${record.address}`
      : null
  if (href)
    return (
      <a target="_blank" href={href}>
        <LinkOutlined className={classes.copyToClipboard} />
      </a>
    )

  return null
}

const EditableBalance = ({
  balance,
  record,
  onRefresh,
}: {
  balance: number
  record: { id: string; name: string }
  onRefresh: () => void
}) => {
  const [value, setValue] = useState(balance)
  const [editable, setEditable] = useState(false)

  useEffect(() => {
    setValue(balance)
  }, [balance])

  const handleSetValue = (e) => setValue(e.target.value)

  const handleKeyPress = (e) => {
    if (e.which !== 13) return
    handleSubmit()
  }

  const handleSubmit = async () => {
    console.log('save balance', { record, value })
    const updateBalanceRes = await API.POST(`/balances/${record.id}`, {
      balance: value,
    })
    if (updateBalanceRes.status === 200) {
      message.success(
        `Successfully updated ${Coins[record.name].label} balance`
      )
      setEditable(false)
      onRefresh()
    } else {
      message.error(updateBalanceRes.data)
    }
  }

  const handleCancel = () => {
    setValue(balance)
    setEditable(false)
  }

  if (editable)
    return (
      <div className={classes.flexCenter}>
        <Input
          type="number"
          value={value}
          onChange={handleSetValue}
          onKeyPress={handleKeyPress}
        />
        <CheckCircleOutlined
          onClick={handleSubmit}
          className={classes.editIcons}
        />
        <CloseCircleOutlined
          onClick={handleCancel}
          className={classes.editIcons}
        />
      </div>
    )
  return (
    <div>
      <span>{balance}</span>
      <EditOutlined
        className={classes.editPencil}
        type="primary"
        onClick={setEditable.bind(this, true)}
      />
    </div>
  )
}

interface Balance {
  id: string
  name: string
  address: string
  balance: number
  exchange_rate_usd: number
  created_at: Date
  updated_at: Date
}

const AlphabeticalSort = (getField) => (a, b) => {
  const fieldA = getField(a)
  const fieldB = getField(b)
  if (fieldA < fieldB) {
    return -1
  }
  if (fieldA > fieldB) {
    return 1
  }
  return 0
}

const IndexPage = ({
  initialTotal,
  initialBalances,
}: {
  initialTotal: number
  initialBalances: Balance[]
}) => {
  const [balances, setBalances] = useState(initialBalances)
  const [total, setTotal] = useState(initialTotal)
  const [addCoinModalVisible, setAddCoinModalVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const handleRowSelectionChanged = (selectedRowKeys) =>
    setSelectedRowKeys(selectedRowKeys)
  const rowSelection = { selectedRowKeys, onChange: handleRowSelectionChanged }
  const socketInitialized = useRef(false)

  const refresh = async () => {
    const {
      data: { balances, total },
    } = await API.GET('/balances')
    setBalances(balances)
    setTotal(total)
  }

  const handleUpdatedBalances = () => {
    console.log('Received updated balances event')
    refresh()
  }

  const initializeSocket = async () => {
    console.log('initialize socket')
    if (socketInitialized.current) return
    const socketAddress = `${window.location.protocol}//${window.location.host}`
    console.log('connecting to socket address', socketAddress)
    const sio = io(socketAddress)
    sio.on('connect', () => console.log('socket io connected'))
    sio.on('balances', handleUpdatedBalances)
    socketInitialized.current = true
  }

  useEffect(() => {
    initializeSocket()
  }, [])

  const CryptoColumns = [
    {
      key: 'name',
      dataIndex: 'name',
      width: 320,
      title: 'Cryptocurrency',
      sorter: AlphabeticalSort((record) => {
        if (Coins[record.name]) return Coins[record.name].label
        return record.name
      }),
      render: (text, record) => (
        <div className={classes.cryptoNameContainer}>
          {Coins[text] && Coins[text].img && (
            <img className={classes.coinIcon} src={`/img/${text}.png`} />
          )}
          <div className={classes.cryptoName}>
            <div className={classes.flexCenter}>
              {Coins[text] ? Coins[text].label : text.toUpperCase()}
              {getCopyAndNav(record)}
            </div>
            {record.address && (
              <span
                onClick={copyTextToClipboard.bind(this, record.address)}
                className={classes.cryptoAddress}>
                {record.address}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'value_usd',
      dataIndex: 'value_usd',
      title: 'Value (USD)',
      width: 180,
      sorter: (a, b) => getValue(a) - getValue(b),
      render: (_, record) => {
        return '$' + (record.balance * record.exchange_rate_usd).toFixed(2)
      },
    },
    {
      key: 'exchange_rate_usd',
      dataIndex: 'exchange_rate_usd',
      width: 180,
      title: 'Exchange Rate (USD)',
      sorter: (a, b) => {
        const exchA =
          a.exchange_rate_usd == null || isNaN(a.exchange_rate_usd)
            ? 0
            : a.exchange_rate_usd
        const exchB =
          b.exchange_rate_usd == null || isNaN(b.exchange_rate_usd)
            ? 0
            : b.exchange_rate_usd
        return exchA - exchB
      },
      render: (rate) => {
        if (rate === null) return 'Unknown'
        return '$' + (rate < 1 ? rate.toPrecision(4) : rate.toFixed(2))
      },
    },
    {
      key: 'balance',
      dataIndex: 'balance',
      width: 180,
      title: 'Balance',
      sorter: (a, b) => a.balance - b.balance,
      render: (text, record) => {
        if (
          Coins[record.name] &&
          Coins[record.name].canDetermineBalanceFromAddress === false
        )
          return (
            <EditableBalance
              onRefresh={refresh}
              balance={text}
              record={record}
            />
          )
        return text
      },
    },
    {
      key: 'updated_at',
      dataIndex: 'updated_at',
      width: 180,
      title: 'Last Updated',
      sorter: (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      render: (date) => timeDifference(Date.now(), new Date(date).getTime()),
    },
  ]

  const handleDelete = async () => {
    const deleteRes = await API.DELETE('/balances', selectedRowKeys)
    if (deleteRes.status === 200) {
      message.success('Successfully deleted')
      setSelectedRowKeys([])
    } else {
      message.error('Error deleting')
    }
    refresh()
  }

  return (
    <div className="body">
      <div className={classes.tableContainer}>
        <div className={classes.inner}>
          <div className={classes.totals}>
            <h2 className={classes.title}>Crypto Balance</h2>
            <h3 className={classes.priceLabel}>Total USD Value</h3>
            <h1 className={classes.price}>
              ${(Math.round((total || 0) * 100) / 100).toFixed(2)}
            </h1>
          </div>
          <Button
            type="primary"
            onClick={setAddCoinModalVisible.bind(this, true)}>
            Add Coin
          </Button>
          <Button
            className={classes.refresh_button}
            type="default"
            onClick={refresh}>
            <RedoOutlined />
          </Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              onConfirm={handleDelete}
              title={`Are you sure you wish to delete the balance checks for ${toAndString(
                selectedRowKeys.map((id) => {
                  const balance = balances.find((balance) => balance.id === id)
                  if (!balance) return ''
                  if (Coins[balance.name]) return Coins[balance.name].label
                  return balance.name
                })
              )}?`}>
              <Button className={classes.refresh_button} type="primary" danger>
                <DeleteOutlined />
              </Button>
            </Popconfirm>
          )}
          <Table
            className={classes.balances_table}
            rowKey="id"
            scroll={{x: true}}
            columns={CryptoColumns}
            dataSource={balances}
            pagination={false}
            rowSelection={rowSelection}
          />
        </div>
      </div>
      {addCoinModalVisible && (
        <AddCoinModal
          onComplete={refresh}
          onCancel={setAddCoinModalVisible.bind(this, false)}
        />
      )}
      <footer>
        <span className={classes.poweredBy}>
          Powered by{' '}
          {PoweredBy.map(({ name, href }, i) => (
            <span key={`powered_by_${i}`}>
              <a target="_blank" href={href}>
                {name}
              </a>
              {i === PoweredBy.length - 1
                ? ''
                : i === PoweredBy.length - 2
                ? ', and '
                : ', '}
            </span>
          ))}
        </span>
      </footer>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const {
    data: { balances, total },
  } = await ServerSideAPI.GET('/balances')
  return {
    props: {
      initialBalances: balances,
      initialTotal: total,
    },
  }
}

export default IndexPage
