# Backend integration contract

## Transport boundary

The app depends on `Repository` in `src/data/repository.ts`; all entities and payload types live in `src/domain.ts`. Use this as the initial integration contract. The recommended FastAPI/PostgreSQL backend from the PRD can implement it independently of the UI stack.

Base URL: `VITE_API_BASE_URL`, default `/api/v1`. JSON requests and responses. Requests use `credentials: include`; implement secure HttpOnly session cookies, CSRF protection for mutation requests, same-origin deployment or explicit credentialed CORS. No secrets belong in Vite variables. The demo has an owner persona, not authentication.

### GET /workspace

Returns `Workspace` containing arrays `leads`, `quotations`, `projects`, `tasks`, `purchases`. Return only records and sensitive fields authorized for the session. Current screens represent the owner experience and expect the full owner schema; add permission-aware DTOs/UI before enabling other personas. Introduce pagination/list endpoints as real data volumes grow, behind the repository boundary.

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

Amounts are integer paise. Quantities are decimal numbers; backend should use Decimal and define consistent rounding. `Lead.value`, project budget/spent, purchase amount and quote cost/price are all paise. Quote line tax currently rounds per line to nearest paise. GST is only an estimated UI calculation; final place-of-supply, tax classification and invoice rules belong on the server. Project baseline uses internal cost, not the GST-inclusive selling value. Keep contract revenue separately in the production schema.

Errors: non-2xx responses show a generic status error. Recommended statuses: 401 unauthenticated, 403 forbidden, 409 stale/duplicate command, 422 validation failure. Extend the adapter with structured field errors when backend validation is available. Never silently fall back to sample data in HTTP mode.

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
  "purchases": []
}
```
