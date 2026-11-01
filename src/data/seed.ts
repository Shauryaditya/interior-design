import type { Workspace } from '../domain';
const tenantId='the-one-demo';
export const seed: Workspace = {
 leads:[
 {id:'l1',tenantId,name:'A home for new beginnings',client:'Rohan & Ananya Shah',location:'3 BHK · Powai',value:280000000,stage:'Negotiation',source:'Referral',owner:'Priya Mehta',followUp:'2026-11-03'},
 {id:'l2',tenantId,name:'The sea-facing residence',client:'Vikram Kapoor',location:'4 BHK · Worli',value:450000000,stage:'Site Visit',source:'Instagram',owner:'Arjun Desai',followUp:'2026-11-02'},
 {id:'l3',tenantId,name:'A workspace that inspires',client:'Studio North',location:'Office · Andheri',value:180000000,stage:'Quotation Sent',source:'Website',owner:'Priya Mehta',followUp:'2026-11-04'},
 {id:'l4',tenantId,name:'Everyday, elevated',client:'Neha Patil',location:'2 BHK · Thane',value:160000000,stage:'New',source:'Walk-in',owner:'Arjun Desai',followUp:'2026-11-05'}],
 projects:[
 {id:'p1',tenantId,name:'The Oberoi Residence',client:'Amit & Riya Oberoi',location:'Worli, Mumbai',owner:'Priya Mehta',status:'Execution',progress:68,budget:320000000,spent:212000000,due:'2026-12-15'},
 {id:'p2',tenantId,name:'Casa Green',client:'Siddharth Jain',location:'Powai, Mumbai',owner:'Arjun Desai',status:'Design',progress:32,budget:245000000,spent:62000000,due:'2027-01-20'},
 {id:'p3',tenantId,name:'The Thoughtful Office',client:'Northstar Ventures',location:'BKC, Mumbai',owner:'Priya Mehta',status:'Execution',progress:81,budget:480000000,spent:450000000,due:'2026-11-18'},
 {id:'p4',tenantId,name:'A Little Sanctuary',client:'Meera Nair',location:'Bandra, Mumbai',owner:'Arjun Desai',status:'Handover',progress:96,budget:185000000,spent:154000000,due:'2026-11-08'}],
 quotations:[{id:'q1',tenantId,name:'Shah Residence · Full interiors',client:'Rohan & Ananya Shah',version:1,status:'Draft',lines:[{id:'ql1',room:'Living room',description:'TV console · veneer finish',quantity:12,unit:'sq ft',costPaise:180000,pricePaise:240000,gstPercent:18},{id:'ql2',room:'Kitchen',description:'Modular kitchen · BWP plywood',quantity:85,unit:'sq ft',costPaise:160000,pricePaise:225000,gstPercent:18},{id:'ql3',room:'Master bedroom',description:'Full-height wardrobe',quantity:72,unit:'sq ft',costPaise:140000,pricePaise:195000,gstPercent:18}]}],
 tasks:[{id:'t1',tenantId,title:'Approve kitchen laminate samples',projectId:'p1',assignee:'Priya Mehta',due:'2026-10-31',priority:'High',status:'To do'},{id:'t2',tenantId,title:'Upload electrical site measurements',projectId:'p2',assignee:'Arjun Desai',due:'2026-11-02',priority:'Medium',status:'In progress'},{id:'t3',tenantId,title:'Complete ceiling quality inspection',projectId:'p3',assignee:'Rahul Sharma',due:'2026-11-03',priority:'High',status:'To do'},{id:'t4',tenantId,title:'Prepare handover checklist',projectId:'p4',assignee:'Priya Mehta',due:'2026-11-05',priority:'Low',status:'Done'}],
 purchases:[{id:'po1',tenantId,reference:'PO-2026-0042',vendor:'Greenply Industries',projectId:'p1',amount:24500000,status:'Awaiting approval',due:'2026-11-04'},{id:'po2',tenantId,reference:'PO-2026-0041',vendor:'Häfele India',projectId:'p3',amount:12800000,status:'Ordered',due:'2026-11-06'},{id:'po3',tenantId,reference:'PO-2026-0039',vendor:'Asian Paints',projectId:'p4',amount:6200000,status:'Received',due:'2026-10-28'}]
};
