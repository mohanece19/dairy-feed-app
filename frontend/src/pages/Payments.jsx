import { useState } from 'react';
import { api } from '../api/client';

export default function Payments() {
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState('');

  async function pay() {
    await api.post('/payments', {
      order_id: orderId,
      amount
    });
    alert('Payment recorded');
  }

  return (
    <div>
      <h2>Payments</h2>
      <input placeholder="Order ID" onChange={e => setOrderId(e.target.value)} />
      <input placeholder="Amount" onChange={e => setAmount(e.target.value)} />
      <button onClick={pay}>Pay</button>
    </div>
  );
}
