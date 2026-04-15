import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function CreateOrder() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/customers').then(setCustomers);
    api.get('/items').then(setItems);
  }, []);

  function addRow() {
    setRows([...rows, { item_id: '', qty: 1, price: 0 }]);
  }

  function updateRow(i, field, val) {
    const updated = [...rows];
    updated[i][field] = val;

    if (field === 'item_id') {
      const item = items.find(x => x.id == val);
      if (item && selectedCustomer) {
        updated[i].price =
          selectedCustomer.type === 'retail'
            ? item.retail_price
            : item.wholesale_price;
      }
    }

    setRows(updated);
  }

  async function submit() {
    await api.post('/orders', {
      customer_id: selectedCustomer.id,
      items: rows.map(r => ({
        item_id: r.item_id,
        quantity: r.qty,
        price: r.price
      }))
    });

    alert('Order created');
  }

  return (
    <div>
      <h2>Create Order</h2>

      <select onChange={e => {
        const c = customers.find(x => x.id == e.target.value);
        setSelectedCustomer(c);
      }}>
        <option>Select Customer</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.name} ({c.type})
          </option>
        ))}
      </select>

      <button onClick={addRow}>Add Item</button>

      {rows.map((r, i) => (
        <div key={i}>
          <select onChange={e => updateRow(i, 'item_id', e.target.value)}>
            <option>Select Item</option>
            {items.map(it => (
              <option key={it.id} value={it.id}>{it.name}</option>
            ))}
          </select>

          <input type="number" placeholder="Qty"
            onChange={e => updateRow(i, 'qty', e.target.value)} />

          <input type="number" placeholder="Price"
            value={r.price}
            onChange={e => updateRow(i, 'price', e.target.value)} />
        </div>
      ))}

      <button onClick={submit}>Create Order</button>
    </div>
  );
}
