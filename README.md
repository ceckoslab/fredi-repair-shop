# TelSoft Munich prototype

A bilingual German/English mobile phone and laptop repair concept for Fredi. The site is a private prototype, not an operating repair business. It includes an AI-edited portrait supplied by the user, clearly marked sample contact content, appointment requests, private ticket tracking, and a protected service dashboard.

## Platform decisions

- React + TypeScript on the supplied Vinext framework, deployed to Sites / Cloudflare Workers. The framework is used because bookings and updates need server-side processing.
- Cloudflare D1 + Drizzle migrations persist requests across devices. Browser storage is used only for language preference.
- German is the default; the language switch updates visible content and the document language and persists locally. A later public SEO release could use separate `/de` and `/en` routes with hreflang.
- Server-side validation, same-origin writes, hashed request throttling identifiers, parameterised database access, and 96-bit random private ticket codes. Tracking responses omit names, email addresses, phone numbers, and postcodes.
- The service dashboard at `/werkstatt` uses Sites-managed ChatGPT sign-in plus a server-side `ADMIN_EMAILS` allowlist. Missing configuration denies access. The hosted prototype allows the current Site owner; Fredi can be added after his account is supplied.
- No payment processing, email delivery, external analytics, review scraping, or calendar reservation is configured. A submitted appointment is a request, not an accepted time slot. The dashboard can mark it confirmed.
- Local image, CSS, and system fonts avoid extra third-party asset requests. The portrait is illustrative; Fredi does not have the pictured workshop.

## Product behaviour

`POST /api/bookings` validates a device, brand, model, service, preferred date/time, postcode, contact details, and acknowledgement; saves a request; and returns a private ticket. Request UUIDs prevent duplicate retries after a completed save.

`POST /api/track` accepts the private ticket and returns device information and status. Do not share ticket codes publicly. Customer-visible notes must not contain passwords or sensitive personal details.

`GET /api/workshop` and `PATCH /api/workshop` require authorised staff identity. The dashboard lists the latest 200 requests and permits updates to status and customer-visible notes. A real launch would need pagination, deletion/retention controls, operational logging, backups, and staff onboarding.

States: requested → scheduled → received → diagnosed → waiting / repairing → ready → collected. Cancelled is available separately. Staff choose the actual state; the interface does not impose a rigid sequence because on-site repairs can skip handover stages.

## Local development

Node 22.13+ is required. Use `npm run dev` for local development. Dependencies and builds are managed by the installed Sites plugin; `npm run build` works for standalone builds.

D1 bindings are declared in `.openai/hosting.json`. Generate schema migrations with `npm run db:generate`. After a build, apply each new SQL file once with:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/<migration>.sql
```

For local admin testing, use ignored `.dev.vars` with `ADMIN_EMAILS="seedy@sites.test"`, then open `/signin-with-chatgpt?return_to=/werkstatt`. The starter's mock authentication is local-development-only. Hosted admin addresses are runtime secrets and are never included in client source.

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
- Browser booking → persisted local D1 record → ticket lookup.
- Unauthenticated staff reads and updates rejected; invalid bookings rejected.
- Authorised dashboard update and subsequent customer lookup.
- Tracking response checked for absence of contact fields.

Local QA data is separate from the hosted database. Production email sending and real appointment fulfilment are not configured.
