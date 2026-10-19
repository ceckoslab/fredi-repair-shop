import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDemoBooking,findDemoRepair,getRepairs,updateDemoRepair} from '../lib/demo-store.ts';
test('a visitor can book, track, and update a demo without a server',()=>{
  const data=new Map<string,string>();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(k:string)=>data.get(k)||null,setItem:(k:string,v:string)=>data.set(k,v)}});
  const input={requestId:'test-request',name:'Demo',email:'demo@example.invalid',phone:'',postcode:'80802',device:'phone',brand:'Apple',model:'iPhone test',service:'battery',issue:'Demo only',date:'2026-11-01',time:'flexible',language:'en'};
  assert.equal(getRepairs().length,1);
  const row=createDemoBooking(input);
  assert.equal(createDemoBooking(input).ticket,row.ticket);
  assert.equal(getRepairs().length,2);
  assert.equal(findDemoRepair(row.ticket)?.status,'requested');
  updateDemoRepair(row.ticket,'ready','Demo complete');
  assert.equal(findDemoRepair(row.ticket.toLowerCase())?.status,'ready');
  assert.equal(getRepairs()[0].note,'Demo complete');
  data.clear();
  assert.equal(findDemoRepair(row.ticket),null,'another browser has separate demo records');
});
