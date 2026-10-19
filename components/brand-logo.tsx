export function BrandLogo({ href = '/', label = 'TelSoft – Startseite / Home', className = '' }: { href?: string; label?: string; className?: string }) {
  return <a href={href} className={`brand-logo ${className}`} aria-label={label} data-logo="08">
    <span className="brand-art">
      <img src="/images/telsoft-logo.webp" alt="TelSoft" width={1254} height={1254} />
    </span>
  </a>;
}
