const router = require('express').Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');
const { generateInvoiceNo } = require('../utils/invoiceNo');

router.use(auth);

// ================= CREATE INVOICE =================
router.post('/generate/:order_id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { order_id } = req.params;

    // 1. Get order + items
    const orderRes = await client.query(
      `SELECT * FROM orders WHERE id=$1`,
      [order_id]
    );

    const order = orderRes.rows[0];

    const itemsRes = await client.query(
      `SELECT * FROM order_items WHERE order_id=$1`,
      [order_id]
    );

    const items = itemsRes.rows;

    // 2. Calculate GST (simple ERP rule: 18%)
    const subtotal = Number(order.grand_total);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    // 3. Insert invoice
    const invoiceInsert = await client.query(
      `INSERT INTO invoices (order_id, customer_id, subtotal, gst, total)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [order_id, order.customer_id, subtotal, gst, total]
    );

    const invoice = invoiceInsert.rows[0];

    // 4. Generate invoice number
    const invoice_no = generateInvoiceNo(invoice.id);

    await client.query(
      `UPDATE invoices SET invoice_no=$1 WHERE id=$2`,
      [invoice_no, invoice.id]
    );

    await client.query('COMMIT');

    res.json({
      ok: true,
      invoice_no,
      invoice_id: invoice.id,
      subtotal,
      gst,
      total,
      items
    });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ================= GET INVOICE =================
router.get('/:invoice_id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM invoices WHERE id=$1`,
      [req.params.invoice_id]
    );

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
