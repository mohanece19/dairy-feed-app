import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Items() {
  const [items, setItems] = useState([]);

  const [name, setName] = useState('');
  const [retail, setRetail] = useState('');
  const [wholesale, setWholesale] = useState('');
  const [cost, setCost] = useState('');

  const [editId, setEditId] = useState(null);

  // ================= LOAD =================
  async function load() {
    const data = await api.get('/items');
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  // ================= SAVE =================
  async function save() {
    try {
      await api.post('/items', {
        name,
        retail_price: Number(retail),
        wholesale_price: Number(wholesale),
        cost_price: Number(cost)
      });

      alert('Item added');
      reset();
      load();

    } catch (e) {
      alert(e.message);
    }
  }

  // ================= UPDATE =================
  async function update() {
    try {
      await api.put(`/items/${editId}`, {
        retail_price: Number(retail),
        wholesale_price: Number(wholesale),
        cost_price: Number(cost)
      });

      alert('Updated');
      reset();
      load();

    } catch (e) {
      alert(e.message);
    }
  }

  function edit(item) {
    setEditId(item.id);
    setName(item.name);
    setRetail(item.retail_price);
    setWholesale(item.wholesale_price);
    setCost(item.cost_price);
  }

  function reset() {
    setEditId(null);
    setName('');
    setRetail('');
    setWholesale('');
    setCost('');
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Items</h2>

      {/* ================= FORM ================= */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Item Name"
          value={name}
          onChange={e => setName(e.target.value)}
          disabled={editId}
        />

        <input
          type="number"
          placeholder="Retail Price"
          value={retail}
          onChange={e => setRetail(e.target.value)}
        />

        <input
          type="number"
          placeholder="Wholesale Price"
          value={wholesale}
          onChange={e => setWholesale(e.target.value)}
        />

        <input
          type="number"
          placeholder="Cost Price"
          value={cost}
          onChange={e => setCost(e.target.value)}
        />

        {!editId ? (
          <button onClick={save}>Add Item</button>
        ) : (
          <>
            <button onClick={update}>Update</button>
            <button onClick={reset}>Cancel</button>
          </>
        )}
      </div>

      {/* ================= LIST ================= */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Retail</th>
            <th>Wholesale</th>
            <th>Cost</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.name}</td>
              <td>₹{i.retail_price}</td>
              <td>₹{i.wholesale_price}</td>
              <td>₹{i.cost_price}</td>
              <td>{i.stock}</td>
              <td>
                <button onClick={() => edit(i)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
