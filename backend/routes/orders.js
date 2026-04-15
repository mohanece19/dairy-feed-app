const router = require('express').Router();
const pool = require('../db/pool');

// ================= CREATE ORDER =================
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    const { customer_id, items } = req.body;

    if (!customer_id || !items?.length) {
      return res.status(400).json({ error: 'Invalid data' });
    }

    await client.query('BEGIN');

    let subtotal = 0;

    // ================= CREATE ORDER =================
    const orderRes = await client.query(
      `INSERT INTO orders (customer_id)
       VALUES ($1)
       RETURNING *`,
      [customer_id]
    );

    const order = orderRes.rows[0];

    // ================= INSERT ITEMS =================
    for (const item of items) {
      const { item_id, quantity, rate } = item;

      if (!item_id || !quantity) continue;

      // 👉 fetch item details
      const itemRes = await client.query(
        `SELECT name, cost_price FROM items WHERE id = $1`,
        [item_id]
      );

      if (!itemRes.rows.length) {
        throw new Error(`Item not found: ${item_id}`);
      }

      const dbItem = itemRes.rows[0];

      const cost_price = Number(dbItem.cost_price);
      const item_name = dbItem.name;

      const lineTotal = Number(quantity) * Number(rate);
      subtotal += lineTotal;

      // 👉 insert order item
      await client.query(
        `INSERT INTO order_items
         (order_id, item_id, quantity, rate, cost_price, item_name)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, item_id, quantity, rate, cost_price, item_name]
      );
    }

    // ================= CALCULATE TOTAL =================
    const gst_percent = 0; // you can change later
    const gst_amount = (subtotal * gst_percent) / 100;
    const grand_total = subtotal + gst_amount;

    // ================= UPDATE ORDER =================
    const updated = await client.query(
      `UPDATE orders
       SET subtotal = $1,
           gst_percent = $2,
           gst_amount = $3,
           grand_total = $4
       WHERE id = $5
       RETURNING *`,
      [subtotal, gst_percent, gst_amount, grand_total, order.id]
    );

    await client.query('COMMIT');

    res.json(updated.rows[0]);

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;