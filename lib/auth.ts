import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
export const sessionCookie = process.env.NODE_ENV === 'production' ? '__Host-telsoft_staff' : 'telsoft_staff';
export const sessionSeconds = 8 * 60 * 60;
export function authConfigured() {
  return !!process.env.ADMIN_PASSWORD_HASH && (process.env.ADMIN_SESSION_SECRET?.length || 0) >= 43;
}
export function verifyPassword(password: string) {
  if (!authConfigured() || password.length > 200) return false;
  const [salt, expected] = process.env.ADMIN_PASSWORD_HASH!.split(':');
  if (!/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{128}$/.test(expected || '')) return false;
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(expected, 'hex'));
}
function signature(value: string) {
  // Password rotation invalidates all existing sessions.
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET!).update(value + ':' + process.env.ADMIN_PASSWORD_HASH).digest('base64url');
}
export function createSession(now = Date.now()) {
  if (!authConfigured()) throw new Error('Staff login is not configured');
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + sessionSeconds, nonce: randomBytes(24).toString('hex') })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
export function verifySession(value: string | undefined, now = Date.now()) {
  if (!authConfigured() || !value || value.length > 1024) return false;
  try {
    const parts = value.split('.');
    if (parts.length !== 2) return false;
    const [payload, signed] = parts;
    const expected = signature(payload);
    if (signed.length !== expected.length || !timingSafeEqual(Buffer.from(signed), Buffer.from(expected))) return false;
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    const current = Math.floor(now / 1000);
    return Number.isInteger(exp) && exp > current && exp <= current + sessionSeconds;
  } catch { return false; }
}
