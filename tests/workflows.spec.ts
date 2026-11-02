import { test, expect } from '@playwright/test';
async function navigate(page:any,label:string){if(await page.getByRole('button',{name:'Open navigation'}).isVisible())await page.getByRole('button',{name:'Open navigation'}).click();await page.locator('nav').getByRole('button',{name:label,exact:true}).click();}
test('enquiry persists and can move through the pipeline',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'New enquiry'}).click();await page.getByLabel('Enquiry title').fill('Test Residence');await page.getByLabel('Client name').fill('Test Client');await page.getByLabel('Location / project type').fill('Mumbai');await page.getByLabel('Estimated value').fill('2500000');await page.getByLabel('Next follow-up').fill('2026-11-10');await page.getByRole('button',{name:'Create enquiry'}).click();await navigate(page,'Leads & CRM');const card=page.locator('article').filter({hasText:'Test Residence'});await expect(card).toBeVisible();await card.locator('select').selectOption('Site Visit');await page.reload();await navigate(page,'Leads & CRM');await expect(page.locator('article').filter({hasText:'Test Residence'}).locator('select')).toHaveValue('Site Visit');
});
test('CRM stages fit phone, tablet and desktop widths',async({page})=>{
 await page.goto('/');
 await navigate(page,'Leads & CRM');
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'reduce'});
  const stages=page.locator('.lead-board .kanban-column');
  await expect(stages).toHaveCount(7);
  for(const stage of await stages.all()){
   const bounds=await stage.boundingBox();
   expect(bounds).not.toBeNull();
   expect(bounds!.x).toBeGreaterThanOrEqual(0);
   expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(width+1);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
 }
 await page.setViewportSize({width:test.info().project.name==='mobile'?390:1440,height:900});
 await page.screenshot({path:`test-results/crm-${test.info().project.name}.png`,fullPage:true,animations:'disabled'});
});
test('quotation totals, revision and one-time project conversion',async({page})=>{
 await page.goto('/');await navigate(page,'Quotations');await expect(page.locator('.grand-total')).toContainText('₹4,25,331');await page.getByRole('spinbutton',{name:'quantity for TV console · veneer finish',exact:true}).fill('20');await expect(page.locator('.grand-total')).toContainText('₹4,47,987');await expect(page.getByRole('button',{name:'Approve & create project'})).toBeDisabled();await page.getByRole('button',{name:'Save revision'}).click();await expect(page.getByText(/Version 2/)).toBeVisible();await page.getByRole('button',{name:'Approve & create project'}).click();await expect(page.getByText('Approved quotation locked.',{exact:false})).toBeVisible();await navigate(page,'Projects');await expect(page.getByRole('heading',{name:'Shah Residence',exact:true})).toHaveCount(1);await page.getByRole('heading',{name:'Shah Residence',exact:true}).click();await expect(page.getByRole('dialog')).toContainText('₹2,72,800');
});
test('task and approval changes persist; no viewport overflow',async({page})=>{
 await page.goto('/');await navigate(page,'Tasks');await page.getByLabel('Status for Approve kitchen laminate samples').selectOption('Done');await navigate(page,'Procurement');await page.getByRole('button',{name:'Approve',exact:true}).click();await expect(page.getByRole('button',{name:'Approve',exact:true})).toHaveCount(0);await page.reload();await navigate(page,'Tasks');await expect(page.getByLabel('Status for Approve kitchen laminate samples')).toHaveValue('Done');await navigate(page,'Overview');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.screenshot({path:`test-results/overview-${test.info().project.name}.png`,fullPage:true,animations:'disabled'});
});
