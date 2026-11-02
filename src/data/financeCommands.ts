import type { Workspace } from '../domain';
import { expenseCategories, invoiceTotals, outstanding, type Expense, type LabourEntry, type Invoice, type InvoiceLine, type ClientPayment } from '../finance';

export interface FinanceCommands {
 'expense.create':Omit<Expense,'id'|'tenantId'|'status'>;
 'labour.create':Omit<LabourEntry,'id'|'tenantId'|'status'|'amount'>;
 'cost.approve':{id:string;kind:'expense'|'labour'};
 'cost.pay':{id:string;kind:'expense'|'labour'};
 'invoice.create':{projectId:string;mode:Invoice['mode'];taxTreatment:Invoice['taxTreatment'];date:string;due:string;lines:InvoiceLine[];note:string};
 'invoice.issue':{id:string};
 'invoice.cancel':{id:string};
 'payment.create':Omit<ClientPayment,'id'|'tenantId'|'projectId'>;
}
type FinanceCommand = {[K in keyof FinanceCommands]:{type:K;payload:FinanceCommands[K]}}[keyof FinanceCommands];
function assert(value:unknown,message:string):asserts value {if(!value)throw Error(message);}
function amount(value:number){assert(Number.isSafeInteger(value)&&value>0&&value<=1e12,'Enter a valid positive amount.');}
function validDate(value:string){assert(/^\d{4}-\d{2}-\d{2}$/.test(value)&&new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value,'Enter a valid date.');}
export function isFinanceCommand(type:string){return ['expense.','labour.','cost.','invoice.','payment.'].some(prefix=>type.startsWith(prefix));}
export function applyFinanceCommand(data:Workspace,command:FinanceCommand){
 const entity={id:crypto.randomUUID(),tenantId:'the-one-demo'};
 switch(command.type){
 case 'expense.create':{
  const p=command.payload;assert(data.projects.some(project=>project.id===p.projectId),'Select a valid project.');assert(p.description.trim()&&p.claimant.trim(),'Add a description and claimant.');assert(expenseCategories.includes(p.category),'Select a valid expense category.');amount(p.amount);validDate(p.date);data.expenses.unshift({...p,...entity,status:'Pending approval'});break;
 }
 case 'labour.create':{
  const p=command.payload;assert(data.projects.some(project=>project.id===p.projectId),'Select a valid project.');assert(p.payee.trim()&&p.work.trim()&&p.unit.trim(),'Add the payee, work and measurement unit.');assert(['Day-based','Measurement-based','Lump sum'].includes(p.basis),'Select a valid labour billing basis.');assert(Number.isFinite(p.quantity)&&p.quantity>0&&p.quantity<=1e9,'Enter a valid work quantity.');amount(p.ratePaise);const total=Math.round(p.quantity*p.ratePaise);amount(total);validDate(p.date);data.labourEntries.unshift({...p,...entity,amount:total,status:'Pending approval'});break;
 }
 case 'cost.approve':case 'cost.pay':{
  const p=command.payload;const entry=p.kind==='expense'?data.expenses.find(e=>e.id===p.id):data.labourEntries.find(e=>e.id===p.id);assert(entry,'Cost entry not found.');
  if(command.type==='cost.approve'){assert(entry.status==='Pending approval','Only pending costs can be approved.');const project=data.projects.find(project=>project.id===entry.projectId);assert(project,'Project not found.');project.spent+=entry.amount;entry.status='Approved';}
  else {assert(entry.status==='Approved','Only approved costs can be marked paid.');entry.status='Paid';}break;
 }
 case 'invoice.create':{
  const p=command.payload;const project=data.projects.find(project=>project.id===p.projectId);assert(project,'Select a project.');assert(['GST','Non-GST'].includes(p.mode),'Select a billing mode.');assert(p.mode==='Non-GST'?p.taxTreatment==='No GST':['Split GST','IGST'].includes(p.taxTreatment),'Select a matching tax treatment.');validDate(p.date);validDate(p.due);assert(p.due>=p.date,'Due date cannot be before invoice date.');assert(p.lines.length,'Add at least one billing line.');
  const lines=p.lines.map(line=>{assert(line.description.trim()&&line.unit.trim(),'Line description and unit are required.');assert(Number.isFinite(line.quantity)&&line.quantity>0&&line.quantity<=1e9,'Enter a positive line quantity.');amount(line.pricePaise);assert(Number.isFinite(line.gstPercent)&&line.gstPercent>=0&&line.gstPercent<=100,'Select a valid estimated GST rate.');return {...line,id:crypto.randomUUID(),gstPercent:p.mode==='Non-GST'?0:line.gstPercent};});
  const totals=invoiceTotals({...p,lines});amount(totals.total);
  data.invoices.unshift({...p,...entity,reference:`${p.mode==='GST'?'GST':'NGST'}-DEMO-${entity.id.slice(0,8).toUpperCase()}`,client:project.client,lines,status:'Draft'});break;
 }
 case 'invoice.issue':{
  const invoice=data.invoices.find(i=>i.id===command.payload.id);assert(invoice?.status==='Draft','Only draft invoices can be finalized.');assert(invoiceTotals(invoice).total>0,'An invoice must have a positive value.');invoice.status='Issued';break;
 }
 case 'invoice.cancel':{
  const invoice=data.invoices.find(i=>i.id===command.payload.id);assert(invoice&&invoice.status!=='Cancelled','Invoice is already cancelled or missing.');assert(!data.payments.some(p=>p.invoiceId===invoice.id),'This invoice has receipts. A credit/refund workflow is required before cancellation.');invoice.status='Cancelled';break;
 }
 case 'payment.create':{
  const p=command.payload;const invoice=data.invoices.find(i=>i.id===p.invoiceId);assert(invoice?.status==='Issued','Payments can only be allocated to issued invoices.');amount(p.amount);assert(p.amount<=outstanding(data,invoice),'Payment exceeds the invoice outstanding.');validDate(p.date);assert(p.date>=invoice.date,'Payment date cannot precede the invoice date.');assert(['Bank transfer','UPI','Cash','Cheque'].includes(p.mode),'Select a payment mode.');assert(p.reference.trim(),'Add a payment reference.');assert(!data.payments.some(payment=>payment.reference.toLowerCase()===p.reference.trim().toLowerCase()),'That payment reference has already been recorded.');data.payments.unshift({...p,...entity,reference:p.reference.trim(),projectId:invoice.projectId});break;
 }
 default:throw Error('Unsupported financial action.');
 }
}
