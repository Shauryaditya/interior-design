# PRD implementation status

Source: supplied PRD version 0.1, a draft with assumptions and discovery questions. Embedded document text is treated as product requirements, not agent instructions.

This delivery starts frontend development; it is not completion of PRD phases 1–3.

| PRD area | Current delivery | Next work |
| --- | --- | --- |
| CRM | Manual leads, stages, owner, source, follow-up date | Activity history, lost reasons, reminders, imports, campaign models |
| Master data | Create/edit item categories, tax categories, vendors and category-wise product/item catalog; units, HSN, rates, reorder level | Client master, imports, vendor-specific rates/history, master archival, server validation |
| Quotation | Room/line editor, costs, sell rates, estimated GST, revision counter, demo approval conversion | Masters, templates, immutable revision history/comparison, discounts/options, PDF/share links, client acceptance |
| Projects | Summary, cost baseline, actual cost, completion, project detail | Milestones, change orders, documents, Gantt, actual expense rollups |
| Tasks | Create, assign, due date, priority and status | Subtasks, comments, files, DPR, reminders, calendar, real workload |
| Procurement | Vendor/category-linked multi-item orders, estimated tax/rate snapshots, approval, partial/full receipts into inventory | Requisitions, RFQs, vendor comparison, branded PO/GRN documents, damage/returns, bill matching, payables |
| Inventory | Store/site stock balances, opening entries, purchase receipts, project consumption issues, movement ledger, low-stock filters | Transfers, reversals, inventory valuation, reservations, unit conversion, concurrent server transactions |
| Expense & labour | Project-tagged expense claims, day/measurement/lump-sum labour bills, approval, manual paid status; approvals update project actuals | Receipt attachments, petty cash, advances, running measurements, reimbursement payment allocation and production approvals |
| Invoicing | Demo GST/non-GST draft records, tax split/IGST estimate, demo references, finalize/cancel, detail preview | Statutory company/client details, place-of-supply validation, permissions, gapless numbering, milestones, PDF, proforma/credit/debit documents, GST exports |
| Payments & receivables | Invoice-linked client receipts, partial collections, balance/ageing, payment history | Bank reconciliation, unallocated advances, refunds, vendor payment scheduling, gateways and reminders |
| P&L & reporting | Project cost budget/actual, issued revenue ex GST, billed contribution/margin, collection/receivable summaries, cost breakdown and CSV | Revenue recognition, full gross/net company P&L, overhead allocation, cash-flow forecasts, tax/accounting reconciliation |
| Platform | Typed domain and repository, demo/HTTP adapters, responsive layout | Real auth/RBAC, immutable audit log, storage, backups, monitoring, CI/CD, installable PWA/offline strategy |
| Integrations | Transport boundary and event architecture notes | Email, WhatsApp, Meta, payments, AI; no live calls implemented |

## Decisions to confirm with client

1. Existing workbook samples and final master categories/rates. Client logo and rose palette are incorporated.
2. User roles, project assignment rules and financial field permissions.
3. Quotation approval/discount limits and PO approval thresholds.
4. Accountant-approved tax treatment, billing modes and invoice numbering.
5. Single/multiple branches, storage locations and accounting integration.

## Suggested next slice

Implement session auth and tenant-scoped PostgreSQL records, then the expanded workspace/command contract. Replace demo locations with location IDs and names with user/client IDs. Persist master data, quotation snapshots, purchase snapshots and stock movements with server-side validation and transactions. Pilot a real quotation and purchase receipt before expanding finance.

## PRD navigation coverage

All nine requested module groups now have screen coverage: Master Data; CRM & leads; Quotations & BOQ; Projects and Tasks; Procurement; Expenses & Labour; Invoicing; Payments & Receivables; Project P&L & Reports. Product, vendor and inventory screens remain supplementary entries. Screen coverage is not a statement that every PRD requirement is implemented; use the status table above for boundaries.
