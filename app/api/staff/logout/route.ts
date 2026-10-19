import { cookies } from 'next/headers';
import { sessionCookie } from '../../../../lib/auth';
import { json, sameOrigin } from '../../../../lib/server';
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'origin' }, 403);
  (await cookies()).set(sessionCookie, '', {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 0});
  return json({ ok: true });
}
