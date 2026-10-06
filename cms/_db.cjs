require('dotenv').config({path:'.env'});
const {Client}=require('pg');
(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,ssl:process.env.DATABASE_SSL==='true'?{rejectUnauthorized:false}:undefined});await c.connect();
const q=async s=>(await c.query(s)).rows;
console.log((await q("select key,value from strapi_core_store_settings where key like 'plugin_wolverine%' or key like '%bootstrap%'")).map(r=>r.key+'='+String(r.value).slice(0,80)));
console.log('pricing_tiers',(await q("select count(*) from pricing_tiers"))[0],'programs',(await q("select count(*) from programs"))[0]);
console.log('passes',(await q("select count(*) from passes"))[0].count);
await c.end()})().catch(e=>console.log('ERR',e.message));
