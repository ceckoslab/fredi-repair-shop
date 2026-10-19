# TelSoft Munich prototype

A bilingual German/English mobile phone and laptop repair concept for Fredi. The site is a publicly accessible feedback prototype, not an operating repair business. Please use test data only. It includes an AI-edited portrait supplied by the user, clearly marked sample contact content, appointment requests, private ticket tracking, and a protected service dashboard.

## Sharing and repository

Public prototype: https://telsoft-muenchen-fredi.ceckoslab.chatgpt.site

GitHub: https://github.com/ceckoslab/fredi-repair-shop — branch `main`. The app is at the repository root; no `telsoft/` base directory is needed when cloning this repository.

The homepage is public for feedback. The service dashboard still requires an authorised account. Search indexing remains disabled. Real contact details, reviews, prices, customer operations, and complete business-specific legal information are not configured.

## Netlify deployment

The repository now builds with standard Next.js. Netlify uses `npm run build`, publish directory `.next`, Node 22, repository root as base, and branch `main`. Its automatic Next.js adapter runs the App Router API routes as server functions. `netlify.toml` records these settings.

The previous Sites preview remains at the URL above with its original independent test database. Historical Sites/Cloudflare source is preserved in commit `4e9c891`. Its demo records have not been copied to Netlify.

## Platform and security

- React, TypeScript and Next.js App Router. German/English design and customer flows are preserved.
- Netlify Blobs, using strong consistency and site-wide stores in `eu-central-1`. Production bookings survive redeployments. Preview deploys use separate namespaces.
- Atomic create-only writes make booking retries idempotent. Reusing a request ID with different data is rejected. Staff updates use ETag conditions and the last seen timestamp to reject stale edits.
- Staff login at `/werkstatt` uses a random private password, an scrypt hash, signed HttpOnly/Secure/SameSite cookies, and an eight-hour expiry. Rotating either credential invalidates existing sessions. The app no longer trusts Sites identity headers.
- Runtime environment variables: `ADMIN_PASSWORD_HASH` and `ADMIN_SESSION_SECRET`. Never prefix these with `NEXT_PUBLIC_`. Missing configuration denies staff access.
- Server-side validation, same-origin writes, persistent rate limits and 96-bit random ticket codes. Tracking never returns names, emails, phone numbers, postcodes or request IDs.
- Netlify supplies the client IP header used for throttling; only its hash is stored. Counters reset per window. A retention policy for old counter keys and bookings remains a launch requirement.
- No payment processing, email delivery, real calendar reservation, external analytics or invented customer reviews. Appointment submissions are requests requiring manual confirmation.
- Shared staff password suits this feedback prototype; per-person accounts and an audit trail are launch requirements.

### Staff credentials

`npm run admin:credentials` creates a new random password and signing secret without printing them. It writes private, Git-ignored `.local/staff-access.txt` and `.local/netlify.env` files and refuses to overwrite them. Import the two values into the Netlify project's environment, then redeploy. Share the password privately; never include it in public feedback links. Keep the environment file out of Git and out of public assets.

## Product behaviour

`POST /api/bookings` validates device, service, preferred date/time, postcode and contact fields, persists a request and returns its private ticket. Identical retries return the original ticket.

`POST /api/track` accepts a ticket and returns only device, appointment and status information. Customer-visible notes must not contain passwords or sensitive personal details.

`GET /api/workshop` and `PATCH /api/workshop` require a verified staff session. The dashboard shows the latest 200 requests and updates status and notes. Its prototype implementation scans records before selecting the latest 200; move to indexed SQL queries/pagination when the volume grows.

States: requested → scheduled → received → diagnosed → waiting / repairing → ready → collected, with cancellation available separately. On-site repairs can skip handover stages.

## Local development and checks

```sh
npm ci
npm run admin:credentials # once, if local staff access is needed
npm run dev -- --port 3000
npm test
npm run typecheck
npm run lint
npm run build
```

The development command starts Netlify's local Blobs emulator and Next.js. It keeps test records under ignored `.local/blobs` and never connects to the production database. `npm start` requires the Netlify runtime context for storage; use `npm run dev` for a standalone local preview.

Backend tests exercise persistent booking retries, conflicting updates, request limiting, and invalid/expired/rotated staff sessions. A live deployment check must additionally verify booking → staff update → public tracking, because local tests cannot prove Netlify runtime configuration.

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

- TypeScript check and production build.
- Desktop and mobile visual inspection in German and English.
- Browser booking → persisted storage record → ticket lookup.
- Unauthenticated staff reads and updates rejected; invalid bookings rejected.
- Authenticated dashboard update and subsequent customer lookup.
- Tracking response checked for absence of contact fields.

Local QA data and preview deploys are separate from production storage. Production email sending and real appointment fulfilment are not configured.
