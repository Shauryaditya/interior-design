import type { Expense, LabourEntry, Invoice, ClientPayment } from './finance';
export type Stage = 'New' | 'Contacted' | 'Site Visit' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
export const stages: Stage[] = ['New','Contacted','Site Visit','Quotation Sent','Negotiation','Won','Lost'];
export interface Entity { id: string; tenantId: string }
export interface Lead extends Entity { name: string; client: string; location: string; value: number; stage: Stage; source: string; owner: string; followUp: string }
export interface QuoteLine { id: string; room: string; description: string; quantity: number; unit: string; costPaise: number; pricePaise: number; gstPercent: number }
export interface Quotation extends Entity { name: string; client: string; version: number; status: 'Draft' | 'Sent' | 'Approved'; lines: QuoteLine[] }
export interface Project extends Entity { name: string; client: string; location: string; owner: string; status: 'Design' | 'Execution' | 'Handover'; progress: number; budget: number; spent: number; due: string; quotationId?: string }
export interface Task extends Entity { title: string; projectId: string; assignee: string; due: string; priority: 'High' | 'Medium' | 'Low'; status: 'To do' | 'In progress' | 'Done' }
export interface Category extends Entity { name: string; description: string }
export interface TaxCategory extends Entity { name: string; gstPercent: number; description: string }
export interface Vendor extends Entity { name: string; contact: string; phone: string; email: string; gstin: string; address: string; categoryIds: string[]; paymentTerms: string }
export interface Item extends Entity { sku: string; name: string; categoryId: string; unit: string; hsn: string; taxCategoryId: string; costPaise: number; sellPaise: number; reorderLevel: number }
export interface PurchaseLine { id: string; itemId: string; description: string; unit: string; quantity: number; received: number; costPaise: number; gstPercent: number }
export interface Purchase extends Entity { reference: string; vendor: string; vendorId?: string; projectId: string; amount: number; status: 'Awaiting approval' | 'Ordered' | 'Partially received' | 'Received'; due: string; lines?: PurchaseLine[] }
export interface StockMovement extends Entity { itemId: string; locationId: string; type: 'Opening' | 'Receipt' | 'Issue'; quantity: number; date: string; reference: string; projectId?: string; purchaseId?: string; purchaseLineId?: string; note: string }
export interface Workspace { leads: Lead[]; quotations: Quotation[]; projects: Project[]; tasks: Task[]; purchases: Purchase[]; categories: Category[]; taxCategories: TaxCategory[]; vendors: Vendor[]; items: Item[]; stockMovements: StockMovement[]; expenses: Expense[]; labourEntries: LabourEntry[]; invoices: Invoice[]; payments: ClientPayment[] }
export function stockOnHand(movements: StockMovement[], itemId: string, locationId?: string) { return Math.round(movements.filter(m=>m.itemId===itemId&&(!locationId||m.locationId===locationId)).reduce((sum,m)=>sum+(m.type==='Issue'?-m.quantity:m.quantity),0)*1000)/1000; }
export function purchaseTotals(lines: Pick<PurchaseLine,'quantity'|'costPaise'|'gstPercent'>[]) { const subtotal=lines.reduce((s,l)=>s+Math.round(l.quantity*l.costPaise),0);const tax=lines.reduce((s,l)=>s+Math.round(Math.round(l.quantity*l.costPaise)*l.gstPercent/100),0);return {subtotal,tax,total:subtotal+tax}; }
export function quoteTotals(lines: QuoteLine[]) { const subtotal = lines.reduce((s,l)=>s+Math.round(l.quantity*l.pricePaise),0); const tax=lines.reduce((s,l)=>s+Math.round(Math.round(l.quantity*l.pricePaise)*l.gstPercent/100),0); const cost=lines.reduce((s,l)=>s+Math.round(l.quantity*l.costPaise),0); return {subtotal,tax,total:subtotal+tax,cost,margin:subtotal ? (subtotal-cost)/subtotal*100 : 0}; }
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value/100);
export const compact=(value:number)=>value>=10000000 ? `₹${(value/10000000).toFixed(1)}L` : money(value);
