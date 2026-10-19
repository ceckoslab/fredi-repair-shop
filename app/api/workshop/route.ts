import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';
import { getDb } from '../../../db';
import { bookings } from '../../../db/schema';
import { json, isAdmin, sameOrigin, readBody, states } from '../../../lib/server';
export async function GET() {
  if(!await isAdmin())return json({error:'forbidden'},403);
  try {return json(await getDb().select().from(bookings).orderBy(desc(bookings.createdAt)).limit(200));}
  catch {return json({error:'unavailable'},503);}
}
export async function PATCH(req:Request) {
  if(!sameOrigin(req)||!await isAdmin())return json({error:'forbidden'},403);
  let data;try {data=z.object({ticket:z.string().max(40),status:z.enum(states),note:z.string().trim().max(1000)}).parse(await readBody(req));}catch{return json({error:'validation'},400);}
  try {
    const result=await getDb().update(bookings).set({status:data.status,note:data.note,updatedAt:new Date().toISOString()}).where(eq(bookings.ticket,data.ticket)).returning({ticket:bookings.ticket});
    return result.length?json({ok:true}):json({error:'not_found'},404);
  } catch {return json({error:'unavailable'},503);}
}
