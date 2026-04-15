const router = require('express').Router();
const pool = require('../db/pool');
const auth = require('../middleware/auth');

router.use(auth);

// ================= CREATE CUSTOMER =================
router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO customers (name, type)
       VALUES ($1,$2)
       RETURNING *`,
      [name, type || 'retail']
    );

    res.json(rows[0]);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ALL =================
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM customers ORDER BY id DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
