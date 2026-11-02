import { purchaseTotals, stockOnHand, type Category, type Item, type PurchaseLine, type TaxCategory, type Vendor, type Workspace } from '../domain';

type Entry<T> = Omit<T,'id'|'tenantId'> & {id?:string};
export interface MasterCommands {
 'category.save': Entry<Category>;
 'tax.save': Entry<TaxCategory>;
 'vendor.save': Entry<Vendor>;
 'item.save': Entry<Item>;
 'purchase.create': {vendorId:string;projectId:string;due:string;lines:{itemId:string;quantity:number;costPaise:number}[]};
 'purchase.receive': {id:string;locationId:string;date:string;note:string;lines:{lineId:string;quantity:number}[]};
 'stock.opening': {itemId:string;locationId:string;quantity:number;date:string;note:string};
 'stock.issue': {itemId:string;locationId:string;projectId:string;quantity:number;date:string;note:string};
}
type MasterCommand = {[K in keyof MasterCommands]:{type:K;payload:MasterCommands[K]}}[keyof MasterCommands];
function assert(value:unknown,message:string):asserts value { if(!value)throw Error(message); }
function amount(value:number,positive=false){assert(Number.isFinite(value)&&(positive?value>0:value>=0)&&value<=1e12,'Enter a valid non-negative amount or quantity.');}
function date(value:string){assert(/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value)),'Enter a valid date.');}
function location(data:Workspace,id:string){assert(id==='store'||data.projects.some(p=>p.id===id),'Select a valid stock location.');}
function upsert<T extends {id:string}>(records:T[],entry:T,editing:boolean){const index=records.findIndex(x=>x.id===entry.id);assert(!editing||index>=0,'Record no longer exists.');if(index>=0)records[index]=entry;else records.unshift(entry);}
export function applyMasterCommand(data:Workspace,command:MasterCommand):void {
 const entity={id:crypto.randomUUID(),tenantId:'the-one-demo'};
 switch(command.type){
 case 'category.save':{
  const p=command.payload;const name=p.name.trim();assert(name,'Category name is required.');assert(!data.categories.some(c=>c.id!==p.id&&c.name.toLowerCase()===name.toLowerCase()),'That category already exists.');
  upsert(data.categories,{...p,...entity,id:p.id||entity.id,name},!!p.id);break;
 }
 case 'tax.save':{
  const p=command.payload;const name=p.name.trim();assert(name,'Tax category name is required.');amount(p.gstPercent);assert(p.gstPercent<=100,'GST rate must be between 0 and 100.');assert(!data.taxCategories.some(t=>t.id!==p.id&&t.name.toLowerCase()===name.toLowerCase()),'That tax category already exists.');
  upsert(data.taxCategories,{...p,...entity,id:p.id||entity.id,name},!!p.id);break;
 }
 case 'vendor.save':{
  const p=command.payload;const name=p.name.trim();assert(name,'Vendor name is required.');assert(!data.vendors.some(v=>v.id!==p.id&&v.name.toLowerCase()===name.toLowerCase()),'That vendor already exists.');assert(p.categoryIds.length&&p.categoryIds.every(id=>data.categories.some(c=>c.id===id)),'Select at least one valid vendor category.');assert(!p.gstin||/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(p.gstin),'Enter a valid 15-character GSTIN, or leave it blank.');
  upsert(data.vendors,{...p,...entity,id:p.id||entity.id,name},!!p.id);break;
 }
 case 'item.save':{
  const p=command.payload;const name=p.name.trim();const sku=p.sku.trim().toUpperCase();assert(name&&sku&&p.unit.trim(),'Item name, SKU and unit are required.');assert(!data.items.some(i=>i.id!==p.id&&i.sku.toUpperCase()===sku),'That SKU is already in use.');assert(data.categories.some(c=>c.id===p.categoryId),'Select a valid category.');assert(data.taxCategories.some(t=>t.id===p.taxCategoryId),'Select a valid tax category.');amount(p.costPaise);amount(p.sellPaise);amount(p.reorderLevel);assert(Number.isInteger(p.costPaise)&&Number.isInteger(p.sellPaise),'Rates must use integer paise.');
  if(p.id){const old=data.items.find(i=>i.id===p.id);assert(!old||old.unit===p.unit||(!data.stockMovements.some(m=>m.itemId===p.id)&&!data.purchases.some(po=>po.lines?.some(l=>l.itemId===p.id))),'The unit is locked after stock or purchase activity.');}
  upsert(data.items,{...p,...entity,id:p.id||entity.id,name,sku},!!p.id);break;
 }
 case 'purchase.create':{
  const p=command.payload;const vendor=data.vendors.find(v=>v.id===p.vendorId);assert(vendor,'Select a valid vendor.');assert(data.projects.some(x=>x.id===p.projectId),'Select a project.');date(p.due);assert(p.lines.length,'Add at least one item.');assert(new Set(p.lines.map(l=>l.itemId)).size===p.lines.length,'Combine duplicate items into one line.');
  const lines:PurchaseLine[]=p.lines.map(line=>{const item=data.items.find(i=>i.id===line.itemId);assert(item,'Select a valid item.');assert(vendor.categoryIds.includes(item.categoryId),'This vendor does not supply the selected item category.');amount(line.quantity,true);amount(line.costPaise);assert(Number.isInteger(line.costPaise),'Rates must use integer paise.');const tax=data.taxCategories.find(t=>t.id===item.taxCategoryId);assert(tax,'Item tax category is missing.');return {id:crypto.randomUUID(),itemId:item.id,description:item.name,unit:item.unit,quantity:line.quantity,received:0,costPaise:line.costPaise,gstPercent:tax.gstPercent};});
  data.purchases.unshift({...entity,reference:`PO-DEMO-${entity.id.slice(0,8).toUpperCase()}`,vendor:vendor.name,vendorId:vendor.id,projectId:p.projectId,due:p.due,status:'Awaiting approval',amount:purchaseTotals(lines).total,lines});break;
 }
 case 'purchase.receive':{
  const p=command.payload;const po=data.purchases.find(x=>x.id===p.id);assert(po?.lines?.length,'Historical sample orders have no item lines. Create a new order to receive stock.');assert(po.status==='Ordered'||po.status==='Partially received','Only approved, open orders can be received.');location(data,p.locationId);date(p.date);assert(p.lines.length&&p.lines.some(l=>l.quantity>0),'Enter at least one receipt quantity.');assert(new Set(p.lines.map(l=>l.lineId)).size===p.lines.length,'Duplicate receipt lines are not allowed.');
  for(const input of p.lines){const line=po.lines.find(l=>l.id===input.lineId);assert(line,'Receipt line not found.');amount(input.quantity);const received=Math.round((line.received+input.quantity)*1000)/1000;assert(received<=line.quantity,'Receipt quantity exceeds the ordered balance.');if(!input.quantity)continue;line.received=received;data.stockMovements.unshift({...entity,id:crypto.randomUUID(),itemId:line.itemId,locationId:p.locationId,type:'Receipt',quantity:input.quantity,date:p.date,reference:po.reference,projectId:po.projectId,purchaseId:po.id,purchaseLineId:line.id,note:p.note});}
  po.status=po.lines.every(l=>l.received===l.quantity)?'Received':'Partially received';break;
 }
 case 'stock.opening':case 'stock.issue':{
  const p=command.payload;assert(data.items.some(i=>i.id===p.itemId),'Select an item.');location(data,p.locationId);date(p.date);amount(p.quantity,true);assert(p.note.trim(),'Add a reason or reference for this stock movement.');
  if(command.type==='stock.issue'){assert(data.projects.some(x=>x.id===command.payload.projectId),'Select a project for this issue.');assert(stockOnHand(data.stockMovements,p.itemId,p.locationId)>=p.quantity,'Not enough stock at the selected location.');}
  data.stockMovements.unshift({...p,...entity,type:command.type==='stock.issue'?'Issue':'Opening',reference:`${command.type==='stock.issue'?'ISS':'OPEN'}-${entity.id.slice(0,8).toUpperCase()}`});break;
 }
 }
}
