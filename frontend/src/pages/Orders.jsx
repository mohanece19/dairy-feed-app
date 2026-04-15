import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Orders() {
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([]);

  const [customerId, setCustomerId] = useState('');
  const [customerType, setCustomerType] = useState('');

  const [rows, setRows] = useState([
    { item_id: '', quantity: 1, rate: 0 }
  ]);

  const [total, setTotal] = useState(0);

  // ================= LOAD DATA =================
  useEffect(() => {
    api.get('/customers').then(setCustomers);
    api.get('/items').then(setItems);
  }, []);

  // ================= CUSTOMER CHANGE =================
  function handleCustomer(id) {
    setCustomerId(id);

    const c = customers.find(x => x.id == id);
    setCustomerType(c?.type || '');

    // update all row prices based on type
    const updated = rows.map(r => {
      const item = items.find(i => i.id == r.item_id);
      if (!item) return r;

      const rate =
        c?.type === 'wholesale'
          ? item.wholesale_price
          : item.retail_price;

      return { ...r, rate };
    });

    setRows(updated);
  }

  // ================= ITEM CHANGE =================
  function handleItemChange(index, itemId) {
    const item = items.find(i => i.id == itemId);

    const rate =
      customerType === 'wholesale'
        ? item?.wholesale_price
        : item?.retail_price;

    const updated = [...rows];
    updated[index].item_id = itemId;
    updated[index].rate = rate || 0;

    setRows(updated);
  }

  // ================= UPDATE ROW =================
  function updateRow(index, field, value) {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  }

  // ================= ADD ROW =================
  function addRow() {
    setRows([...rows, { item_id: '', quantity: 1, rate: 0 }]);
  }

  // ================= REMOVE ROW =================
  function removeRow(index) {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  }

  // ================= CALCULATE TOTAL =================
  useEffect(() => {
    let t = 0;
    rows.forEach(r => {
      t += (Number(r.quantity) || 0) * (Number(r.rate) || 0);
    });
    setTotal(t);
  }, [rows]);

  // ================= SAVE ORDER =================
  async function saveOrder() {
    if (!customerId) return alert('Select customer');

    try {
      await api.post('/orders', {
        customer_id: customerId,
        items: rows.map(r => ({
          item_id: r.item_id,
          quantity: Number(r.quantity),
          rate: Number(r.rate)
        }))
      });

      alert('Order created');

      // reset
      setRows([{ item_id: '', quantity: 1, rate: 0 }]);
      setTotal(0);

    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Order</h2>

      {/* ================= CUSTOMER ================= */}
      <div>
        <select onChange={e => handleCustomer(e.target.value)}>
          <option>Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>
      </div>

      <br />

      {/* ================= ITEMS ================= */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty (bags)</th>
            <th>Rate</th>
            <th>Total</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>
                <select
                  value={r.item_id}
                  onChange={e => handleItemChange(idx, e.target.value)}
                >
                  <option>Select Item</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={r.quantity}
                  onChange={e => updateRow(idx, 'quantity', e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={r.rate}
                  onChange={e => updateRow(idx, 'rate', e.target.value)}
                />
              </td>

              <td>
                ₹{(r.quantity * r.rate).toFixed(2)}
              </td>

              <td>
                <button onClick={() => removeRow(idx)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <button onClick={addRow}>+ Add Item</button>

      <h3>Total: ₹{total.toFixed(2)}</h3>

      <button onClick={saveOrder} style={{ padding: 10 }}>
        Save Order
      </button>
    </div>
  );
}
