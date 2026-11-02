import type { Entity, Workspace } from './domain';

export const expenseCategories=['Materials','Transport','Site expenses','Contractor','Overheads','Miscellaneous'] as const;
export type CostStatus='Pending approval'|'Approved'|'Paid';
export interface Expense extends Entity { projectId:string; description:string; category:typeof expenseCategories[number]; claimant:string; amount:number; date:string; reference:string; status:CostStatus }
export interface LabourEntry extends Entity { projectId:string; payee:string; work:string; basis:'Day-based'|'Measurement-based'|'Lump sum'; unit:string; quantity:number; ratePaise:number; amount:number; date:string; status:CostStatus }
export interface InvoiceLine { id:string; description:string; quantity:number; unit:string; pricePaise:number; gstPercent:number }
export interface Invoice extends Entity { reference:string; projectId:string; client:string; mode:'GST'|'Non-GST'; taxTreatment:'Split GST'|'IGST'|'No GST'; date:string; due:string; status:'Draft'|'Issued'|'Cancelled'; lines:InvoiceLine[]; note:string }
export interface ClientPayment extends Entity { invoiceId:string; projectId:string; amount:number; date:string; mode:'Bank transfer'|'UPI'|'Cash'|'Cheque'; reference:string; note:string }

export function invoiceTotals(invoice:Pick<Invoice,'lines'|'mode'|'taxTreatment'>){
 const subtotal=invoice.lines.reduce((sum,line)=>sum+Math.round(line.quantity*line.pricePaise),0);
 const tax=invoice.mode==='Non-GST'?0:invoice.lines.reduce((sum,line)=>sum+Math.round(Math.round(line.quantity*line.pricePaise)*line.gstPercent/100),0);
 const cgst=invoice.taxTreatment==='Split GST'?Math.floor(tax/2):0;
 return {subtotal,tax,cgst,sgst:invoice.taxTreatment==='Split GST'?tax-cgst:0,igst:invoice.taxTreatment==='IGST'?tax:0,total:subtotal+tax};
}
export function paidAgainst(data:Pick<Workspace,'payments'>,invoiceId:string){return data.payments.filter(p=>p.invoiceId===invoiceId).reduce((sum,p)=>sum+p.amount,0);}
export function outstanding(data:Pick<Workspace,'payments'>,invoice:Invoice){return invoice.status==='Issued'?Math.max(0,invoiceTotals(invoice).total-paidAgainst(data,invoice.id)):0;}
export const businessDate=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Kolkata'});
export function daysOverdue(due:string,asOf=businessDate()){return Math.max(0,Math.floor((Date.parse(asOf+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));}
export function projectFinancials(data:Workspace,projectId:string){
 const project=data.projects.find(p=>p.id===projectId);
 const invoices=data.invoices.filter(i=>i.projectId===projectId&&i.status==='Issued');
 const revenue=invoices.reduce((s,i)=>s+invoiceTotals(i).subtotal,0);
 const collected=data.payments.filter(p=>p.projectId===projectId).reduce((s,p)=>s+p.amount,0);
 const receivable=invoices.reduce((s,i)=>s+outstanding(data,i),0);
 const expenses=data.expenses.filter(e=>e.projectId===projectId&&e.status!=='Pending approval').reduce((s,e)=>s+e.amount,0);
 const labour=data.labourEntries.filter(e=>e.projectId===projectId&&e.status!=='Pending approval').reduce((s,e)=>s+e.amount,0);
 const actual=project?.spent||0;
 return {revenue,collected,receivable,actual,expenses,labour,carriedForward:actual-expenses-labour,contribution:revenue-actual,margin:revenue?(revenue-actual)/revenue*100:0,budget:project?.budget||0};
}
