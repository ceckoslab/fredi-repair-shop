'use client';
import Link from 'next/link';
import { useState } from 'react';
export default function Login({configured}: {configured: boolean}) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <main className="wrap workshop"><Link className="logo" href="/">TelSoft.</Link><h1>Werkstatt / Workshop</h1><p>Geschützter Bereich für TelSoft-Mitarbeiter.<br/>Private area for TelSoft staff.</p>
    {!configured ? <p role="status" className="admin-note">Der Zugang wird eingerichtet. / Staff access is being configured.</p> : <form style={{maxWidth:420,marginTop:32}} onSubmit={async e => {
      e.preventDefault(); setBusy(true); setError('');
      const password = new FormData(e.currentTarget).get('password');
      try {
        const response = await fetch('/api/staff/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
        if (!response.ok) { setError(response.status === 429 ? 'Zu viele Versuche. Bitte in 15 Minuten erneut versuchen. / Too many attempts. Try again in 15 minutes.' : 'Anmeldung fehlgeschlagen. / Sign-in failed.'); return; }
        window.location.reload();
      } catch { setError('Verbindung fehlgeschlagen. / Connection failed.'); } finally { setBusy(false); }
    }}><label>Passwort / Password<input style={{display:'block',width:'100%',padding:14,margin:'10px 0 20px',border:'1px solid #ddd',borderRadius:8}} name="password" type="password" required maxLength={200} autoComplete="current-password"/></label><button className="button" disabled={busy}>{busy ? '…' : 'Anmelden / Sign in'}</button>{error && <p className="error" role="alert">{error}</p>}<p className="admin-note">Die Sitzung endet nach 8 Stunden. / Sessions expire after 8 hours.</p></form>}
  </main>;
}
