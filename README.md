# The One Furniture — studio workspace

A React + TypeScript frontend foundation for the interior operations PRD. Runs with sample data; no backend or live integrations are connected.

## Run locally

Requires Node.js 22.16+ (or a compatible newer LTS).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. In Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

```sh
npm run build
npm test
```

Browser tests use installed Microsoft Edge. Change the Playwright channel for other environments.

## Implemented

- Responsive owner overview, project health and cost visibility.
- Lead creation, source/owner/follow-up capture, pipeline stage changes and search.
- Editable room-wise BOQ, paise-based pricing and estimated line GST, save revision counter, approval locking and project baseline conversion.
- Projects, detail panels, search/status filters and CSV export.
- Task creation, assignment, due dates and status board.
- Master entries: create/edit categories, tax categories, vendors and category-wise product/items with SKU, unit, HSN, rates and reorder levels.
- Vendor-category-linked multi-line purchase orders, tax/rate snapshots, approval and partial/full material receipts.
- Store/site inventory, opening stock, stock issues for project consumption, movement history and low-stock filters.
- Expense claims and quantity/rate labour bills, with approval and manual settlement status.
- Demo GST/non-GST invoice drafts, finalization/cancellation, estimated tax splits and billing previews.
- Client receipts allocated to invoices, partial collections, receivables and ageing buckets.
- Project billed-revenue/cost contribution reports, cost breakdown and CSV export. This is not complete accounting or statutory invoicing.
- Persistent demo state, loading/error feedback, settings and reset.

## Backend handoff

Copy `.env.example` to `.env`, change `VITE_DATA_SOURCE` to `http`, and set `VITE_API_BASE_URL`. The UI consumes only `Repository`; demo storage and HTTP transport are isolated in `src/data/repository.ts`. Restart Vite after changing environment variables. See [API contract](docs/backend-contract.md) and [scope](docs/implementation-scope.md).

The HTTP adapter is provided but has not been tested against an actual server. Backend integration requires implementing the contract, authentication, authorization and server validation. No claim of production readiness is made.

All displayed contacts, amounts and assignments are sample data. The supplied client logo and screenshot-based rose palette are included. Google Fonts is optional; system font fallbacks work without it. Older saved demos gain the new master arrays without losing previous changes.
