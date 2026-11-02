import type { Workspace } from '../domain';
const tenantId='the-one-demo';
export const financeSeed:Pick<Workspace,'expenses'|'labourEntries'|'invoices'|'payments'>={
 expenses:[
  {id:'exp1',tenantId,projectId:'p1',description:'Material transport to site',category:'Transport',claimant:'Rahul Sharma',amount:850000,date:'2026-10-28',reference:'TR-028',status:'Paid'},
  {id:'exp2',tenantId,projectId:'p3',description:'Site consumables and safety supplies',category:'Site expenses',claimant:'Arjun Desai',amount:1260000,date:'2026-11-01',reference:'SITE-014',status:'Pending approval'},
  {id:'exp3',tenantId,projectId:'p4',description:'Final site cleaning',category:'Contractor',claimant:'Priya Mehta',amount:600000,date:'2026-10-30',reference:'CLN-010',status:'Approved'}
 ],
 labourEntries:[
  {id:'lab1',tenantId,projectId:'p1',payee:'Carpentry team',work:'Kitchen cabinet installation',basis:'Day-based',unit:'day',quantity:12,ratePaise:350000,amount:4200000,date:'2026-10-29',status:'Approved'},
  {id:'lab2',tenantId,projectId:'p3',payee:'Ceiling contractor',work:'False ceiling finishing',basis:'Measurement-based',unit:'sq ft',quantity:650,ratePaise:8500,amount:5525000,date:'2026-11-01',status:'Pending approval'}
 ],
 invoices:[
  {id:'inv1',tenantId,reference:'GST-DEMO-001',projectId:'p1',client:'Amit & Riya Oberoi',mode:'GST',taxTreatment:'Split GST',date:'2026-10-10',due:'2026-10-25',status:'Issued',lines:[{id:'il1',description:'Interior execution milestone',quantity:1,unit:'milestone',pricePaise:265000000,gstPercent:18}],note:'Sample billing record for demo review'},
  {id:'inv2',tenantId,reference:'GST-DEMO-002',projectId:'p2',client:'Siddharth Jain',mode:'GST',taxTreatment:'Split GST',date:'2026-10-26',due:'2026-11-10',status:'Issued',lines:[{id:'il2',description:'Design and initial execution milestone',quantity:1,unit:'milestone',pricePaise:85000000,gstPercent:18}],note:''},
  {id:'inv3',tenantId,reference:'GST-DEMO-003',projectId:'p3',client:'Northstar Ventures',mode:'GST',taxTreatment:'IGST',date:'2026-10-20',due:'2026-11-05',status:'Issued',lines:[{id:'il3',description:'Office interiors running bill',quantity:1,unit:'milestone',pricePaise:420000000,gstPercent:18}],note:'Sample IGST treatment for interface demonstration'},
  {id:'inv4',tenantId,reference:'NGST-DEMO-001',projectId:'p4',client:'Meera Nair',mode:'Non-GST',taxTreatment:'No GST',date:'2026-10-15',due:'2026-10-30',status:'Issued',lines:[{id:'il4',description:'Residential interiors final milestone',quantity:1,unit:'milestone',pricePaise:185000000,gstPercent:0}],note:'Sample non-GST record; treatment requires accountant approval'},
  {id:'inv5',tenantId,reference:'GST-DEMO-004',projectId:'p1',client:'Amit & Riya Oberoi',mode:'GST',taxTreatment:'Split GST',date:'2026-11-02',due:'2026-11-16',status:'Draft',lines:[{id:'il5',description:'Additional furniture package',quantity:1,unit:'package',pricePaise:12500000,gstPercent:18}],note:'Draft awaiting review'}
 ],
 payments:[
  {id:'pay1',tenantId,invoiceId:'inv1',projectId:'p1',amount:180000000,date:'2026-10-15',mode:'Bank transfer',reference:'DEMO-BANK-001',note:'Milestone collection'},
  {id:'pay2',tenantId,invoiceId:'inv2',projectId:'p2',amount:50000000,date:'2026-10-28',mode:'UPI',reference:'DEMO-UPI-002',note:''},
  {id:'pay3',tenantId,invoiceId:'inv3',projectId:'p3',amount:300000000,date:'2026-10-25',mode:'Bank transfer',reference:'DEMO-BANK-003',note:''},
  {id:'pay4',tenantId,invoiceId:'inv4',projectId:'p4',amount:185000000,date:'2026-10-29',mode:'Bank transfer',reference:'DEMO-BANK-004',note:'Final settlement'}
 ]
};
