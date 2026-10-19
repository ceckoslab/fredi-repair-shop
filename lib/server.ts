import { cookies } from 'next/headers';
import { sessionCookie, verifySession } from './auth';
import { consumeRateLimit } from './storage';
export const states = ['requested','scheduled','received','diagnosed','waiting','repairing','ready','collected','cancelled'] as const;
export function json(data: unknown, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export function sameOrigin(req: Request) {
  try {
    const origin = new URL(req.headers.get('origin') || '');
    const url = new URL(req.url);
    const host = req.headers.get('host') || url.host;
    const protocol = process.env.NETLIFY ? 'https:' : url.protocol;
    return origin.host === host && origin.protocol === protocol;
  } catch { return false; }
}
export async function readBody(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new Error('json required');
  const raw = await req.text();
  if (raw.length > 12000) throw new Error('body too large');
  return JSON.parse(raw);
}
export async function isAdmin() {
  return verifySession((await cookies()).get(sessionCookie)?.value);
}
export async function allowRequest(req: Request, scope: string, limit: number, seconds: number) {
  // Netlify sets this at the edge; Sites identity headers are never trusted here.
  const caller = process.env.NETLIFY ? req.headers.get('x-nf-client-connection-ip') : 'local';
  if (!caller) return false;
  return consumeRateLimit(caller, scope, limit, seconds);
}
export function todayMunich() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
