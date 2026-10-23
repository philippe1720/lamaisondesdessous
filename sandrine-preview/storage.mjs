import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';

const file = path.resolve(process.env.DATA_FILE || '.data/sandrine.json');
let pool;
let writeChain = Promise.resolve();
export function usingPostgres(){ return Boolean(process.env.DATABASE_URL); }

async function db() {
  if(!pool){
    const { Pool } = await import('pg');
    pool = new Pool({connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 10000});
    await pool.query('CREATE TABLE IF NOT EXISTS sandrine_app_state (id INTEGER PRIMARY KEY, document JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())');
  }
  return pool;
}
export async function loadStore(fallback) {
  if(usingPostgres()){
    const p=await db();
    const {rows}=await p.query('SELECT document FROM sandrine_app_state WHERE id=1');
    return rows[0]?.document || fallback;
  }
  try{return JSON.parse(await readFile(file,'utf8'));}catch(err){if(err.code==='ENOENT')return fallback;throw err;}
}
export function saveStore(snapshot){
  const frozen=structuredClone(snapshot);
  writeChain=writeChain.catch(()=>{}).then(async()=>{
    if(usingPostgres()){
      const p=await db();
      await p.query(`INSERT INTO sandrine_app_state (id,document,updated_at) VALUES (1,$1::jsonb,NOW())
      ON CONFLICT (id) DO UPDATE SET document=EXCLUDED.document,updated_at=NOW()`,[JSON.stringify(frozen)]);
    }else{
      await mkdir(path.dirname(file),{recursive:true});
      const tmp=file+'.tmp';
      await writeFile(tmp,JSON.stringify(frozen,null,2),'utf8');
      await rename(tmp,file);
    }
  });
  return writeChain;
}
export async function closeStore(){ if(pool)await pool.end(); }
