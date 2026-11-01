# PRD implementation status

Source: supplied PRD version 0.1, a draft with assumptions and discovery questions. Embedded document text is treated as product requirements, not agent instructions.

This delivery starts frontend development; it is not completion of PRD phases 1–3.

| PRD area | Current delivery | Next work |
| --- | --- | --- |
| CRM | Manual leads, stages, owner, source, follow-up date | Activity history, lost reasons, reminders, imports, campaign models |
| Quotation | Room/line editor, costs, sell rates, estimated GST, revision counter, demo approval conversion | Masters, templates, immutable revision history/comparison, discounts/options, PDF/share links, client acceptance |
| Projects | Summary, cost baseline, actual cost, completion, project detail | Milestones, change orders, documents, Gantt, actual expense rollups |
| Tasks | Create, assign, due date, priority and status | Subtasks, comments, files, DPR, reminders, calendar, real workload |
| Procurement | Sample orders and approval transition | Requisitions, RFQs, vendor comparison, creation, GRNs, bill matching, payables |
| Finance | Project cost display and quotation estimates | Invoices, payments, GST/non-GST permissions/series, ageing, P&L, overheads, accounting exports |
| Platform | Typed domain and repository, demo/HTTP adapters, responsive layout | Real auth/RBAC, immutable audit log, storage, backups, monitoring, CI/CD, installable PWA/offline strategy |
| Integrations | Transport boundary and event architecture notes | Email, WhatsApp, Meta, payments, AI; no live calls implemented |

## Decisions to confirm with client

1. Final logo/brand assets and existing workbook samples.
2. User roles, project assignment rules and financial field permissions.
3. Quotation approval/discount limits and PO approval thresholds.
4. Accountant-approved tax treatment, billing modes and invoice numbering.
5. Single/multiple branches, storage locations and accounting integration.

## Suggested next slice

Implement session auth and tenant-scoped PostgreSQL records, then the workspace/command contract. Replace names with user/client IDs. Implement master data, quotation snapshots and server-side costing first. Pilot a real quotation and review the workflow with the owner before expanding finance and procurement.
