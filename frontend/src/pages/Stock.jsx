import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';

export default function Stock() {
  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([
    { item_id: '', quantity: '', cost_price: '' }
  ]);

  const loadItems = async () => {
    const data = await api.get('/items');
    setItems(data);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const addRow = () => {
    setRows([...rows, { item_id: '', quantity: '', cost_price: '' }]);
  };

  const updateRow = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
  };

  const removeRow = (i) => {
    const updated = rows.filter((_, idx) => idx !== i);
    setRows(updated);
  };

  const handleSubmit = async () => {
    try {
      const payload = rows
        .filter(r => r.item_id && r.quantity > 0)
        .map(r => ({
          item_id: Number(r.item_id),
          quantity: Number(r.quantity),
          cost_price: Number(r.cost_price)
        }));

      if (!payload.length) {
        alert('Add at least one valid stock entry');
        return;
      }

      await api.post('/stock/in', { items: payload });

      alert('Stock added successfully');

      setRows([{ item_id: '', quantity: '', cost_price: '' }]);
      loadItems();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h2>Stock Entry</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Item</th>
            <th>Quantity (bags)</th>
            <th>Cost Price</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <select
                  value={row.item_id}
                  onChange={(e) => updateRow(i, 'item_id', e.target.value)}
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stock: {item.stock})
                    </option>
                  ))}
                </select>
              </td>

              <td>
                <input
                  type="number"
                  value={row.quantity}
                  onChange={(e) => updateRow(i, 'quantity', e.target.value)}
                />
              </td>

              <td>
                <input
                  type="number"
                  value={row.cost_price}
                  onChange={(e) => updateRow(i, 'cost_price', e.target.value)}
                />
              </td>

              <td>
                <button onClick={() => removeRow(i)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />

      <button onClick={addRow}>+ Add Row</button>

      <br /><br />

      <button onClick={handleSubmit}>Save Stock</button>

      <hr />

      <h3>Current Stock</h3>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Item</th>
            <th>Available Bags</th>
            <th>Current Cost Price</th>
          </tr>
        </thead>

        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.stock}</td>
              <td>₹ {item.cost_price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
