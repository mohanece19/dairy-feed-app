function generateInvoiceNo(id) {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(id).padStart(6, '0')}`;
}

module.exports = { generateInvoiceNo };
