const router = require('express').Router();
const PDFDocument = require('pdfkit');
const path = require('path'); // ✅ IMPORTANT
const pool = require('../db/pool');
const authOptional = require('../middleware/authOptional');

// ================= DOWNLOAD INVOICE PDF =================
router.get('/:invoice_id', authOptional, async (req, res) => {
  try {
    const { invoice_id } = req.params;

    // ================= GET INVOICE =================
    const invoiceRes = await pool.query(
      `SELECT i.*, o.customer_id, o.grand_total
       FROM invoices i
       JOIN orders o ON o.id = i.order_id
       WHERE i.id = $1`,
      [invoice_id]
    );

    if (!invoiceRes.rows.length) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceRes.rows[0];

    // ================= GET ITEMS =================
    const itemsRes = await pool.query(
      `SELECT oi.*, it.name
       FROM order_items oi
       LEFT JOIN items it ON it.id = oi.item_id
       WHERE oi.order_id = $1`,
      [invoice.order_id]
    );

    const items = itemsRes.rows;

    // ================= CREATE PDF =================
    const doc = new PDFDocument({ margin: 40 });

    // ✅ FIX ₹ SYMBOL (VERY IMPORTANT)
    const fontPath = path.join(__dirname, '../fonts/NotoSans-Regular.ttf');
    doc.font(fontPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${invoice.id}.pdf`
    );

    doc.pipe(res);

    // ================= FORMAT =================
    const fmt = (n) => `₹${Number(n || 0).toFixed(2)}`;

    // ================= HEADER =================
    doc.fontSize(20).text('ERP INVOICE', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Invoice No: ${invoice.invoice_no}`);
    doc.text(`Date: ${new Date(invoice.created_at).toDateString()}`);
    doc.text(`Customer ID: ${invoice.customer_id}`);
    doc.moveDown();

    // ================= ITEMS =================
    doc.fontSize(14).text('Items:');
    doc.moveDown(0.5);

    if (items.length === 0) {
      doc.fontSize(10).text('No items found');
    } else {
      items.forEach((item, i) => {
        doc.fontSize(10).text(
          `${i + 1}. ${item.name || 'Item'} | Qty: ${item.quantity} | Rate: ${fmt(item.rate)}`
        );
      });
    }

    doc.moveDown();

    // ================= TOTAL =================
    const subtotal = Number(invoice.subtotal || 0);
    const gst = 0;
    const total = subtotal;

    doc.fontSize(12).text(`Subtotal: ${fmt(subtotal)}`);
    doc.text(`GST (0%): ${fmt(gst)}`);
    doc.text(`Total: ${fmt(total)}`);

    doc.moveDown();

    // ================= FOOTER =================
    doc.fontSize(10).text('Thank you for your business!', {
      align: 'center',
    });

    doc.end();

  } catch (err) {
    console.error('PDF Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
