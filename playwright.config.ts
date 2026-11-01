import { defineConfig } from '@playwright/test';
export default defineConfig({testDir:'./tests',use:{baseURL:'http://127.0.0.1:5173',headless:true,channel:'msedge'},webServer:{command:'npm.cmd run dev',url:'http://127.0.0.1:5173',reuseExistingServer:!process.env.CI},projects:[{name:'desktop',use:{viewport:{width:1440,height:1000}}},{name:'mobile',use:{viewport:{width:390,height:844}}}]});
