import { useEffect, useState } from "react";
import { api } from "../utils/api";

function fmt(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const s = await api("/dashboard");
      setStats(s);

      const orders = await api("/orders");
      setRecentOrders(orders.slice(0, 5)); // latest 5
    } catch (err) {
      alert("Error loading dashboard: " + err.message);
    }
  }

  if (!stats) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      {/* STATS CARDS */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <Card title="Total Orders" value={stats.total_orders} />
        <Card title="Revenue" value={fmt(stats.total_revenue)} />
        <Card title="Pending" value={fmt(stats.total_pending)} />
        <Card title="Customers" value={stats.total_customers} />
      </div>

      {/* RECENT ORDERS */}
      <h2 style={{ marginTop: 40 }}>Recent Orders</h2>

      <table border="1" cellPadding="10" style={{ marginTop: 10 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {recentOrders.map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{new Date(o.order_date).toLocaleDateString()}</td>
              <td>{fmt(o.grand_total)}</td>
              <td>{fmt(o.amount_paid)}</td>
              <td>{fmt(o.balance)}</td>
              <td>{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: 20,
        borderRadius: 10,
        width: 200,
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 20, fontWeight: "bold" }}>{value}</p>
    </div>
  );
}
