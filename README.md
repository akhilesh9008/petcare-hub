# PetCare Hub

PetCare Hub is a responsive, role-aware pet-care operating system. It keeps the pet profile at the centre of health records, veterinary appointments, reminders, products, services and AI-assisted care preparation.

The app is usable locally without paid services. Its default local mode persists accounts and API state in `data/petcare-hub.local.json`, while each signed-in owner has a separate browser workspace for fast local editing. Prisma/PostgreSQL models and a complete demo seed are included for production persistence.

## Included workflows

- Secure server login/register API, role-aware entry flow, protected routes and authorization helpers
- Pet-owner, veterinarian and service-provider workspaces, including local professional-profile setup for new demo accounts
- English, Hindi, Spanish and French navigation/account-flow language selection, persisted in the browser
- Pet onboarding, multiple pet profiles, device-photo uploads, profile editing and health summaries
- Digital Pet Passport with a printable/share-ready care card, health timeline, private check-in code and emergency handoff
- Health timeline with editable medical records, vaccination records, medications, document metadata and weight charts
- Health Band companion: browser-authorized Bluetooth Low Energy pairing for compatible Battery/Heart Rate services, explicit live-reading status, historical wellness summaries and manual habit logging
- Consent-first GPS route tracking: records the accompanying phone's location only while active, renders the route on an OpenStreetMap road map and offers an external road-route view
- Automatic reminder creation from vaccinations, medication end dates and appointments, plus a unified pet-care calendar
- Responsible breeding-match workspace with profile preferences, owner-controlled health-summary sharing and private interest requests
- Pet Social with local photo/video uploads, reactions, replies and audience selection for a pet-owner feed
- Pet-friendly places guide with local shortlists, cafe/restaurant/park/stay filters and a call-ahead access checklist
- Vet discovery, profile views, appointment request/cancellation and a clinician workflow
- Searchable/filterable marketplace, profile-aware non-prescription recommendations, cart, mock checkout and order history
- Service discovery, provider profiles, bookings and provider workflow
- A scoped PetCare AI chat that summarizes recorded history, prepares vet visits, notices wearable trends and gives profile-aware product context with clear veterinary safety boundaries
- Pet Digital Twin / Pet Insights: a pet-scoped, source-linked view that connects health, care, routine, documents, wearable, GPS and purchase records to Care Readiness, data freshness, weekly briefs, explainable insights, next best actions and recorded outcomes
- Review-first document inbox: device-selected PDF/image metadata, a clear human-verification queue and provenance-safe timeline events (raw document storage is intentionally not enabled in local mode)
- Vet-ready pre-visit brief: relevant history, current medication, owner observations, evidence-linked changes and discussion prompts, shown only through the appointment workflow in the local vet workspace
- Private Health Band API with authenticated pet ownership checks and deterministic demo syncs
- Owner, veterinarian, provider and admin dashboard experiences
- Prisma schema for users, pets, records, bookings, marketplace, reminders, notifications, reviews, AI conversations and wearable wellness aggregates

## Technology

- Next.js App Router + TypeScript + React
- Tailwind CSS, Lucide icons and Recharts
- Zod validation and typed domain services
- Prisma + PostgreSQL schema, bcrypt seed passwords
- Local mock adapters for payment, AI, notifications and file metadata
- Vitest business-rule tests

## Quick start

```bash
copy .env.example .env
npm install
npm run dev
```

If PowerShell blocks `npm.ps1` on Windows, use this equivalent command instead:

```powershell
npm.cmd run dev
```

Open `http://localhost:3000`. Use the login page’s role selector and the password below. The mock UI data persists in browser local storage; clear site data to reset it.

## Demo credentials

For normal use, choose Pet owner, Veterinarian or Service provider at `/register`, then sign in with the matching workspace selected at `/login`. The selected workspace is checked against the account role by the server; it does not grant a role by itself.

The local mock login options use these credentials:

| Workspace | Account | Password |
| --- | --- | --- |
| Pet owner | `akhilesh@petcare.demo` | `PetCare@123` |
| Veterinarian | `aarav@petcare.demo` | `PetCare@123` |
| Service provider | `paws@petcare.demo` | `PetCare@123` |
| Admin | `admin@petcare.demo` | `PetCare@123` |

The PostgreSQL seed uses `PetCare@123` for every seeded user; it prints representative seeded email addresses after completion.

## Local persistence

- New accounts, hashed credentials, sessions and API records are retained in `data/petcare-hub.local.json` when running locally.
- Pet profiles, device-photo data, records, reminders, document metadata, source-tagged context notes, recorded insight outcomes, band history, AI conversations, social posts and place shortlists are separated by signed-in user in browser local storage.
- Professional workspace setup and the chosen language are also browser-local in demo mode.
- Bluetooth device permission and GPS tracking require an explicit browser prompt. GPS route points are stored only in the current signed-in browser workspace and can be cleared from Health Band.
- The local JSON file is ignored by Git. Use Prisma/PostgreSQL and object storage before production deployment or multi-device sharing.

## Connect a real band and GPS route

1. Open `/health-band` in Chrome or Edge using `https://` (or `http://localhost` while developing on a computer).
2. Select the pet, choose **Connect a real BLE band**, and select the band in the browser's native Bluetooth picker.
3. If the device exposes standard Bluetooth Low Energy Battery or Heart Rate GATT services, the page reads them during the active browser session. The browser cannot silently scan, connect, or keep a band connected after the tab/page is closed.
4. Choose **Start GPS tracking** only while the GPS-enabled phone is travelling with the pet. Accept the location prompt; recorded points appear on the road map. Stop tracking or clear the route at any time.

This is a real browser integration, but it is intentionally not presented as universal smartwatch support. Apple Watch, Fitbit, Garmin, Wear OS and most vendor-locked pet trackers protect their data behind a manufacturer app, OAuth API, native mobile integration, or signed webhook. A generic website cannot bypass those controls. For unattended pet location, use a dedicated GPS pet tracker and integrate its approved provider API; a phone's GPS is only a proxy when the phone is actually with the pet.

The on-page map uses OpenStreetMap road tiles and draws the recorded GPS path between samples. The path is not road-matched or proof of an exact pet location; accuracy and last-report time are shown to keep this clear.

## PostgreSQL / Prisma setup

1. Create PostgreSQL database and update `DATABASE_URL` in `.env`.
2. Generate the client: `npm run prisma:generate`
3. Create a development migration: `npm run prisma:migrate -- --name init`
4. Seed realistic Indian demo data: `npm run prisma:seed`

The seed deliberately refuses to run when `NODE_ENV=production`. It creates 10 owners, 15+ pets, clinicians, providers, products, appointments, medical data, reminders, orders and AI conversations using fictional names and businesses.

## Commands

```bash
npm run dev             # local development server
npm run build           # production build
npm run start           # run production build
npm run typecheck       # TypeScript validation
npm run test            # unit tests
npm run prisma:generate # generate Prisma client
npm run prisma:migrate  # create/apply development migrations
npm run prisma:seed     # load demo PostgreSQL data
```

## Architecture

```text
src/app/              Routes, protected workspaces and API handlers
src/components/       Responsive reusable UI, cards, charts and states
src/features/         Local workflow store, app shell, forms and mock adapters
src/lib/              Zod validation, authorization, appointment/cart/reminder/health-band services
src/types/            Domain contracts shared by services and routes
prisma/               PostgreSQL schema and repeatable seed
tests/                Business-rule tests
```

## Pet Digital Twin architecture

The original feature set remains intact, but the owner experience is now organized around one pet rather than disconnected modules:

```text
Pet profile / passport
  -> Health: records, vaccinations, medication, weight
  -> Care: reminders, vet appointments, service bookings
  -> Life: habits, Health Band summaries, consented GPS route, orders, owner context
  -> Documents: review-first file metadata and verified fields
  -> Pet Intelligence: care readiness, freshness, weekly brief, source-linked insights and outcomes
  -> Actions: veterinarian, calendar, service, marketplace, AI vet preparation
```

`src/lib/pet-digital-twin.ts` is the normalized context boundary. It builds a derived event projection from the existing records; it does not create a conflicting second copy of a pet's health history. The owner dashboard, pet profile, `/insights`, PetCare AI, Health Band, care calendar, services, orders and marketplace all link back to the same selected pet.

### Current event and intelligence model

- Event categories: `HEALTH`, `CARE`, `LIFE`, `ACTIVITY`, `LOCATION`, `COMMERCE`, `PLANNING`, `DOCUMENT`, and `INTELLIGENCE`
- Event sources: owner, veterinarian, service provider, wearable, system and AI (AI hypotheses remain distinct from facts)
- Record-based insights: vaccine due, overdue task, upcoming appointment, recorded follow-up, weight trend/gap, Health Band observation, pending service booking and document review
- Care Readiness: a 0-100 completeness score for documented care, explicitly not a health score or diagnosis
- AI responses: deterministic, pet-scoped summaries, document/memory status, weekly briefs and vet preparation with clickable source links to the record, calendar, appointment, document or Health Band screen used
- Owner controls: insights can be dismissed, snoozed, or given a recorded outcome locally without changing their original evidence or medical record

The current implementation is a modular-monolith foundation. In local demo mode, the UI reads the signed-in browser workspace; server APIs already enforce pet ownership and authorized veterinarian access. A production rollout should persist the event projection, insights, consent grants and audit log in PostgreSQL, then have server-side workers generate reminders and intelligence snapshots. See [the Digital Life OS audit](docs/pet-digital-life-os-audit.md) for the proposed production data, API, UX and rollout architecture.

The UI is intentionally independent of paid infrastructure. Replace the local store/service adapters progressively:

1. Inject Prisma repositories behind the existing domain services.
2. Configure object storage for medical documents.
3. Replace mock checkout with a payment provider adapter.
4. Add email/push/SMS adapters to notification delivery.
5. Connect an approved AI provider behind the PetCare AI safety wrapper.
6. Replace the deterministic Health Band sync boundary with a verified wearable-provider webhook and consent flow for vendor-specific activity, sleep and unattended GPS data.
7. Add time-bound share links, explicit care-team consent scopes, revocation, access logs and server-side audit events before allowing a passport outside the owner workspace.

## Safety and privacy

PetCare AI gives general education only. It does not diagnose, prescribe, alter doses or substitute for a veterinarian; urgent symptom language is escalated to professional care. API authorization checks ownership and the veterinarian-to-pet appointment relationship. Client-side role views are convenience UI only—the server authorization helpers enforce access on API routes.

The local development build allows self-service veterinarian and service-provider accounts so the role workspaces can be tested. It is disabled in production: verify professional licences, identity and business details before granting clinical, booking-management or directory access. The current language selector translates core navigation and account flows; production internationalization should expand reviewed translations across every health, legal and safety-critical screen.

Breeding matches are informational owner-to-owner introductions, not health, genetic, temperament or pedigree certification. Owners control whether to offer a compact passport summary, and should obtain veterinarian and breed-specialist guidance before making any breeding decision. The pet-friendly venue cards are illustrative local planning data, not live confirmation of access; always contact a venue to verify its current policy.

## Deployment

Set `DATABASE_URL`, `AUTH_SECRET` and required provider credentials in your host’s secret store; run Prisma migrations during deployment; run the app with `npm run build` followed by `npm run start`. Configure HTTPS and secure cookies in production.

## Future improvements

- Connect the UI store directly to Prisma-backed repositories
- Persist a dedicated pet-event ledger, insight lifecycle, consent grants, veterinarian sharing scopes and immutable audit records
- Add server-side scheduled workers for reminder delivery, care-readiness refreshes and insight generation
- Verified provider onboarding and real availability calendars
- Object-storage antivirus scanning and signed health-document URLs
- Email/push/SMS notification adapters and scheduled delivery workers
- Payment-webhook reconciliation, taxes and returns
- Clinically reviewed AI prompt policies and audit logging
- Approved wearable-provider OAuth/webhook adapters, consent management, encrypted raw-signal retention and dedicated-tracker geofences
