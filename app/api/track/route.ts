import { findBooking } from '../../../lib/storage';
import { json, sameOrigin, readBody, allowRequest } from '../../../lib/server';
export async function POST(req:Request) {
  if (!sameOrigin(req)) return json({error:'origin'},403);
  let ticket;try {const data=await readBody(req);ticket=typeof data.ticket==='string'?data.ticket.trim().toUpperCase():'';} catch {return json({error:'validation'},400);}
  if (!/^TS-(?:[A-F0-9]{6}-){3}[A-F0-9]{6}$/.test(ticket)) return json({error:'not_found'},404);
  try {
    if (!await allowRequest(req,'track',60,60)) return json({error:'rate'},429);
    const result=await findBooking(ticket);
    if (!result) return json({error:'not_found'},404);
    const {device,brand,model,service,status,note,date,time,updatedAt}=result;
    return json({ticket,device,brand,model,service,status,note,date,time,updatedAt});
  } catch {return json({error:'unavailable'},503);}
}
