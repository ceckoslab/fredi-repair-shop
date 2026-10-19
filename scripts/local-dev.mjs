import { BlobsServer } from '@netlify/blobs/server';
import { setEnvironmentContext } from '@netlify/blobs';
import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';

try {
  for (const line of (await readFile('.local/netlify.env','utf8')).trim().split('\n')) {
    const i=line.indexOf('='); process.env[line.slice(0,i)]=line.slice(i+1);
  }
} catch { /* Public preview still works without staff credentials. */ }
const server=new BlobsServer({directory:'.local/blobs',token:'local-development-only'});
const {port}=await server.start();
setEnvironmentContext({siteID:'telsoft-local',token:'local-development-only',apiURL:`http://localhost:${port}`});
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,CONTEXT:'local',NETLIFY:''}});
child.on('exit',async code=>{await server.stop();process.exit(code||0);});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
