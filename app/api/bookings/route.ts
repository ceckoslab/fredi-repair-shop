import { z } from 'zod';
import { createBooking, RetryConflict } from '../../../lib/storage';
import { json, sameOrigin, readBody, allowRequest, todayMunich } from '../../../lib/server';
const schema = z.object({
  requestId:z.string().uuid(),name:z.string().trim().min(2).max(100), email:z.string().trim().email().max(160),
  phone:z.string().trim().max(40),postcode:z.string().regex(/^\d{5}$/),device:z.enum(['phone','laptop']),brand:z.enum(['Apple','Samsung','Dell','HP','Lenovo']),
  model:z.string().trim().min(2).max(100),service:z.enum(['screen','battery','liquid','data','diagnostic']),
  issue:z.string().trim().max(1500),date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),time:z.enum(['morning','afternoon','flexible']),
  language:z.enum(['de','en']),consent:z.literal(true),website:z.string().max(0),
});
export async function POST(req:Request) {
  if (!sameOrigin(req)) return json({error:'origin'},403);
  let input;try {input=schema.parse(await readBody(req));} catch {return json({error:'validation'},400);}
  const validBrands=input.device==='phone'?['Apple','Samsung']:['Apple','Dell','HP','Lenovo'];
  const date=new Date(input.date+'T12:00:00Z');
  const maxDate = new Date(Date.now()+90*86400000).toISOString().slice(0,10);
  if (!validBrands.includes(input.brand) || isNaN(date.getTime()) || date.toISOString().slice(0,10)!==input.date || input.date<todayMunich() || input.date>maxDate) return json({error:'validation'},400);
  try {
    if (!await allowRequest(req,'booking',10,3600)) return json({error:'rate'},429);
    const {consent,website,...data}=input;
    void consent; void website;
    const result = await createBooking({...data, email:input.email.toLowerCase()});
    return json({ticket:result.ticket},result.created?201:200);
  } catch (error) { return error instanceof RetryConflict ? json({error:'conflict'},409) : json({error:'unavailable'},503); }
}
