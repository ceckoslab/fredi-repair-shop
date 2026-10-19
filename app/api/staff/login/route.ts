import { cookies } from 'next/headers';
import { authConfigured, createSession, sessionCookie, sessionSeconds, verifyPassword } from '../../../../lib/auth';
import { allowRequest, json, readBody, sameOrigin } from '../../../../lib/server';
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: 'origin' }, 403);
  let password: string;
  try {
    const body = await readBody(req);
    if (typeof body.password !== 'string' || body.password.length > 200) throw new Error();
    password = body.password;
  } catch { return json({ error: 'validation' }, 400); }
  if (!authConfigured()) return json({ error: 'unconfigured' }, 503);
  try {
    if (!await allowRequest(req, 'login', 8, 900)) return json({ error: 'rate' }, 429);
    if (!verifyPassword(password)) return json({ error: 'credentials' }, 401);
    (await cookies()).set(sessionCookie, createSession(), {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: sessionSeconds,
    });
    return json({ ok: true });
  } catch { return json({ error: 'unavailable' }, 503); }
}
