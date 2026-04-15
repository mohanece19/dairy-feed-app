// ================= API CONFIG =================

// 👉 CHANGE THIS after backend deploy
const BASE = "http://localhost:4000/api";
// Example for production:
// const BASE = "https://your-backend-name.onrender.com/api";

// ================= TOKEN HELPERS =================

export function getToken() {
  return localStorage.getItem('token');
}

export function setToken(token) {
  localStorage.setItem('token', token);
}

export function clearToken() {
  localStorage.removeItem('token');
}

// ================= GENERIC REQUEST =================

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken() || ''}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/';
    return;
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'API Error');
  }

  return data;
}

// ================= AUTH =================

export const api = {
  login: (data) => request('POST', '/auth/login', data),

  // ================= CUSTOMERS =================
  getCustomers: () => request('GET', '/customers'),
  addCustomer: (data) => request('POST', '/customers', data),

  // ================= ITEMS =================
  getItems: () => request('GET', '/items'),
  addItem: (data) => request('POST', '/items', data),
  updateItem: (id, data) => request('PUT', `/items/${id}`, data),

  // ================= ORDERS =================
  createOrder: (data) => request('POST', '/orders', data),
  getOrders: () => request('GET', '/orders'),

  // ================= PAYMENTS =================
  addPayment: (data) => request('POST', '/payments', data),

  // ================= STOCK =================
  addStock: (data) => request('POST', '/stock/in', data),

  // ================= REPORTS =================
  getCustomerReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/reports/customer?${query}`);
  },

  // ================= INVOICE =================
  downloadInvoice: (orderId) => {
    window.open(`${BASE}/invoice/${orderId}`, '_blank');
  },
};
