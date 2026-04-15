const router = require('express').Router();
const pool = require('../db/pool');

// ================= GET ALL ITEMS =================
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM items ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= CREATE ITEM =================
router.post('/', async (req, res) => {
  try {
    const { name, retail_price, wholesale_price, cost_price } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    // prevent duplicates
    const existing = await pool.query(
      `SELECT id FROM items WHERE LOWER(name)=LOWER($1)`,
      [name]
    );

    if (existing.rows.length) {
      return res.status(400).json({ error: 'Item already exists' });
    }

    const { rows } = await pool.query(
      `INSERT INTO items
       (name, retail_price, wholesale_price, cost_price)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [name, retail_price, wholesale_price, cost_price]
    );

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE ITEM =================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { retail_price, wholesale_price, cost_price } = req.body;

    const { rows } = await pool.query(
      `UPDATE items
       SET retail_price=$1,
           wholesale_price=$2,
           cost_price=$3
       WHERE id=$4
       RETURNING *`,
      [retail_price, wholesale_price, cost_price, id]
    );

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;