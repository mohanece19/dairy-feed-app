require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();

// ================= CONFIG =================
app.set('trust proxy', 1); // required for render

// ================= MIDDLEWARE =================
app.use(cors({
  origin: '*', // you can restrict later to frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// ================= ROUTES =================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/items', require('./routes/items'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/stock', require('./routes/stock'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));

// ✅ Invoice routes (clean naming)
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/invoice', require('./routes/invoicePdf')); 
// NOTE: this matches frontend download URL

// ================= HEALTH CHECK =================
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'ERP Backend Running 🚀',
    time: new Date()
  });
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.message);

  res.status(500).json({
    error: 'Internal Server Error',
    details: err.message
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
