export type Stage = 'New' | 'Contacted' | 'Site Visit' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost';
export const stages: Stage[] = ['New','Contacted','Site Visit','Quotation Sent','Negotiation','Won','Lost'];
export interface Entity { id: string; tenantId: string }
export interface Lead extends Entity { name: string; client: string; location: string; value: number; stage: Stage; source: string; owner: string; followUp: string }
export interface QuoteLine { id: string; room: string; description: string; quantity: number; unit: string; costPaise: number; pricePaise: number; gstPercent: number }
export interface Quotation extends Entity { name: string; client: string; version: number; status: 'Draft' | 'Sent' | 'Approved'; lines: QuoteLine[] }
export interface Project extends Entity { name: string; client: string; location: string; owner: string; status: 'Design' | 'Execution' | 'Handover'; progress: number; budget: number; spent: number; due: string; quotationId?: string }
export interface Task extends Entity { title: string; projectId: string; assignee: string; due: string; priority: 'High' | 'Medium' | 'Low'; status: 'To do' | 'In progress' | 'Done' }
export interface Purchase extends Entity { reference: string; vendor: string; projectId: string; amount: number; status: 'Awaiting approval' | 'Ordered' | 'Received'; due: string }
export interface Workspace { leads: Lead[]; quotations: Quotation[]; projects: Project[]; tasks: Task[]; purchases: Purchase[] }
export function quoteTotals(lines: QuoteLine[]) { const subtotal = lines.reduce((s,l)=>s+Math.round(l.quantity*l.pricePaise),0); const tax=lines.reduce((s,l)=>s+Math.round(Math.round(l.quantity*l.pricePaise)*l.gstPercent/100),0); const cost=lines.reduce((s,l)=>s+Math.round(l.quantity*l.costPaise),0); return {subtotal,tax,total:subtotal+tax,cost,margin:subtotal ? (subtotal-cost)/subtotal*100 : 0}; }
export const money=(value:number)=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(value/100);
export const compact=(value:number)=>value>=10000000 ? `₹${(value/10000000).toFixed(1)}L` : money(value);
