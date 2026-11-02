import type { Workspace, Lead, Task, QuoteLine } from '../domain';
import { quoteTotals } from '../domain';
import { seed } from './seed';
import { masterSeed } from './masterSeed';
import { applyMasterCommand, type MasterCommands } from './masterCommands';
import { financeSeed } from './financeSeed';
import { applyFinanceCommand, isFinanceCommand, type FinanceCommands } from './financeCommands';
export interface Commands extends MasterCommands, FinanceCommands { 'lead.create': Omit<Lead,'id'|'tenantId'>; 'lead.stage': {id:string;stage:Lead['stage']}; 'task.create': Omit<Task,'id'|'tenantId'>; 'task.status': {id:string;status:Task['status']}; 'quote.save': {id:string;lines:QuoteLine[]}; 'quote.convert': {id:string}; 'purchase.approve': {id:string} }
export interface Repository { load():Promise<Workspace>; command<K extends keyof Commands>(type:K,payload:Commands[K]):Promise<Workspace> }
const key='the-one-workspace-v1';
class DemoRepository implements Repository {
 async load(){const raw=localStorage.getItem(key); if(!raw)return structuredClone(seed); try {const data=JSON.parse(raw); if(!['leads','projects','tasks','quotations','purchases'].every(k=>Array.isArray(data[k])))throw Error();const defaults={...masterSeed,...financeSeed};for(const field of Object.keys(defaults) as (keyof typeof defaults)[]){if(data[field]===undefined)data[field]=structuredClone(defaults[field]);else if(!Array.isArray(data[field]))throw Error();}return data as Workspace;} catch {throw new Error('Saved demo data is unreadable. Use Reset demo in Settings to restore it.');}}
 async command<K extends keyof Commands>(type:K,payload:Commands[K]) {const data=await this.load();const p=payload as any;const entity={id:crypto.randomUUID(),tenantId:'the-one-demo'};
 switch(type){
 case 'lead.create':data.leads.unshift({...p,...entity});break;
 case 'lead.stage':{const lead=data.leads.find(x=>x.id===p.id);if(!lead)throw Error('Lead not found');lead.stage=p.stage;break;}
 case 'task.create':data.tasks.unshift({...p,...entity});break;
 case 'task.status':{const task=data.tasks.find(x=>x.id===p.id);if(!task)throw Error('Task not found');task.status=p.status;break;}
 case 'quote.save':{const q=data.quotations.find(x=>x.id===p.id);if(!q||q.status==='Approved')throw Error('Approved quotations are locked');q.lines=p.lines;q.version++;break;}
 case 'quote.convert':{const q=data.quotations.find(x=>x.id===p.id);if(!q)throw Error('Quotation not found');if(data.projects.some(x=>x.quotationId===q.id))throw Error('This quotation already has a project');q.status='Approved';data.projects.unshift({...entity,name:q.name.split(' · ')[0],client:q.client,location:'Site address pending',owner:'Priya Mehta',status:'Design',progress:0,budget:quoteTotals(q.lines).cost,spent:0,due:'',quotationId:q.id});break;}
 case 'purchase.approve':{const po=data.purchases.find(x=>x.id===p.id);if(!po||po.status!=='Awaiting approval')throw Error('Purchase order cannot be approved');po.status='Ordered';break;}
 default:if(isFinanceCommand(type))applyFinanceCommand(data,{type,payload} as Parameters<typeof applyFinanceCommand>[1]);else applyMasterCommand(data,{type,payload} as Parameters<typeof applyMasterCommand>[1]);}
 localStorage.setItem(key,JSON.stringify(data));return data;
 }
}
class HttpRepository implements Repository {
 private async request(path:string,body?:unknown):Promise<Workspace>{const response=await fetch(`${import.meta.env.VITE_API_BASE_URL||'/api/v1'}${path}`,{method:body?'POST':'GET',credentials:'include',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!response.ok)throw Error(`Request failed (${response.status}). Please retry.`);return response.json();}
 load(){return this.request('/workspace');}
 command<K extends keyof Commands>(type:K,payload:Commands[K]){return this.request('/commands',{type,payload});}
}
export const isDemo=import.meta.env.VITE_DATA_SOURCE!=='http';
export const repository:Repository=isDemo?new DemoRepository():new HttpRepository();
export const resetDemo=()=>{localStorage.removeItem(key);location.reload();};
