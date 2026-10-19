import { z } from 'zod';
import { listBookings, updateBooking } from '../../../lib/storage';
import { json, isAdmin, sameOrigin, readBody, states } from '../../../lib/server';
export async function GET() {
  if(!await isAdmin())return json({error:'forbidden'},403);
  try {return json(await listBookings());}
  catch {return json({error:'unavailable'},503);}
}
export async function PATCH(req:Request) {
  if(!sameOrigin(req)||!await isAdmin())return json({error:'forbidden'},403);
  let data;try {data=z.object({ticket:z.string().max(40),status:z.enum(states),note:z.string().trim().max(1000),updatedAt:z.string().datetime()}).parse(await readBody(req));}catch{return json({error:'validation'},400);}
  try {
    const result=await updateBooking(data.ticket,data.status,data.note,data.updatedAt);
    return result==='saved'?json({ok:true}):json({error:result==='missing'?'not_found':'conflict'},result==='missing'?404:409);
  } catch {return json({error:'unavailable'},503);}
}
