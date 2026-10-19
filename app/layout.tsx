import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'TelSoft München | Handy- & Laptop-Reparatur mit Fredi',
  description: 'Ein zweites Leben für dein Gerät. Smartphone- und Laptop-Reparatur in München: Display, Akku, Flüssigkeitsschäden und Datenrettung. Kostenlose Diagnose.',
  robots: { index: false, follow: false },
  icons: { icon: { url: '/favicon.png', type: 'image/png', sizes: '128x128' } },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="de"><body>{children}</body></html>;
}
