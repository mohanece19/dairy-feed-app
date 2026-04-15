import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Customers() {
  const [list, setList] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('retail');

  async function load() {
    const data = await api.get('/customers');
    setList(data);
  }

  async function add() {
    await api.post('/customers', { name, type });
    setName('');
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h2>Customers</h2>

      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />

      <select value={type} onChange={e => setType(e.target.value)}>
        <option value="retail">Retail</option>
        <option value="wholesale">Wholesale</option>
      </select>

      <button onClick={add}>Add</button>

      <ul>
        {list.map(c => (
          <li key={c.id}>{c.name} ({c.type})</li>
        ))}
      </ul>
    </div>
  );
}
