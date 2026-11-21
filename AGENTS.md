# ShopLedger

## Stack

Node.js with Express and body-parser; a static browser UI in `public/`; synchronous JSON persistence in `data/db.json`.

## Module map

- `routes/products.js` — product listing and active coupon endpoints.
- `routes/orders.js` — order listing, creation, and cancellation endpoints.
- `routes/customers.js` — customer listing and Khata settlement endpoint.
- `routes/reports.js` — dashboard, GST reconciliation, pricing preview, and admin export endpoints.
- `lib/coupons.js` — coupon normalization, validation, and discount calculation.
- `lib/dates.js` — date formatting, normalization, and fiscal-year calculation.
- `lib/inventory.js` — product lookup, stock checks, stock changes, and inventory summary.
- `lib/invoice.js` — invoice figures and printable HTML rendering.
- `lib/ledger.js` — customer balances, Khata charges/reversals, and settlements.
- `lib/orders.js` — order creation, lookup, cancellation, and filtering.
- `lib/pricing.js` — subtotal, discount, per-line GST, and total calculation.
- `lib/reports.js` — dashboard totals and GST reconciliation.
- `lib/store.js` — reads, writes, and audits the JSON datastore.
- `lib/tax.js` — GST rate resolution and CGST/SGST split.

## Commands

```sh
npm start
node --test test/invoice.test.js
```

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Tests never read or write `data/db.json`; they use in-memory data.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

Invoice total and GST breakdown do not match what the customer was billed. Allowed files: `lib/invoice.js` (`lib/tax.js` only if truly needed).
