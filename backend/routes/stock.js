const router = require('express').Router();
const pool = require('../db/pool');

// STOCK IN (ADD STOCK)
router.post('/in', async (req, res) => {
  const client = await pool.connect();

  try {
    const { items } = req.body;

    await client.query('BEGIN');

    for (const item of items) {
      const { item_id, quantity, cost_price } = item;

      // 1. INSERT STOCK MOVEMENT (HISTORY)
      await client.query(
        `
        INSERT INTO stock_movements (item_id, quantity, cost_price, type)
        VALUES ($1, $2, $3, 'IN')
        `,
        [item_id, quantity, cost_price]
      );

      // 2. UPDATE ITEMS TABLE (CURRENT STOCK + LATEST COST)
      await client.query(
        `
        UPDATE items
        SET stock = stock + $1,
            cost_price = $2
        WHERE id = $3
        `,
        [quantity, cost_price, item_id]
      );
    }

    await client.query('COMMIT');

    res.json({ message: 'Stock added successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// GET STOCK
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, name, stock, cost_price
      FROM items
      ORDER BY name
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;