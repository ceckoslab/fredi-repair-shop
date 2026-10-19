import { eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { bookings } from '../../../db/schema';
import { json, sameOrigin, readBody, allowRequest } from '../../../lib/server';
export async function POST(req:Request) {
  if (!sameOrigin(req)) return json({error:'origin'},403);
  let ticket;try {const data=await readBody(req);ticket=typeof data.ticket==='string'?data.ticket.trim().toUpperCase():'';} catch {return json({error:'validation'},400);}
  if (!/^TS-(?:[A-F0-9]{6}-){3}[A-F0-9]{6}$/.test(ticket)) return json({error:'not_found'},404);
  try {
    if (!await allowRequest(req,'track',60,60)) return json({error:'rate'},429);
    const result=await getDb().select({ticket:bookings.ticket,device:bookings.device,brand:bookings.brand,model:bookings.model,service:bookings.service,status:bookings.status,note:bookings.note,date:bookings.date,time:bookings.time,updatedAt:bookings.updatedAt}).from(bookings).where(eq(bookings.ticket,ticket)).get();
    return result ? json(result) : json({error:'not_found'},404);
  } catch {return json({error:'unavailable'},503);}
}
