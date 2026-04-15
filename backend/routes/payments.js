const router = require('express').Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

router.use(auth);

// ================= GET payments for an order =================
router.get('/order/:order_id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * 
       FROM payments 
       WHERE order_id=$1 
       ORDER BY paid_on DESC`,
      [req.params.order_id]
    );

    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ================= ADD PAYMENT (SAFE ERP LOGIC) =================
router.post('/', async (req, res) => {
  const { order_id, amount, paid_on, notes } = req.body;

  const client = await pool.connect();

  try {
    if (!order_id || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    await client.query('BEGIN');

    // 🔥 1. GET ORDER DETAILS
    const orderRes = await client.query(
      `SELECT grand_total, amount_paid FROM orders WHERE id=$1`,
      [order_id]
    );

    if (!orderRes.rows.length) {
      throw new Error('Order not found');
    }

    const order = orderRes.rows[0];

    const currentPaid = Number(order.amount_paid);
    const newPaid = currentPaid + Number(amount);
    const grandTotal = Number(order.grand_total);

    // ❌ BLOCK OVERPAY
    if (newPaid > grandTotal) {
      throw new Error('Payment exceeds order total');
    }

    // ✅ 2. INSERT PAYMENT
    const { rows } = await client.query(
      `INSERT INTO payments (order_id, amount, paid_on, notes)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [order_id, amount, paid_on || new Date(), notes || '']
    );

    // ✅ 3. UPDATE ORDER
    await client.query(
      `UPDATE orders
       SET amount_paid = amount_paid + $1
       WHERE id = $2`,
      [amount, order_id]
    );

    // ✅ 4. UPDATE STATUS
    await client.query(
      `UPDATE orders
       SET status =
         CASE
           WHEN amount_paid + $1 >= grand_total THEN 'paid'
           WHEN amount_paid + $1 > 0 THEN 'partial'
           ELSE 'pending'
         END
       WHERE id = $2`,
      [amount, order_id]
    );

    await client.query('COMMIT');

    res.status(201).json(rows[0]);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Payment Error:', e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ================= DELETE PAYMENT =================
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT * FROM payments WHERE id=$1`,
      [req.params.id]
    );

    if (!rows.length) throw new Error('Payment not found');

    const payment = rows[0];

    // delete
    await client.query(
      `DELETE FROM payments WHERE id=$1`,
      [req.params.id]
    );

    // rollback amount
    await client.query(
      `UPDATE orders
       SET amount_paid = amount_paid - $1
       WHERE id=$2`,
      [payment.amount, payment.order_id]
    );

    await client.query('COMMIT');

    res.json({ ok: true });

  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

module.exports = router;
