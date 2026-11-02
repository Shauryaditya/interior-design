import { test, expect, type Page } from '@playwright/test';
import { seed } from '../src/data/seed';
import { applyMasterCommand } from '../src/data/masterCommands';
import { purchaseTotals, stockOnHand } from '../src/domain';

async function navigate(page:Page,name:string){
 if(await page.getByRole('button',{name:'Open navigation'}).isVisible())await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('nav').getByRole('button',{name,exact:true}).click();
}

test('master entries drive purchasing, partial receipts and project stock issues',async({page})=>{
 test.setTimeout(90_000);
 await page.goto('/');
 await navigate(page,'Master Data');
 await page.getByRole('button',{name:'New category',exact:true}).click();
 await page.getByLabel('Category name',{exact:true}).fill('Tiles & stone');
 await page.getByLabel('Description',{exact:true}).fill('Floor and wall finishes');
 await page.getByRole('button',{name:'Create category',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Tiles & stone',exact:true})).toBeVisible();
 await page.getByRole('tab',{name:/Tax categories/}).click();
 await page.getByRole('button',{name:'New tax category',exact:true}).click();
 await page.getByLabel('Tax category name',{exact:true}).fill('Demo tax 5%');
 await page.getByLabel('GST rate (%)',{exact:true}).fill('5');
 await page.getByRole('button',{name:'Create tax category',exact:true}).click();
 await navigate(page,'Vendors');
 await page.getByRole('button',{name:'New vendor',exact:true}).click();
 await page.getByLabel('Vendor name',{exact:true}).fill('Demo Tile Supplies');
 await page.getByLabel('Contact person',{exact:true}).fill('Ravi');
 await page.getByLabel('Tiles & stone',{exact:true}).check();
 await page.getByRole('button',{name:'Create vendor',exact:true}).click();
 await navigate(page,'Products & Items');
 await page.getByRole('button',{name:'New item',exact:true}).click();
 await page.getByLabel('Item name',{exact:true}).fill('Demo porcelain tile');
 await page.getByLabel('SKU',{exact:true}).fill('TILE-DEMO');
 await page.getByLabel('Category',{exact:true}).selectOption({label:'Tiles & stone'});
 await page.getByLabel('Unit',{exact:true}).selectOption('box');
 await page.getByLabel('Tax category',{exact:true}).selectOption({label:'Demo tax 5% · 5%'});
 await page.getByLabel('Purchase rate (INR)',{exact:true}).fill('100');
 await page.getByLabel('Selling rate (INR)',{exact:true}).fill('150');
 await page.getByLabel('Reorder level',{exact:true}).fill('5');
 await page.getByRole('button',{name:'Create item',exact:true}).click();
 await page.getByRole('button',{name:'Tiles & stone',exact:true}).click();
 await expect(page.locator('.item-master-card')).toHaveCount(1);
 await expect(page.locator('.item-master-card')).toContainText('Demo porcelain tile');
 await navigate(page,'Procurement');
 await page.getByRole('button',{name:'New purchase order',exact:true}).click();
 await page.getByLabel('Vendor',{exact:true}).selectOption({label:'Demo Tile Supplies'});
 await page.getByRole('button',{name:'Add item',exact:true}).click();
 await expect(page.getByLabel('Item 1',{exact:true})).toContainText('Demo porcelain tile');
 await page.getByLabel('Quantity 1',{exact:true}).fill('10');
 await expect(page.locator('.order-totals')).toContainText('₹1,050');
 await page.getByRole('button',{name:'Create purchase order',exact:true}).click();
 let order=page.locator('.purchase-card').filter({hasText:'Demo Tile Supplies'});
 await expect(order).toContainText('Awaiting approval');
 await expect(order.getByRole('button',{name:'Receive materials'})).toHaveCount(0);
 await order.getByRole('button',{name:'Approve',exact:true}).click();
 await order.getByRole('button',{name:'Receive materials'}).click();
 await page.getByLabel('Receive into',{exact:true}).selectOption('store');
 await page.getByLabel('Receive Demo porcelain tile',{exact:true}).fill('6');
 await page.getByRole('button',{name:'Record receipt',exact:true}).click();
 await expect(order).toContainText('Partially received');
 await navigate(page,'Inventory');
 const card=page.locator('.master-card').filter({hasText:'Demo porcelain tile'});
 await expect(card.locator('.stock-quantity')).toHaveText('6box');
 await page.getByRole('button',{name:'Issue to project',exact:true}).click();
 await page.getByLabel('Item',{exact:true}).selectOption({label:'TILE-DEMO · Demo porcelain tile'});
 await page.getByLabel('Quantity (box)',{exact:true}).fill('2');
 await page.getByLabel('Reason / reference',{exact:true}).fill('Floor installation');
 await page.getByRole('button',{name:'Record stock issue',exact:true}).click();
 await expect(card.locator('.stock-quantity')).toHaveText('4box');
 await expect(card).toContainText('Low stock');
 await navigate(page,'Procurement');
 order=page.locator('.purchase-card').filter({hasText:'Demo Tile Supplies'});
 await order.getByRole('button',{name:'Receive materials'}).click();
 await page.getByLabel('Receive into',{exact:true}).selectOption('store');
 await page.getByRole('button',{name:'Record receipt',exact:true}).click();
 await expect(order).toContainText('Received');
 await expect(order.getByRole('button',{name:'Receive materials'})).toHaveCount(0);
 await page.reload();
 await navigate(page,'Inventory');
 await expect(page.locator('.master-card').filter({hasText:'Demo porcelain tile'}).locator('.stock-quantity')).toHaveText('8box');
 await expect(page.locator('.movement-panel')).toContainText('Floor installation');
});

test('existing demo data is preserved and operations pages fit mobile and tablet',async({page})=>{
 const old=structuredClone(seed) as Partial<typeof seed>;
 delete old.categories;delete old.items;delete old.vendors;delete old.taxCategories;delete old.stockMovements;
 old.leads![0].name='Previously saved lead';
 await page.addInitScript(value=>{if(!localStorage.getItem('the-one-workspace-v1'))localStorage.setItem('the-one-workspace-v1',JSON.stringify(value));},old);
 await page.goto('/');await navigate(page,'Leads & CRM');
 await expect(page.getByRole('heading',{name:'Previously saved lead',exact:true})).toBeVisible();
 for(const name of ['Master Data','Products & Items','Vendors','Procurement','Inventory']){
  await navigate(page,name);
  await expect(page.locator('.operations-workspace')).toBeVisible();
  for(const width of [320,768]){
   await page.setViewportSize({width,height:900});
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  }
 }
 await page.setViewportSize({width:test.info().project.name==='mobile'?390:1440,height:1000});
 await page.screenshot({path:`test-results/inventory-${test.info().project.name}.png`,fullPage:true,animations:'disabled'});
 await page.getByRole('button',{name:'Opening stock',exact:true}).click();
 await page.getByLabel('Item',{exact:true}).selectOption('item-ply');
 await page.getByLabel('Quantity (sheet)',{exact:true}).fill('4');
 await page.getByLabel('Reason / reference',{exact:true}).fill('Opening stock verification');
 await page.getByRole('button',{name:'Record opening stock',exact:true}).click();
 await expect(page.locator('.master-card').filter({hasText:'BWP plywood · 18 mm'}).locator('.stock-quantity')).toHaveText('20sheet');
 await navigate(page,'Products & Items');
 await page.getByRole('button',{name:'Edit BWP plywood · 18 mm',exact:true}).click();
 await page.getByLabel('Selling rate (INR)',{exact:true}).fill('4300');
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page.locator('.master-card').filter({hasText:'BWP plywood · 18 mm'})).toContainText('₹4,300');
});

test('stock and purchase safeguards reject over-receipts and overselling',()=>{
 const data=structuredClone(seed);
 expect(stockOnHand(data.stockMovements,'item-ply','store')).toBe(16);
 expect(()=>applyMasterCommand(data,{type:'stock.issue',payload:{itemId:'item-ply',locationId:'store',quantity:17,projectId:'p1',date:'2026-11-02',note:'Too much'}})).toThrow('Not enough stock');
 expect(()=>applyMasterCommand(data,{type:'item.save',payload:{...data.items[0],sku:data.items[1].sku}})).toThrow('SKU');
 expect(()=>applyMasterCommand(data,{type:'purchase.create',payload:{vendorId:'vendor-greenply',projectId:'p1',due:'2026-11-05',lines:[{itemId:'item-hinge',quantity:1,costPaise:10000}]}})).toThrow('does not supply');
 applyMasterCommand(data,{type:'purchase.create',payload:{vendorId:'vendor-greenply',projectId:'p1',due:'2026-11-05',lines:[{itemId:'item-ply',quantity:2,costPaise:10000}]}});
 const po=data.purchases[0];po.status='Ordered';
 const receipt={id:po.id,locationId:'store',date:'2026-11-05',note:'Challan',lines:[{lineId:po.lines![0].id,quantity:3}]};
 expect(()=>applyMasterCommand(data,{type:'purchase.receive',payload:receipt})).toThrow('exceeds');
 expect(stockOnHand(data.stockMovements,'item-ply','store')).toBe(16);
 applyMasterCommand(data,{type:'purchase.receive',payload:{...receipt,lines:[{lineId:po.lines![0].id,quantity:2}]}});
 expect(po.status).toBe('Received');
 expect(stockOnHand(data.stockMovements,'item-ply','store')).toBe(18);
 expect(()=>applyMasterCommand(data,{type:'purchase.receive',payload:receipt})).toThrow('approved, open');
 applyMasterCommand(data,{type:'tax.save',payload:{...data.taxCategories[0],gstPercent:12}});
 expect(po.lines![0].gstPercent).toBe(18);
 expect(po.amount).toBe(23600);
 expect(purchaseTotals([{quantity:1.25,costPaise:999,gstPercent:18}])).toEqual({subtotal:1249,tax:225,total:1474});
});
