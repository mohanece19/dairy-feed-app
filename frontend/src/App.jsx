import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { getToken, clearToken } from './utils/api'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Items from './pages/Items'
import Stock from './pages/Stock'
import Reports from './pages/Reports'

// 🔐 Protected Route
function PrivateRoute({ children }) {
  const token = getToken()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  const token = getToken()

  return (
    <BrowserRouter>
      {/* NAVBAR */}
      {token && (
        <nav style={{ marginBottom: 20 }}>
          <Link to="/">Dashboard</Link> |{" "}
          <Link to="/customers">Customers</Link> |{" "}
          <Link to="/orders">Orders</Link> |{" "}
          <Link to="/items">Items</Link> |{" "}
          <Link to="/stock">Stock</Link> |{" "}
          <Link to="/reports">Reports</Link> |{" "}
          <button onClick={() => {
            clearToken()
            window.location = '/login'
          }}>
            Logout
          </button>
        </nav>
      )}

      {/* ROUTES */}
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        <Route path="/customers" element={
          <PrivateRoute><Customers /></PrivateRoute>
        } />

        <Route path="/orders" element={
          <PrivateRoute><Orders /></PrivateRoute>
        } />

        <Route path="/items" element={
          <PrivateRoute><Items /></PrivateRoute>
        } />

        <Route path="/stock" element={
          <PrivateRoute><Stock /></PrivateRoute>
        } />

        <Route path="/reports" element={
          <PrivateRoute><Reports /></PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
