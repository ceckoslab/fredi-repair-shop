import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../app/chatgpt-auth';
export const states = ['requested','scheduled','received','diagnosed','waiting','repairing','ready','collected','cancelled'] as const;
export function json(data: unknown, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get('origin');
  return !!origin && origin === new URL(req.url).origin;
}
export async function readBody(req: Request) {
  if (!req.headers.get('content-type')?.includes('application/json')) throw new Error('json required');
  const raw = await req.text();
  if (raw.length > 12000) throw new Error('body too large');
  return JSON.parse(raw);
}
export async function isAdmin() {
  const user = await getChatGPTUser();
  const allowed = (env.ADMIN_EMAILS ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  return !!user && allowed.includes(user.email.toLowerCase());
}
export async function allowRequest(req: Request, scope: string, limit: number, seconds: number) {
  if (!env.DB) return false;
  const now = Math.floor(Date.now()/1000);
  const caller = req.headers.get('oai-authenticated-user-id') || req.headers.get('cf-connecting-ip') || 'local';
  const hash = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(caller));
  const digest = Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
  const key = `${scope}:${digest}:${Math.floor(now/seconds)}`;
  const result = await env.DB.prepare('INSERT INTO rate_limits (key, count, expires) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count').bind(key, now+seconds).first<{count:number}>();
  await env.DB.prepare('DELETE FROM rate_limits WHERE expires < ?').bind(now-seconds).run();
  return !!result && result.count <= limit;
}
export function todayMunich() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Berlin',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
