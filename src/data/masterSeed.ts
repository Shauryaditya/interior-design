import type { Workspace } from '../domain';
const tenantId='the-one-demo';
export const masterSeed: Pick<Workspace,'categories'|'taxCategories'|'vendors'|'items'|'stockMovements'> = {
 categories:[
  {id:'cat-wood',tenantId,name:'Plywood & laminates',description:'Boards, veneers, laminates and panel materials'},
  {id:'cat-hardware',tenantId,name:'Hardware & fittings',description:'Hinges, channels, handles and accessories'},
  {id:'cat-paint',tenantId,name:'Paints & finishes',description:'Paint, primer, polish and surface finishes'},
  {id:'cat-light',tenantId,name:'Lighting & electrical',description:'Lights, cables, switches and electrical supplies'}
 ],
 taxCategories:[
  {id:'tax-18',tenantId,name:'GST 18%',gstPercent:18,description:'Sample standard rate; classification to be verified'},
  {id:'tax-12',tenantId,name:'GST 12%',gstPercent:12,description:'Sample rate; select only after classification review'},
  {id:'tax-0',tenantId,name:'Zero-rated sample',gstPercent:0,description:'Demo category, not a determination of exemption'}
 ],
 vendors:[
  {id:'vendor-greenply',tenantId,name:'Greenply Industries',contact:'Aakash Mehta',phone:'',email:'',gstin:'',address:'Mumbai, Maharashtra',categoryIds:['cat-wood'],paymentTerms:'Net 30 days'},
  {id:'vendor-hafele',tenantId,name:'Häfele India',contact:'Sneha Rao',phone:'',email:'',gstin:'',address:'Mumbai, Maharashtra',categoryIds:['cat-hardware'],paymentTerms:'Net 15 days'},
  {id:'vendor-asian',tenantId,name:'Asian Paints',contact:'Kunal Shah',phone:'',email:'',gstin:'',address:'Thane, Maharashtra',categoryIds:['cat-paint'],paymentTerms:'On delivery'}
 ],
 items:[
  {id:'item-ply',tenantId,sku:'PLY-001',name:'BWP plywood · 18 mm',categoryId:'cat-wood',unit:'sheet',hsn:'',taxCategoryId:'tax-18',costPaise:320000,sellPaise:420000,reorderLevel:10},
  {id:'item-lam',tenantId,sku:'LAM-001',name:'Matte laminate · 1 mm',categoryId:'cat-wood',unit:'sheet',hsn:'',taxCategoryId:'tax-18',costPaise:125000,sellPaise:165000,reorderLevel:12},
  {id:'item-hinge',tenantId,sku:'HDW-001',name:'Soft-close cabinet hinge',categoryId:'cat-hardware',unit:'nos',hsn:'',taxCategoryId:'tax-18',costPaise:45000,sellPaise:65000,reorderLevel:20},
  {id:'item-paint',tenantId,sku:'PNT-001',name:'Interior emulsion · white',categoryId:'cat-paint',unit:'litre',hsn:'',taxCategoryId:'tax-18',costPaise:42000,sellPaise:56000,reorderLevel:25},
  {id:'item-led',tenantId,sku:'LGT-001',name:'Warm white LED downlight',categoryId:'cat-light',unit:'nos',hsn:'',taxCategoryId:'tax-18',costPaise:85000,sellPaise:120000,reorderLevel:10}
 ],
 stockMovements:[
  {id:'stock-1',tenantId,itemId:'item-ply',locationId:'store',type:'Opening',quantity:24,date:'2026-11-01',reference:'OPEN-001',note:'Sample opening balance'},
  {id:'stock-2',tenantId,itemId:'item-lam',locationId:'store',type:'Opening',quantity:6,date:'2026-11-01',reference:'OPEN-002',note:'Sample opening balance'},
  {id:'stock-3',tenantId,itemId:'item-hinge',locationId:'store',type:'Opening',quantity:60,date:'2026-11-01',reference:'OPEN-003',note:'Sample opening balance'},
  {id:'stock-4',tenantId,itemId:'item-paint',locationId:'p1',type:'Opening',quantity:40,date:'2026-11-01',reference:'OPEN-004',note:'Sample site opening balance'},
  {id:'stock-5',tenantId,itemId:'item-ply',locationId:'store',type:'Issue',quantity:8,date:'2026-11-02',reference:'ISS-001',projectId:'p1',note:'Issued for carpentry consumption'}
 ]
};
