'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Copy, Palette, X } from 'lucide-react';

const storageKey = 'telsoft-logo-concept';
export const logoConcepts = [
  { id: '01', file: '01-fredi-original', de: 'Fredis Original', en: 'Fredi’s Original' },
  { id: '02', file: '02-fine-lines', de: 'Feine Linien', en: 'Fine Lines' },
  { id: '03', file: '03-stencil', de: 'Schablone', en: 'Stencil' },
  { id: '04', file: '04-pyramid-facets', de: 'Pyramiden-Facetten', en: 'Pyramid Facets' },
  { id: '05', file: '05-heritage', de: 'Klassisch', en: 'Heritage' },
  { id: '06', file: '06-precision', de: 'Präzision', en: 'Precision' },
  { id: '07', file: '07-makers-seal', de: 'Fredis Siegel', en: 'Maker’s Seal' },
  { id: '08', file: '08-pyramid-monogram', de: 'Pyramiden-Monogramm', en: 'Pyramid Monogram' },
  { id: '09', file: '09-flow', de: 'Weiche Formen', en: 'Flow' },
  { id: '10', file: '10-horizontal-signature', de: 'Horizontale Signatur', en: 'Horizontal Signature' },
] as const;
type Concept = typeof logoConcepts[number];
const fallback = logoConcepts[9];
const findConcept = (id: string | null) => logoConcepts.find(logo => logo.id === id);
const imagePath = (logo: Concept) => `/images/logos/${logo.file}.webp`;
const BrandContext = createContext({ logo: fallback as Concept, select: (_logo: Concept) => {}, saved: true });

export function BrandProvider({ children }: { children: ReactNode }) {
  const [logo, setLogo] = useState<Concept>(fallback);
  const [saved, setSaved] = useState(true);
  useEffect(() => {
    const shared = findConcept(new URL(window.location.href).searchParams.get('logo'));
    try {
      const stored = findConcept(localStorage.getItem(storageKey));
      setLogo(shared ?? stored ?? fallback);
      if (shared) localStorage.setItem(storageKey, shared.id);
    } catch {
      if (shared) setLogo(shared);
      setSaved(false);
    }
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null) setLogo(findConcept(event.newValue) ?? fallback);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const select = (next: Concept) => {
    setLogo(next);
    try { localStorage.setItem(storageKey, next.id); setSaved(true); } catch { setSaved(false); }
    const url = new URL(window.location.href);
    if (url.searchParams.has('logo')) {
      url.searchParams.set('logo', next.id);
      window.history.replaceState(window.history.state, '', url);
    }
  };
  return <BrandContext.Provider value={{ logo, select, saved }}>{children}</BrandContext.Provider>;
}

export function BrandLogo({ href = '/', label = 'TelSoft – Startseite / Home', className = '' }: { href?: string; label?: string; className?: string }) {
  const { logo } = useContext(BrandContext);
  return <a href={href} className={`brand-logo ${className}`} aria-label={label} data-logo={logo.id}>
    <span className={`brand-art ${logo.id === '10' ? 'brand-art-horizontal' : ''}`}>
      <img src={imagePath(logo)} alt="TelSoft" width={1254} height={1254} />
    </span>
  </a>;
}

export function LogoChooser({ language = 'de' }: { language?: 'de' | 'en' }) {
  const { logo, select, saved } = useContext(BrandContext);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const en = language === 'en';
  const t = (de: string, english: string) => en ? english : de;

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [open]);
  useEffect(() => { if (!copied) return; const timer = window.setTimeout(() => setCopied(false), 2200); return () => window.clearTimeout(timer); }, [copied]);
  const share = async () => {
    const url = new URL('/', window.location.origin);
    url.searchParams.set('logo', logo.id);
    try { await navigator.clipboard.writeText(url.href); setCopied(true); setShareUrl(''); }
    catch { setShareUrl(url.href); }
  };
  return <div className="logo-chooser" ref={container}>
    {open && <section className="logo-panel" id="logo-panel" aria-label={t('Logo auswählen', 'Choose a logo')}>
      <div className="logo-panel-heading"><div><span className="eyebrow">{t('FÜR FREDI', 'FOR FREDI')}</span><h2>{t('Welches passt zu dir?', 'Which one feels like you?')}</h2></div>
        <button className="icon-button" aria-label={t('Logoauswahl schließen', 'Close logo chooser')} onClick={() => { setOpen(false); trigger.current?.focus(); }}><X size={18}/></button>
      </div>
      <div className="logo-selected-preview" aria-hidden="true"><span className={`brand-art ${logo.id === '10' ? 'brand-art-horizontal' : ''}`}><img src={imagePath(logo)} alt="" width={1254} height={1254}/></span></div>
      <div className="logo-options" role="group" aria-label={t('10 Logoentwürfe', '10 logo concepts')}>
        {logoConcepts.map(option => <button key={option.id} className="logo-option" aria-pressed={logo.id === option.id} aria-label={`Logo ${option.id}: ${en ? option.en : option.de}`} onClick={() => { select(option); setCopied(false); setShareUrl(''); }}>
          <img src={imagePath(option)} alt="" width={1254} height={1254} loading="lazy"/>
          <span>{option.id}{logo.id === option.id && <Check size={11}/>}</span>
        </button>)}
      </div>
      <p className="logo-current" aria-live="polite"><strong>{logo.id} / {en ? logo.en : logo.de}</strong></p>
      <p className="logo-save-hint">{saved ? t('Deine Auswahl bleibt in diesem Browser gespeichert.', 'Your choice is saved in this browser.') : t('Auswahl für diesen Besuch. Teilen per Link funktioniert weiterhin.', 'Selected for this visit. You can still share it by link.')}</p>
      <button className="logo-share" onClick={share}>{copied ? <Check size={15}/> : <Copy size={15}/>}<span aria-live="polite">{copied ? t('Link kopiert', 'Link copied') : t('Link zu meiner Auswahl kopieren', 'Copy a link to my choice')}</span></button>
      {shareUrl && <input className="logo-share-fallback" readOnly aria-label={t('Link zur Auswahl', 'Link to your choice')} value={shareUrl} onFocus={event => event.target.select()}/>}
    </section>}
    <button className="logo-chooser-toggle" ref={trigger} aria-expanded={open} aria-controls={open ? 'logo-panel' : undefined} onClick={() => setOpen(!open)}><Palette size={17}/><span>{t('Logos testen', 'Try logos')}</span><span className="logo-count">{logo.id}/10</span></button>
  </div>;
}
