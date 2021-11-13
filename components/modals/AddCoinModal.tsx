import Modal from 'antd/lib/modal/Modal'
import Form, { useForm } from 'antd/lib/form/Form'
import { Select, Input } from 'antd'
import FormItem from 'antd/lib/form/FormItem'
import API from '../../lib/api/local'
import { Coins } from '../../lib/coins'
import { useState } from 'react'
const { Option } = Select
const AddCoinModal = ({ onCancel, onComplete }: {onCancel?: (e: React.MouseEvent<HTMLElement>) => void, onComplete: () => void }) => {
  const [form] = useForm()

  const [coin, setCoin] = useState<string>(null)

  const submitForm = async () => {
    try {
      const values = await form.validateFields()
      console.log(values)
      if (!values.address) values.address = ''
      try {
        const res = await API.POST('/balances', values)
        if (res.status === 200) {
          console.log('Successfully added wallet')
          onComplete()
          onCancel(null)
        }
      } catch(err) {
        console.log('Error adding wallet for tracking', err)
      }
    } catch(err) {
      console.log('Error submitting form', err)
    }
  }

  return <Modal visible={true} title="Add Coin Wallet to Track" okText="Add" cancelButtonProps={{ hidden: true }} onCancel={onCancel} onOk={submitForm}>
    <Form form={form}>
      <FormItem label="Coin" name="name" rules={[{ required: true, message: 'Please choose a coin' }]}>
        <Select onChange={setCoin.bind(this)}>
          {Object.keys(Coins).filter(coin => !Coins[coin].hideAdd).map(coin => <Option value={coin}>{Coins[coin].label}</Option>)}
        </Select>
      </FormItem>
      {((Coins[coin] && !Coins[coin].hideAdd) ? (Coins[coin].canDetermineBalanceFromAddress ? 
      <FormItem label="Wallet Address" name="address" rules={[{ required: true, message: 'Please input your wallet address' }]}>
          <Input/>
      </FormItem> :
      <FormItem label="Balance" name="balance" rules={[{ required: true, message: 'Please input your wallet balance' }]}>
          <Input type="number"/>
      </FormItem>) : null)}

    </Form>
  </Modal>
}

export default AddCoinModal