import { test, expect, type Page } from '@playwright/test';
import { seed } from '../src/data/seed';
import { applyFinanceCommand } from '../src/data/financeCommands';
import { businessDate, daysOverdue, invoiceTotals, outstanding, projectFinancials } from '../src/finance';

async function navigate(page:Page,name:string){
 if(await page.getByRole('button',{name:'Open navigation'}).isVisible())await page.getByRole('button',{name:'Open navigation'}).click();
 await page.locator('nav').getByRole('button',{name,exact:true}).click();
}

test('new PRD tabs support cost approval, billing and client collections',async({page})=>{
 test.setTimeout(90_000);
 await page.goto('/');await navigate(page,'Expenses & Labour');
 await page.getByRole('button',{name:'New expense',exact:true}).click();
 await page.getByLabel('Description',{exact:true}).fill('Demo site courier');
 await page.getByLabel('Claimant',{exact:true}).fill('Demo supervisor');
 await page.getByLabel('Amount (INR)',{exact:true}).fill('100');
 await page.getByRole('button',{name:'Submit expense',exact:true}).click();
 const expense=page.locator('.finance-record').filter({hasText:'Demo site courier'});
 await expect(expense).toContainText('Pending approval');
 await expense.getByRole('button',{name:'Approve cost',exact:true}).click();
 await expect(expense).toContainText('Approved');
 await expense.getByRole('button',{name:'Mark paid',exact:true}).click();
 await expect(expense).toContainText('Paid');
 await page.getByRole('tab',{name:/Labour & contractor bills/}).click();
 await page.getByRole('button',{name:'New labour entry',exact:true}).click();
 await page.getByLabel('Payee / contractor',{exact:true}).fill('Demo installation crew');
 await page.getByLabel('Work description',{exact:true}).fill('Demo measured work');
 await page.getByLabel('Billing basis',{exact:true}).selectOption('Measurement-based');
 await page.getByLabel('Quantity',{exact:true}).fill('2.5');
 await page.getByLabel('Rate per unit (INR)',{exact:true}).fill('100');
 await expect(page.locator('.inline-balance')).toContainText('₹250.00');
 await page.getByRole('button',{name:'Submit labour entry',exact:true}).click();
 await page.locator('.finance-record').filter({hasText:'Demo measured work'}).getByRole('button',{name:'Approve cost',exact:true}).click();
 await navigate(page,'Project P&L & Reports');
 await expect(page.getByRole('row').filter({hasText:'The Oberoi Residence'})).toContainText('₹21,20,350');
 await navigate(page,'Invoicing');
 await page.getByRole('button',{name:'New invoice draft',exact:true}).click();
 await page.getByLabel('Billing description 1',{exact:true}).fill('Demo execution milestone');
 await page.getByLabel('Billing price 1',{exact:true}).fill('1000');
 await expect(page.locator('.order-totals')).toContainText('₹1,180.00');
 await page.getByRole('button',{name:'Save invoice draft',exact:true}).click();
 const invoice=page.locator('.invoice-record').first();
 await expect(invoice).toContainText('Draft');
 const reference=await invoice.locator('.invoice-tags small').innerText();
 await invoice.getByRole('button',{name:'Finalize demo',exact:true}).click();
 await expect(invoice).toContainText('Issued');
 await navigate(page,'Payments & Receivables');
 const balance=page.locator('.finance-record').filter({hasText:reference});
 await balance.getByRole('button',{name:'Record payment',exact:true}).click();
 await page.getByLabel('Receipt amount (INR)',{exact:true}).fill('500');
 await page.getByLabel('Payment reference',{exact:true}).fill('DEMO-TEST-RECEIPT');
 await page.getByRole('button',{name:'Save client payment',exact:true}).click();
 await expect(balance.locator('.finance-value')).toContainText('₹680');
 await page.getByRole('tab',{name:'Payment history',exact:true}).click();
 await expect(page.locator('.finance-record').filter({hasText:'DEMO-TEST-RECEIPT'})).toContainText('₹500');
 await page.reload();await navigate(page,'Invoicing');
 await page.locator('.invoice-record').filter({hasText:reference}).getByRole('button',{name:'View details',exact:true}).click();
 await expect(page.getByRole('dialog')).toContainText('Estimated CGST');
 await expect(page.getByRole('dialog')).toContainText('₹680.00');
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 await page.getByRole('button',{name:'New invoice draft',exact:true}).click();
 await page.getByLabel('Billing mode',{exact:true}).selectOption('Non-GST');
 await page.getByLabel('Billing description 1',{exact:true}).fill('Demo non-GST sample');
 await page.getByLabel('Billing price 1',{exact:true}).fill('500');
 await expect(page.locator('.order-totals')).not.toContainText('Estimated GST');
 await page.getByRole('button',{name:'Save invoice draft',exact:true}).click();
 await expect(page.locator('.invoice-record').first()).toContainText('NGST-DEMO-');
 await expect(page.locator('.invoice-record').first()).toContainText('₹500');
});

test('financial tabs fit small screens and report export works',async({page})=>{
 const old=structuredClone(seed) as Partial<typeof seed>;
 delete old.expenses;delete old.labourEntries;delete old.invoices;delete old.payments;
 await page.addInitScript(value=>{localStorage.setItem('the-one-workspace-v1',JSON.stringify(value));},old);
 await page.goto('/');
 for(const name of ['Expenses & Labour','Invoicing','Payments & Receivables','Project P&L & Reports']){
  await navigate(page,name);await expect(page.locator('.finance-workspace')).toBeVisible();
  for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();}
 }
 await page.setViewportSize({width:test.info().project.name==='mobile'?390:1440,height:1000});
 await page.screenshot({path:`test-results/financial-reports-${test.info().project.name}.png`,fullPage:true,animations:'disabled'});
 const download=page.waitForEvent('download');await page.getByRole('button',{name:'Export report',exact:true}).click();expect((await download).suggestedFilename()).toBe('the-one-project-financials-demo.csv');
 await navigate(page,'Invoicing');await page.screenshot({path:`test-results/invoicing-${test.info().project.name}.png`,fullPage:true,animations:'disabled'});
});

test('financial safeguards prevent duplicate approvals, excess collections and paid invoice cancellation',()=>{
 const data=structuredClone(seed);const before=data.projects[0].spent;
 applyFinanceCommand(data,{type:'expense.create',payload:{projectId:'p1',description:'Courier',claimant:'Team',category:'Transport',amount:10000,date:businessDate(),reference:'COUR-1'}});
 const expense=data.expenses[0];
 expect(data.projects[0].spent).toBe(before);
 applyFinanceCommand(data,{type:'cost.approve',payload:{id:expense.id,kind:'expense'}});
 expect(data.projects[0].spent).toBe(before+10000);
 expect(()=>applyFinanceCommand(data,{type:'cost.approve',payload:{id:expense.id,kind:'expense'}})).toThrow('pending');
 applyFinanceCommand(data,{type:'cost.pay',payload:{id:expense.id,kind:'expense'}});
 expect(data.projects[0].spent).toBe(before+10000);
 applyFinanceCommand(data,{type:'invoice.create',payload:{projectId:'p1',mode:'GST',taxTreatment:'Split GST',date:businessDate(),due:businessDate(),note:'',lines:[{id:'line',description:'Demo',quantity:1,unit:'nos',pricePaise:100000,gstPercent:18}]}});
 const invoice=data.invoices[0];expect(outstanding(data,invoice)).toBe(0);
 const payment={invoiceId:invoice.id,amount:50000,date:businessDate(),mode:'Bank transfer' as const,reference:'UNIQUE-RECEIPT',note:''};
 expect(()=>applyFinanceCommand(data,{type:'payment.create',payload:payment})).toThrow('issued');
 applyFinanceCommand(data,{type:'invoice.issue',payload:{id:invoice.id}});
 applyFinanceCommand(data,{type:'payment.create',payload:payment});
 expect(outstanding(data,invoice)).toBe(68000);
 expect(()=>applyFinanceCommand(data,{type:'payment.create',payload:{...payment,amount:68001,reference:'OVERPAY'}})).toThrow('exceeds');
 expect(()=>applyFinanceCommand(data,{type:'payment.create',payload:payment})).toThrow('already');
 expect(()=>applyFinanceCommand(data,{type:'invoice.cancel',payload:{id:invoice.id}})).toThrow('receipts');
 const report=projectFinancials(data,'p1');expect(report.actual).toBe(before+10000);expect(report.revenue).toBe(265100000);expect(report.contribution).toBe(report.revenue-report.actual);
 expect(invoiceTotals({...invoice,mode:'Non-GST',taxTreatment:'No GST'}).total).toBe(100000);
 expect(daysOverdue('2026-10-01','2026-11-02')).toBe(32);
});
