const router = require('express').Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

router.use(auth);

// ================= DASHBOARD SUMMARY =================
router.get('/', async (req, res) => {
  try {

    // ================= SALES SUMMARY =================
    const salesResult = await pool.query(`
      SELECT
        COALESCE(SUM(grand_total),0) AS revenue,
        COALESCE(SUM(amount_paid),0) AS collected,
        COALESCE(SUM(balance),0) AS pending
      FROM orders
    `);

    const sales = salesResult.rows[0];

    // ================= ITEMS COUNT =================
    const itemsResult = await pool.query(`
      SELECT COUNT(*) AS total_items FROM items
    `);

    const items = itemsResult.rows[0];

    // ================= REAL PROFIT ENGINE =================
    const profitResult = await pool.query(`
      SELECT COALESCE(SUM(
        (oi.rate - COALESCE(oi.cost_price,0)) * oi.quantity
      ),0) AS profit
      FROM order_items oi
    `);

    const profit = profitResult.rows[0];

    // ================= RESPONSE =================
    res.json({
      revenue: Number(sales.revenue || 0),
      collected: Number(sales.collected || 0),
      pending: Number(sales.pending || 0),
      items: Number(items.total_items || 0),
      profit: Number(profit.profit || 0)
    });

  } catch (err) {
    console.error("❌ Dashboard error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
