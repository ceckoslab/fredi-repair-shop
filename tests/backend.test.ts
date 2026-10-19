import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID, scryptSync } from 'node:crypto';
import { BlobsServer } from '@netlify/blobs/server';
import { setEnvironmentContext } from '@netlify/blobs';
import { createBooking, findBooking, updateBooking, consumeRateLimit, RetryConflict } from '../lib/storage.ts';
import { createSession, verifySession, verifyPassword, sessionSeconds } from '../lib/auth.ts';

let directory: string;
let server: BlobsServer;
before(async () => {
  directory = await mkdtemp(join(tmpdir(), 'telsoft-test-'));
  server = new BlobsServer({directory, token:'local-test-token', logger:()=>{}});
  const {port} = await server.start();
  setEnvironmentContext({siteID:'test-site',token:'local-test-token',apiURL:`http://localhost:${port}`});
});
after(async () => { await server.stop(); await rm(directory,{recursive:true,force:true}); });

test('booking retries preserve a private ticket and cannot replace the original data', async () => {
  const input = {requestId:randomUUID(), name:'Test Customer', email:'test@example.invalid', phone:'', postcode:'80802', device:'phone', brand:'Apple', model:'Test iPhone', service:'battery', issue:'Test only', date:'2026-11-01', time:'morning', language:'en'};
  const first = await createBooking(input);
  assert.equal(first.created,true);
  assert.match(first.ticket,/^TS-(?:[A-F0-9]{6}-){3}[A-F0-9]{6}$/);
  const retry = await createBooking(input);
  assert.equal(retry.ticket,first.ticket);
  assert.equal(retry.created,false);
  await assert.rejects(()=>createBooking({...input,name:'Changed'}),RetryConflict);
  const saved = await findBooking(first.ticket);
  assert.equal(saved?.name,input.name);
  assert.equal(await updateBooking(first.ticket,'ready','Test complete',saved!.updatedAt),'saved');
  assert.equal(await updateBooking(first.ticket,'waiting','Stale update',saved!.updatedAt),'conflict');
  assert.equal((await findBooking(first.ticket))?.status,'ready');
});

test('persistent request limit rejects attempts above its window allowance',async()=>{
  const identity=randomUUID();
  for(let i=0;i<3;i++)assert.equal(await consumeRateLimit(identity,'test',3,60),true);
  assert.equal(await consumeRateLimit(identity,'test',3,60),false);
  assert.equal(await consumeRateLimit(randomUUID(),'test',3,60),true);
});

test('staff sessions reject forgery, expiry, password rotation and missing configuration',()=>{
  const salt='0123456789abcdef0123456789abcdef';
  process.env.ADMIN_PASSWORD_HASH=salt+':'+scryptSync('test-password',salt,64).toString('hex');
  process.env.ADMIN_SESSION_SECRET='a'.repeat(43);
  assert.equal(verifyPassword('test-password'),true);
  assert.equal(verifyPassword('wrong'),false);
  const now=Date.now();const session=createSession(now);
  assert.equal(verifySession(session,now),true);
  assert.equal(verifySession(session+'x',now),false);
  assert.equal(verifySession('made.up',now),false);
  assert.equal(verifySession(session,now+sessionSeconds*1000),false);
  process.env.ADMIN_PASSWORD_HASH+='x';
  assert.equal(verifySession(session,now),false);
  delete process.env.ADMIN_SESSION_SECRET;
  assert.equal(verifySession(session,now),false);
});
