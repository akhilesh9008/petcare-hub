# Pet Digital Life OS — architecture assessment and delivery plan

## 1. Current architecture assessment

PetCare Hub is a modular Next.js App Router application. The production-oriented server layer uses typed API routes, Zod validation, role-aware session helpers, authorization checks and repository abstractions. Prisma models target PostgreSQL; local development falls back to a JSON-backed repository and the owner UI keeps a fast, per-user browser workspace for demo editing.

The UI is intentionally not coupled to a paid vendor. `src/lib/pet-digital-twin.ts` is the current normalized, pet-scoped context layer. It projects existing health, care, activity, location and commerce records into an explainable timeline and deterministic insights.

## 2. Existing feature inventory

- Pet identity, photo, allergies, conditions, dietary preferences and microchip fields
- Medical records, vaccinations, medication history, weights, document metadata and follow-up dates
- Care calendar, automatic reminders, appointments, service bookings, products, cart and orders
- Role-aware owner, veterinarian, provider and admin workspaces
- Browser-authorized BLE data, non-diagnostic wellness aggregates, habits and consented phone GPS routes
- Digital passport, emergency handoff, breeding privacy controls, social and places workflows
- Deterministic PetCare AI with source links, protected API routes and selected-pet context
- Existing Prisma support for veterinary access grants, documents and wearable data

## 3. Redundancy inventory

- Health timeline, dashboard activity and passport history previously rendered overlapping record lists. The Digital Twin timeline is the shared projection for cross-domain history.
- Marketplace, service and AI previously calculated separate pet hints. They now consume the selected pet context where implemented.
- The local browser workspace and server repository are parallel development adapters, not two production sources of truth. The server repository must become authoritative before multi-device release.

## 4. Missing infrastructure

- Persistent event ledger, insight lifecycle/outcomes, memory/provenance and audit log
- Signed object storage, malware scanning and document extraction workers
- Time-limited server-enforced passport sharing and care-team consent scopes
- Provider OAuth/webhooks for commercial wearables, GPS trackers, messaging and payment systems
- Scheduled jobs for freshness, reminders, weekly briefs and insight evaluation
- Clinic-grade review, medical-policy validation, observability, rate limiting and security review

## 5. Differentiation gaps addressed in this phase

This phase prioritizes the loop that makes the product more than a feature catalog:

```text
Pet records -> pet context -> evidence-based insight -> next action
  -> recorded owner outcome -> life timeline -> improved future context
```

It adds local, explicit models for memory, document-review metadata and insight outcomes, freshness reporting, a weekly brief and a vet-ready visit brief. It does not claim OCR, external sharing or clinical decision-making.

## 6. Proposed final architecture

```text
Next.js modular monolith
  ├─ Authoritative PostgreSQL domain records
  ├─ Pet Event Ledger (append-only references to domain records)
  ├─ Pet Context projector
  ├─ Deterministic intelligence rules + optional LLM explanation layer
  ├─ Consent/audit/share boundary
  ├─ Object-storage document ingestion + verification queue
  └─ Owner, vet, provider and API views
```

Every view receives a permission-scoped `PetContext`; no client route should assemble another user's private history.

## 7. Database changes required for production

Add migration-backed models rather than duplicating medical records:

- `PetEvent` (source type/id, actor, event type, timestamp, provenance, privacy, related event)
- `PetMemory` (kind, source, confidence, verified status, last verified, author)
- `Insight` and `InsightOutcome` (evidence snapshot, status, action, outcome, timing)
- `DocumentImport` / `DocumentExtractionField` (object key, extracted value, confidence, review state)
- `PassportShareGrant`, `CareTeamMembership`, `ConsentGrant` and `AuditLog`
- `WearableRawMeasurement` only when retention, encryption and consent policy are approved

Existing `HealthDocument`, `VeterinarianPetAccess` and wearable aggregate models are preserved and extended through migrations.

## 8. API changes required for production

- `GET /api/pets/:id/context`, `/timeline`, `/insights`, `/weekly-brief`, `/visit-brief`
- `POST /api/pets/:id/outcomes`, `/memory`, `/documents/import`, `/passport-shares`
- Server-enforced permission checks for every context, event, document and share request
- Idempotency keys for imports, device sync and webhook ingestion
- Upload URLs/scan callbacks instead of browser-local document payloads

## 9. UX changes in this phase

- Pet-centred home and Insights screen: readiness, priority, evidence, action and outcome
- Data freshness and weekly summary reduce dashboard noise
- Document intake is a review-first flow; no uncertain data is silently added to medical history
- Vet visit brief surfaces current facts and changes before a consultation
- Emergency/pasport remain fact-first and never diagnose

## 10. Implementation roadmap

1. Implement the local outcome, memory, document-review and freshness models.
2. Project these into the Digital Twin timeline and insight quality UI.
3. Add a review-first document intake screen and a vet visit brief.
4. Verify TypeScript and unit rules; document sandbox limitations.
5. Migrate the same contracts to server-backed PostgreSQL, sharing and storage in a later production phase.

## 11. Risk list

- Browser-local workspace data is not a secure multi-device clinical record.
- Document labels are metadata only without object storage/OCR; upload does not equal verification.
- Wearable and GPS data are observational, can be incomplete and must not be treated as diagnostic.
- Existing demo clinical/provider identities are illustrative until credentialing is implemented.
- Passport copy links are not secure external grants until server-side tokens and expiry enforcement exist.

## 12. Testing strategy

- Unit-test pet-context filtering, event projection, freshness, insight evidence, outcomes, product filtering and AI abstention.
- Integration-test server authorization for owner/veterinarian/document/share access.
- Add idempotency tests for imports and device webhooks before integration work.
- Use a seeded Bruno demo story: record/document -> context -> alert -> action -> outcome -> updated timeline/brief.
- Run `typecheck`, Vitest and production build after each phase. In this managed environment, child-process based Vitest/build can fail with `spawn EPERM`; a passing local/CI run remains required.
