import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Reports() {
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    api.get('/customers').then(setCustomers);
  }, []);

  // ================= LOAD REPORT =================
  async function loadReport() {
    if (!customerId) return;

    setLoading(true);
    try {
      let url = `/reports/customer/${customerId}`;

      // ✅ if date filter present
      if (from && to) {
        url = `/reports/customer/${customerId}/date?from=${from}&to=${to}`;
      }

      const res = await api.get(url);

      // ⚠️ date API returns only orders
      if (from && to) {
        setReport({
          orders: res.data,
          payments: [],
          totals: {
            grand_total: res.data.reduce((s, o) => s + Number(o.grand_total || 0), 0),
            paid: 0,
            balance: 0
          }
        });
      } else {
        setReport(res.data);
      }

    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  }

  // ================= WHATSAPP =================
  function remind(phone, amount, name) {
    const msg = `Hello ${name}, you have a pending balance of ₹${amount}. Please clear it.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  }

  // ================= DOWNLOAD INVOICE =================
  function downloadInvoice(orderId) {
    const token = localStorage.getItem('token');

    const url = `http://localhost:4000/api/invoice-pdf/${orderId}`;

    fetch(url, {
      headers: {
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `invoice_${orderId}.pdf`;
        link.click();
      });
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Customer Reports</h2>

      {/* ================= FILTERS ================= */}
      <div style={{ marginBottom: 20 }}>
        <select onChange={e => setCustomerId(e.target.value)}>
          <option>Select Customer</option>
          {customers.map(c => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.type})
            </option>
          ))}
        </select>

        <input
          type="date"
          onChange={e => setFrom(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <input
          type="date"
          onChange={e => setTo(e.target.value)}
          style={{ marginLeft: 10 }}
        />

        <button onClick={loadReport} style={{ marginLeft: 10 }}>
          Load Report
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {/* ================= REPORT ================= */}
      {report && (
        <div>
          <h3>Summary</h3>
          <p><b>Total:</b> ₹{report.totals.grand_total}</p>
          <p><b>Paid:</b> ₹{report.totals.paid}</p>
          <p><b>Balance:</b> ₹{report.totals.balance}</p>

          {/* WhatsApp */}
          {report.totals.balance > 0 && (
            <button
              onClick={() => {
                const c = customers.find(x => x.id == customerId);
                remind(c?.phone, report.totals.balance, c?.name);
              }}
              style={{ background: 'green', color: 'white', padding: 8 }}
            >
              📲 WhatsApp Reminder
            </button>
          )}

          {/* ================= ORDERS ================= */}
          <h3>Orders</h3>
          <table border="1" cellPadding="8">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {report.orders.map(o => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td>₹{o.grand_total}</td>
                  <td>
                    <button onClick={() => downloadInvoice(o.id)}>
                      📄 Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ================= PAYMENTS ================= */}
          {!from && (
            <>
              <h3>Payments</h3>
              <table border="1" cellPadding="8">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Order</th>
                    <th>Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.payments.map(p => (
                    <tr key={p.id}>
                      <td>{p.id}</td>
                      <td>{p.order_id}</td>
                      <td>₹{p.amount}</td>
                      <td>{new Date(p.paid_on).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}
