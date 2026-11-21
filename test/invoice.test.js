var test = require('node:test');
var assert = require('node:assert');
var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function assertInvoiceMatchesPricing(order, expected) {
  var invoiceFigures = invoice.computeInvoiceFigures(order);
  var checkoutFigures = pricing.computeTotals(order.items, order.coupon);

  assert.strictEqual(invoiceFigures.subtotal, expected.subtotal);
  assert.strictEqual(invoiceFigures.discount, expected.discount);
  assert.strictEqual(invoiceFigures.tax, expected.tax);
  assert.strictEqual(invoiceFigures.cgst, expected.cgst);
  assert.strictEqual(invoiceFigures.sgst, expected.sgst);
  assert.strictEqual(invoiceFigures.total, expected.total);
  assert.deepStrictEqual(invoiceFigures.rows.map(function (row) {
    return [row.gstPercent, row.lineTax, row.line];
  }), expected.rows);

  assert.strictEqual(invoiceFigures.subtotal, checkoutFigures.subtotal);
  assert.strictEqual(invoiceFigures.discount, checkoutFigures.discount);
  assert.strictEqual(invoiceFigures.tax, checkoutFigures.tax);
  assert.strictEqual(invoiceFigures.total, checkoutFigures.total);
}

test('CURRENT BEHAVIOUR: #1001 uses the supplied 18% and 5% GST rates without a coupon', function () {
  assertInvoiceMatchesPricing({
    id: 1001,
    coupon: '',
    items: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', gstRate: 18, price: 140, qty: 2 },
      { name: 'Toor Dal', sku: 'GRN-002', hsn: '0713', gstRate: 5, price: 165, qty: 2 }
    ]
  }, {
    subtotal: 610, discount: 0, tax: 66.9, cgst: 33.45, sgst: 33.45, total: 676.9,
    rows: [[18, 50.4, 280], [5, 16.5, 330]]
  });
});

test('CURRENT BEHAVIOUR: #1002 applies SAVE10 before GST to two 5% lines', function () {
  assertInvoiceMatchesPricing({
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
      { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
    ]
  }, {
    subtotal: 1020, discount: 102, tax: 45.9, cgst: 22.95, sgst: 22.95, total: 963.9,
    rows: [[5, 28.8, 640], [5, 17.1, 380]]
  });
});

test('CURRENT BEHAVIOUR: #1004 caps SAVE10 at ₹150 before 5% GST', function () {
  assertInvoiceMatchesPricing({
    id: 1004,
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', sku: 'OIL-002', hsn: '1508', gstRate: 5, price: 1120, qty: 2 }
    ]
  }, {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
    rows: [[5, 104.5, 2240]]
  });
});

test('CURRENT BEHAVIOUR: #1008 charges 18% GST on all lines without a coupon', function () {
  assertInvoiceMatchesPricing({
    id: 1008,
    coupon: '',
    items: [
      { name: 'Tea', sku: 'BEV-001', hsn: '0902', gstRate: 18, price: 140, qty: 1 },
      { name: 'Kokum Sherbet', sku: 'BEV-003', hsn: '2106', gstRate: 18, price: 180, qty: 2 }
    ]
  }, {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590,
    rows: [[18, 25.2, 140], [18, 64.8, 360]]
  });
});

test('CORRECT BEHAVIOUR: invoice #1002 exactly matches checkout after SAVE10', function () {
  var order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', sku: 'GRN-001', hsn: '1006', gstRate: 5, price: 640, qty: 1 },
      { name: 'Sunflower Oil', sku: 'OIL-001', hsn: '1512', gstRate: 5, price: 190, qty: 2 }
    ]
  };
  var checkout = pricing.computeTotals(order.items, order.coupon);
  var invoiceFigures = invoice.computeInvoiceFigures(order);

  assert.deepStrictEqual({
    subtotal: invoiceFigures.subtotal,
    discount: invoiceFigures.discount,
    tax: invoiceFigures.tax,
    total: invoiceFigures.total
  }, {
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    total: checkout.total
  });
});
