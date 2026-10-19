# TelSoft Munich prototype

A bilingual German/English mobile phone and laptop repair concept for Fredi. The site is a publicly accessible feedback prototype, not an operating repair business. Please use test data only. It includes an AI-edited portrait supplied by the user, clearly marked sample contact content, a browser-local booking demonstration, ticket tracking, and an open admin demo.

## Sharing and repository

Public Netlify preview: https://telsoft-muenchen.netlify.app

Admin demo: https://telsoft-muenchen.netlify.app/werkstatt/

GitHub: https://github.com/ceckoslab/fredi-repair-shop — branch `main`. The app is at the repository root; no `telsoft/` base directory is needed when cloning this repository.

The homepage is public for feedback. The admin demo is open and uses only the visitor’s local demo data. Search indexing remains disabled. Real contact details, reviews, prices, customer operations, and complete business-specific legal information are not configured.

## Netlify feedback preview

This is a static, interactive demo. No backend, accounts, credentials, environment variables, or shared customer database are required. Netlify builds `main` automatically using `npm run build`, publish directory `out`, and Node 22. The repository root is the base directory.

- German/English landing page, services, mobile repair concept, and Fredi’s illustrative photo.
- Booking saves a fictional request to **this visitor’s browser only** and returns a demo ticket.
- Tracking finds that ticket in the same browser.
- `/werkstatt/` is an open admin demo. It lists the visitor’s local requests plus one example and lets them change repair status and notes.
- A status change appears when the ticket is looked up again. Refreshing retains the demo; other browsers and devices have separate data.
- No messages, emails, payments, appointments, or customer requests are sent. Please use test details only. Clear the site’s browser data to reset the demo.
- No customer form payloads are transmitted to Netlify. Netlify serves the static files and processes normal technical access logs.

The earlier Sites preview at https://telsoft-muenchen-fredi.ceckoslab.chatgpt.site is separate and unchanged. A full Netlify backend was prepared in commit `7d60728`, but is intentionally not used for this simple feedback preview. Before real customer operations, implement and review authentication, shared persistent storage, retention, legal content, and appointment/email workflows.

## Development

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
```

The production build exports static files to `out/`. No server functions or private configuration are needed. Do not put secrets in this public demo.

## Prototype content and launch dependencies

- Address: Leopoldstraße 12, 80802 München is explicitly a layout placeholder, not Fredi's address and not a customer drop-off point.
- The concept is home/office visits by prior appointment. Coverage, call-out fee, hours, available repairs, and actual business identity remain to be confirmed.
- Free diagnosis is the requested concept. Any travel fee must be separately disclosed and agreed; the prototype does not assign arbitrary repair prices.
- Review/profile areas intentionally contain no fabricated reviews, ratings, or profile links.
- Legal/privacy panels explicitly state that required business-specific information is incomplete. Search indexing is disabled until a public launch is ready.
- Obtain a written HWK/IHK activity classification for the exact intended repair work. Check consumer-contract/cancellation procedures before paid work starts. See the research below.

## Research: mobile repairs in Munich

Checked 19 October 2026. This is a planning assessment; a customer's home does not exempt a repair activity from its normal trade requirements.

1. **Mobile service is a plausible model.** [SaveYourHandy](https://www.saveyourhandy.com/) advertises Munich home/office phone and laptop repair, advance diagnosis, and appointment coordination. This establishes a competitor offering, not proof of Fredi's permissions or market demand. Home visits offer convenience, but the idea is already present locally.
2. **Prebooked work differs from unsolicited travel trade.** [IHK Munich's explanation](https://www.ihk-muenchen.de/ratgeber/recht/gewerberecht/) ties Reisegewerbe to approaching customers without prior orders. Inference: a genuine customer-booked visit usually belongs to the ordinary registered business model, rather than requiring a Reisegewerbekarte just because the technician travels. Do not use mobile work as a workaround for craft rules.
3. **Exact repair scope is the key unresolved issue.** Informationstechniker is a regulated craft in [HwO Anlage A](https://www.gesetze-im-internet.de/hwo/anlage_a.html). [HwO §1](https://www.gesetze-im-internet.de/hwo/__1.html) distinguishes essential craft activities from minor activities. [IHK Munich's EDV guidance](https://www.ihk-muenchen.de/ihk/documents/Recht-Steuern/abgrenzung-zum-handwerk-edv2023.pdf) permits certain PC module swaps and software work without craft registration, but distinguishes monitor and mains-voltage work. The PDF itself is dated March 2020 despite its filename. It does not provide blanket clearance for modern phone screen, battery, board, liquid-damage, or data-recovery work. Ask HWK Munich for written classification against Fredi's qualifications and a precise service list; entry may require a Meister, recognised equivalent, eligible manager, or applicable exception.
4. **Business registration is still required.** [The City of Munich](https://stadt.muenchen.de/service/info/gewerbeamt/10164604/) requires registration by the start of business and prior craft registration for activities that require it. A public shop is not the defining condition of the booked-visit model, but Fredi still needs a genuine lawful business address. Check any use of his home for administration, storage, or repairs separately; this research does not establish landlord or planning permission.
5. **Consumer cancellation needs a proper process.** [BGB §312g](https://www.gesetze-im-internet.de/bgb/__312g.html) generally covers distance and off-premises contracts; [§355](https://www.gesetze-im-internet.de/bgb/__355.html) states the usual 14-day period. For early performance, record the required express consent/request and durable documentation; full-performance conditions appear in the current [§356(5)](https://www.gesetze-im-internet.de/bgb/__356.html). The urgent-repair exception is narrow and is not a blanket exception for every cracked screen. The prototype intentionally captures an enquiry only and does not start a paid service contract.

### Recommended first operating model (proposal, not an existing TelSoft offer)

Start with a limited postcode area, booked visits, photos/model details before the visit, a model-specific scope, and a clearly quoted travel charge. Check parts availability before confirming a slot. Select only repairs that can be done safely with the required tools and permissions at a customer's table. Reserve board-level work, complex liquid damage, and advanced data recovery for an appropriately equipped and authorised setting or a confirmed partner. Obtain insurance appropriate to customer property, custody, and data-related risk; agree test/backup responsibilities and device access boundaries. Never collect unlock codes in the booking form.

Potential differentiation to test: named technician, German/English service, clear appointment windows, transparent travel costs, and visible progress. This is a business hypothesis; no conversion or profitability study has been performed.

## Verification

Build and TypeScript checks, plus a browser-local demo test covering booking, duplicate retries, tracking, and status updates. After deployment, verify the live page and admin demo. The preview never fulfils real appointments.
