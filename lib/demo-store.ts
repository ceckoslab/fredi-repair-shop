// Feedback prototype: all records stay in this browser. There is no booking API.
export type Repair = {
  ticket:string; requestId:string; name:string; email:string; phone:string; postcode:string;
  device:string; brand:string; model:string; service:string; issue:string; date:string;
  time:string; language:string; status:string; note:string; createdAt:string; updatedAt:string;
};
export const demoTicket='TS-DEMO01-DEMO02-DEMO03-DEMO04';
const storageKey='telsoft-feedback-demo-v1';
function examples():Repair[] {
  const now=new Date().toISOString();
  return [{ticket:demoTicket,requestId:'example',name:'Demo-Kunde / Example customer',email:'demo@example.invalid',phone:'',postcode:'80802',device:'phone',brand:'Apple',model:'iPhone 14',service:'screen',issue:'Beispiel: Display gesprungen. / Example: cracked screen.',date:now.slice(0,10),time:'flexible',language:'de',status:'waiting',note:'Demo: Ersatzteil bestellt. / Demo: replacement part ordered.',createdAt:now,updatedAt:now}];
}
export function getRepairs():Repair[] {
  const raw=localStorage.getItem(storageKey);
  if (!raw) {const rows=examples();localStorage.setItem(storageKey,JSON.stringify(rows));return rows;}
  const rows=JSON.parse(raw);
  if (!Array.isArray(rows)) throw new Error('storage');
  return rows;
}
export function createDemoBooking(input:Omit<Repair,'ticket'|'status'|'note'|'createdAt'|'updatedAt'>) {
  const rows=getRepairs();
  const existing=rows.find(row=>row.requestId===input.requestId);
  if(existing)return existing;
  const token=Array.from(crypto.getRandomValues(new Uint8Array(12))).map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
  const now=new Date().toISOString();
  const row={...input,ticket:'TS-'+token.match(/.{6}/g)!.join('-'),status:'requested',note:'',createdAt:now,updatedAt:now};
  localStorage.setItem(storageKey,JSON.stringify([row,...rows]));
  return row;
}
export function findDemoRepair(ticket:string) {
  return getRepairs().find(row=>row.ticket===ticket.trim().toUpperCase()) || null;
}
export function updateDemoRepair(ticket:string,status:string,note:string) {
  const rows=getRepairs();
  const row=rows.find(row=>row.ticket===ticket);
  if(!row)throw new Error('not_found');
  row.status=status;row.note=note;row.updatedAt=new Date().toISOString();
  localStorage.setItem(storageKey,JSON.stringify(rows));
}
