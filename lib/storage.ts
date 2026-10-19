import { getStore } from '@netlify/blobs';
import { createHash, randomBytes } from 'node:crypto';

export type Booking = {
  ticket: string; requestId: string; name: string; email: string; phone: string;
  postcode: string; device: string; brand: string; model: string; service: string;
  issue: string; date: string; time: string; language: string; status: string;
  note: string; createdAt: string; updatedAt: string;
};
type BookingInput = Omit<Booking, 'ticket' | 'status' | 'note' | 'createdAt' | 'updatedAt'>;
function store(name: string) {
  // Site-wide stores survive deployments; previews never share production data.
  const context = process.env.CONTEXT || 'local';
  const namespace = context === 'production' ? 'production' : `preview-${process.env.DEPLOY_ID || 'local'}`;
  return getStore({ name: `telsoft-${namespace}-${name}`, consistency: 'strong', region: 'eu-central-1', fetch: (url, options) => fetch(url, {...options, cache:'no-store', signal:AbortSignal.timeout(5000)}) });
}
export class RetryConflict extends Error {}
async function readVersioned(db: ReturnType<typeof getStore>, key: string) {
  const current = await db.getWithMetadata(key, { type: 'json' });
  if (!current || current.etag) return current;
  // The local Blobs emulator omits ETags on GET. Read its listed version
  // BEFORE reading the data again, so a concurrent change still fails the CAS.
  const {blobs} = await db.list({prefix:key});
  const etag = blobs.find(blob => blob.key === key)?.etag;
  const data = await db.get(key, {type:'json'});
  return data && etag ? {data, etag, metadata:{}} : null;
}
export async function createBooking(input: BookingInput) {
  const db = store('bookings');
  const key = `requests/${input.requestId}`;
  const fingerprint = createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const ticket = 'TS-' + randomBytes(12).toString('hex').toUpperCase().match(/.{6}/g)!.join('-');
  // Atomically claim one ticket. Retries after interrupted writes finish the save.
  await db.setJSON(key, { ticket, fingerprint }, { onlyIfNew: true });
  const claim = await db.get(key, { type: 'json' }) as {ticket: string; fingerprint: string};
  if (claim.fingerprint !== fingerprint) throw new RetryConflict('Request ID already used');
  const now = new Date().toISOString();
  const result = await db.setJSON(`bookings/${claim.ticket}`, {
    ...input, ticket: claim.ticket, status: 'requested', note: '', createdAt: now, updatedAt: now,
  }, { onlyIfNew: true });
  return { ticket: claim.ticket, created: result.modified };
}
export async function findBooking(ticket: string): Promise<Booking | null> {
  return store('bookings').get(`bookings/${ticket}`, { type: 'json' });
}
export async function listBookings(): Promise<Booking[]> {
  const db = store('bookings');
  const rows: Booking[] = [];
  for await (const page of db.list({ prefix: 'bookings/', paginate: true })) {
    for (let i = 0; i < page.blobs.length; i += 20) {
      const batch = await Promise.all(page.blobs.slice(i, i + 20).map(b => db.get(b.key, { type: 'json' })));
      rows.push(...batch.filter(Boolean));
    }
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200);
}
export async function updateBooking(ticket: string, status: string, note: string, expectedUpdatedAt: string) {
  const db = store('bookings');
  const key = `bookings/${ticket}`;
  const current = await readVersioned(db, key);
  if (!current) return 'missing';
  if (current.data.updatedAt !== expectedUpdatedAt || !current.etag) return 'conflict';
  const result = await db.setJSON(key, { ...current.data, status, note, updatedAt: new Date().toISOString() }, { onlyIfMatch: current.etag });
  return result.modified ? 'saved' : 'conflict';
}
export async function consumeRateLimit(caller: string, scope: string, limit: number, seconds: number) {
  const db = store('limits');
  const key = `${scope}/${createHash('sha256').update(caller).digest('hex')}`;
  const window = Math.floor(Date.now() / (seconds * 1000));
  for (let attempt = 0; attempt < 8; attempt++) {
    const current = await readVersioned(db, key);
    const count = current?.data.window === window ? current.data.count : 0;
    if (count >= limit) return false;
    const condition = current?.etag ? { onlyIfMatch: current.etag } : { onlyIfNew: true as const };
    const result = await db.setJSON(key, { window, count: count + 1 }, condition);
    if (result.modified) return true;
  }
  return false;
}
