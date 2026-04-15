const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

// =====================================================
// 📊 CUSTOMER REPORT (Orders + Payments + Totals)
// =====================================================
router.get('/customer/:id', async (req, res) => {
  try {
    const customerId = req.params.id;

    // ================= 1. GET ORDERS =================
    const { rows: orders } = await pool.query(
      `
      SELECT
        id,
        order_date,
        grand_total,
        amount_paid,
        balance,
        status
      FROM orders
      WHERE customer_id = $1
      ORDER BY order_date DESC
      `,
      [customerId]
    );

    // ================= 2. GET PAYMENTS =================
    const { rows: payments } = await pool.query(
      `
      SELECT
        p.id,
        p.amount,
        p.paid_on,
        p.notes,
        p.order_id
      FROM payments p
      JOIN orders o ON o.id = p.order_id
      WHERE o.customer_id = $1
      ORDER BY p.paid_on DESC
      `,
      [customerId]
    );

    // ================= 3. TOTAL CALCULATION =================
    const total = orders.reduce((sum, o) => sum + Number(o.grand_total || 0), 0);
    const paid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const balance = total - paid;

    // ================= RESPONSE =================
    res.json({
      success: true,
      data: {
        orders,
        payments,
        totals: {
          grand_total: total,
          paid,
          balance
        }
      }
    });

  } catch (err) {
    console.error('❌ Customer Report Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer report',
      error: err.message
    });
  }
});

// =====================================================
// 📊 OPTIONAL: ALL CUSTOMERS SUMMARY (Top Level Dashboard)
// =====================================================
router.get('/summary', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        c.id,
        c.name,
        COALESCE(SUM(o.grand_total), 0) AS total_business,
        COALESCE(SUM(o.amount_paid), 0) AS total_paid,
        COALESCE(SUM(o.balance), 0) AS total_balance
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_balance DESC
    `);

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error('❌ Summary Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch summary',
      error: err.message
    });
  }
});

// =====================================================
// 📊 OPTIONAL: DATE FILTER REPORT
// Example: /api/reports/customer/1?from=2025-04-01&to=2025-04-30
// =====================================================
router.get('/customer/:id/date', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { from, to } = req.query;

    const { rows } = await pool.query(
      `
      SELECT *
      FROM orders
      WHERE customer_id = $1
      AND order_date BETWEEN $2 AND $3
      ORDER BY order_date DESC
      `,
      [customerId, from, to]
    );

    res.json({
      success: true,
      data: rows
    });

  } catch (err) {
    console.error('❌ Date Report Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch date report',
      error: err.message
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================
module.exports = router;
