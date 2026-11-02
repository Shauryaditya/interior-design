# Backend integration contract

## Transport boundary

The app depends on `Repository` in `src/data/repository.ts`; all entities and payload types live in `src/domain.ts`. Use this as the initial integration contract. The recommended FastAPI/PostgreSQL backend from the PRD can implement it independently of the UI stack.

Base URL: `VITE_API_BASE_URL`, default `/api/v1`. JSON requests and responses. Requests use `credentials: include`; implement secure HttpOnly session cookies, CSRF protection for mutation requests, same-origin deployment or explicit credentialed CORS. No secrets belong in Vite variables. The demo has an owner persona, not authentication.

### GET /workspace

Returns `Workspace` containing arrays `leads`, `quotations`, `projects`, `tasks`, `purchases`, `categories`, `taxCategories`, `vendors`, `items`, `stockMovements`. Return only records and sensitive fields authorized for the session. Current screens represent the owner experience and expect the full owner schema; add permission-aware DTOs/UI before enabling other personas. Introduce pagination/list endpoints as real data volumes grow, behind the repository boundary.

### POST /commands

Request: `{ "type": "lead.stage", "payload": { "id": "…", "stage": "Contacted" } }`.

Response: fresh authorized `Workspace`, committed transactionally after success. Initial command types:

| Type | Payload | Server responsibilities |
| --- | --- | --- |
| lead.create | name, client, location, value, stage, source, owner, followUp | Validate fields, ownership and source; generate ID and tenant |
| lead.stage | id, stage | Validate stage transition; require lost reason when implementing production lost flow |
| task.create | title, projectId, assignee, due, priority, status | Verify project and assignee membership |
| task.status | id, status | Validate project access and transition |
| quote.save | id, lines | Recalculate totals; immutable revision snapshot; reject approved quotation edits |
| quote.convert | id | Require approval rights; atomically lock approved revision and create exactly one cost baseline project |
| purchase.approve | id | Enforce approval threshold and separation of duties; audit transition |
| category.save | optional id, name, description | Create/update; enforce tenant-scoped unique category name |
| tax.save | optional id, name, gstPercent, description | Create/update; verify classification; preserve existing document tax snapshots |
| vendor.save | optional id, name, contact, phone, email, gstin, address, categoryIds, paymentTerms | Validate references and GSTIN; maintain access controls on contact data |
| item.save | optional id, sku, name, categoryId, unit, hsn, taxCategoryId, costPaise, sellPaise, reorderLevel | Unique SKU; validate units, rates and references; lock units after purchase/stock activity |
| purchase.create | vendorId, projectId, due, lines: [{itemId, quantity, costPaise}] | Validate vendor categories, generate order number; snapshot description, unit, price and tax; calculate totals server-side |
| purchase.receive | id, locationId, date, note, lines: [{lineId, quantity}] | Lock order and stock rows; prohibit excess receipts; atomically append stock movements and update received quantities/status |
| stock.opening | itemId, locationId, quantity, date, note | Authorized opening balance entry with reference and audit event |
| stock.issue | itemId, locationId, projectId, quantity, date, note | Verify stock under a transaction/lock, prohibit negative stock, record project consumption |

Amounts are integer paise. Quantities are decimal numbers; backend should use Decimal and define consistent rounding. `Lead.value`, project budget/spent, purchase amount and quote cost/price are all paise. Quote line tax currently rounds per line to nearest paise. GST is only an estimated UI calculation; final place-of-supply, tax classification and invoice rules belong on the server. Project baseline uses internal cost, not the GST-inclusive selling value. Keep contract revenue separately in the production schema.

Errors: non-2xx responses show a generic status error. Recommended statuses: 401 unauthenticated, 403 forbidden, 409 stale/duplicate command, 422 validation failure. Extend the adapter with structured field errors when backend validation is available. Never silently fall back to sample data in HTTP mode.

## Catalog, purchasing and stock semantics

Master command payloads and demo validation are defined in `src/data/masterCommands.ts`. Master entries support create and edit, without deletion. Items are stocked materials with explicit units; service procurement, vendor-specific rates and unit conversions are later extensions. Item HSN values are separate from reusable tax categories and may remain blank during demo setup.

New purchase orders reference vendor, item and project IDs. They snapshot each item's description, unit, negotiated cost and GST percentage. Vendor edits and future master-rate changes do not reprice existing orders. `amount` is the estimated GST-inclusive total. The three historical sample orders retain their old summary values and cannot receive stock without line data; new orders demonstrate the complete flow.

Order states: Awaiting approval → Ordered → Partially received → Received. Receipts accept individual line quantities at a selected store/site and update the stock ledger. Fully received orders cannot receive again. Backends must reject stale/duplicate receipt submissions using idempotency keys and locking; the single-browser demo only checks remaining balances.

Stock is derived from immutable-in-UI movements: Opening + Receipt − Issue, by item and location. `store` is the demo main store; project IDs represent site locations. Replace these with tenant-scoped `StockLocation` records for production. Issues represent consumption assigned to a project, not transfers; transfers/returns, damaged goods, stock counts, valuation, expiry/serial/batch tracking and issue costing are not implemented. Project financial actuals are not recalculated by these quantity-only movements. Reorder levels are item-wide guidance; location filters use the same configured level as a reference.

The browser demo adds the new master/stock arrays to older saved workspaces without replacing existing lead/project/task/quotation/purchase records. HTTP mode expects the full expanded schema and does not seed missing server data.

## Integrity before production

- Derive tenant and user from verified session; never trust browser tenant IDs or owner names. Replace demo owner strings with user IDs.
- Enforce row- and field-level permissions server-side. Hiding UI is not security.
- Persist immutable quotation revisions and audit events. Demo revision numbers do not preserve historical snapshots.
- Use transactions, unique quotation-to-project constraints, version/ETag concurrency checks and idempotency keys for financial actions.
- Protect invoice series, payments, cancellation and financial state changes in server transactions.
- Store signed-upload metadata separately; validate attachments and issue short-lived object-storage URLs.
- Use server business dates and Asia/Kolkata presentation; seed dates are deliberately fixed examples.
- Define an outbox/event envelope with eventId, tenantId, actorId, entityId, type, occurredAt, schemaVersion and payload for future notification/WhatsApp/Meta consumers. No outbound integration runs in this demo.

## Example response fragment

```json
{
  "leads": [{"id":"l1","tenantId":"tenant-1","name":"Residence","client":"Client","location":"Mumbai","value":250000000,"stage":"New","source":"Referral","owner":"Designer","followUp":"2026-11-10"}],
  "quotations": [],
  "projects": [],
  "tasks": [],
  "purchases": [],
  "categories": [],
  "taxCategories": [],
  "vendors": [],
  "items": [],
  "stockMovements": []
}
```
