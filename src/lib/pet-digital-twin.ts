import type {
  Appointment,
  BandAlert,
  BandDailyMetric,
  HealthBand,
  HealthRecord,
  Medication,
  Order,
  Pet,
  PetDocument,
  PetHabit,
  PetInsightOutcome,
  PetLocationPoint,
  PetMemory,
  Product,
  Reminder,
  ServiceBooking,
  ServiceProvider,
  Vaccination,
  Vet,
  WeightRecord,
} from "@/features/demo-data";

/**
 * The normalized input boundary for the owner-facing Digital Twin. In local
 * mode the data comes from the workspace store; a production repository can
 * provide the same shape without changing consuming UI or intelligence rules.
 */
export interface PetContextInput {
  pet: Pet;
  records: HealthRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  weights: WeightRecord[];
  reminders: Reminder[];
  appointments: Appointment[];
  orders: Order[];
  bookings: ServiceBooking[];
  providers: ServiceProvider[];
  vets: Vet[];
  bands: HealthBand[];
  bandMetrics: BandDailyMetric[];
  habits: PetHabit[];
  bandAlerts: BandAlert[];
  locationPoints: PetLocationPoint[];
  memories?: PetMemory[];
  documents?: PetDocument[];
  insightOutcomes?: PetInsightOutcome[];
  products?: Product[];
  now?: Date;
}

export type PetEventCategory = "HEALTH" | "CARE" | "LIFE" | "ACTIVITY" | "LOCATION" | "COMMERCE" | "PLANNING" | "DOCUMENT" | "INTELLIGENCE";
export type PetEventSource = "OWNER" | "VETERINARIAN" | "SERVICE_PROVIDER" | "WEARABLE" | "SYSTEM" | "AI";

export interface PetSourceReference {
  id: string;
  label: string;
  href: string;
  sourceType: "record" | "vaccination" | "medication" | "weight" | "reminder" | "appointment" | "wearable" | "location" | "order" | "service" | "pet" | "document" | "memory" | "outcome";
}

/** A safe, minimal event projection. It keeps sensitive raw content in its source record. */
export interface PetLifeEvent {
  id: string;
  petId: string;
  occurredAt: string;
  category: PetEventCategory;
  eventType: string;
  title: string;
  description?: string;
  source: PetEventSource;
  href: string;
  sourceReference: PetSourceReference;
}

export interface PetCareReadiness {
  score: number;
  strengths: string[];
  needsAttention: string[];
  explanation: string;
}

export interface PetNextAction {
  id: string;
  label: string;
  href: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface PetInsight {
  id: string;
  petId: string;
  type: "VACCINATION_DUE" | "CARE_OVERDUE" | "UPCOMING_APPOINTMENT" | "FOLLOW_UP" | "WEIGHT_TREND" | "WEIGHT_GAP" | "WEARABLE_PATTERN" | "SERVICE_BOOKING" | "DOCUMENT_REVIEW" | "CARE_PLAN";
  title: string;
  summary: string;
  why: string;
  evidence: string[];
  importance: "HIGH" | "MEDIUM" | "LOW";
  confidence: "HIGH" | "MEDIUM";
  timeSensitivity: "NOW" | "TODAY" | "THIS_WEEK" | "WHEN_PRACTICAL";
  status: "ACTIVE" | "SNOOZED" | "DISMISSED" | "ACTION_RECORDED";
  action: PetNextAction;
  sources: PetSourceReference[];
  createdAt: string;
}

type PetInsightDraft = Omit<PetInsight, "evidence" | "timeSensitivity" | "status">;

export interface PetCareTask {
  id: string;
  petId: string;
  title: string;
  dueDate?: string;
  status: "UPCOMING" | "OVERDUE" | "COMPLETED";
  source: string;
  reason: string;
  action: PetNextAction;
}

export interface PetContext {
  pet: Pet;
  generatedAt: string;
  identity: {
    name: string;
    species: Pet["species"];
    breed: string;
    birthDate: string;
    gender: Pet["gender"];
    image: string;
    allergies: string[];
    conditions: string[];
    preferences: string[];
    microchipId?: string;
  };
  health: {
    records: HealthRecord[];
    vaccinations: Vaccination[];
    medications: Medication[];
    weights: WeightRecord[];
    latestWeight?: WeightRecord;
    latestVetVisit?: HealthRecord;
    activeMedication: Medication[];
  };
  care: {
    reminders: Reminder[];
    upcomingAppointments: Appointment[];
    serviceBookings: ServiceBooking[];
  };
  routine: {
    habits: PetHabit[];
    latestMetric?: BandDailyMetric;
  };
  technology: {
    wearable?: HealthBand;
    metrics: BandDailyMetric[];
    alerts: BandAlert[];
    locationPoints: PetLocationPoint[];
    latestLocation?: PetLocationPoint;
  };
  commerce: {
    orders: Order[];
    products: Product[];
  };
  knowledge: {
    memories: PetMemory[];
    documents: PetDocument[];
    outcomes: PetInsightOutcome[];
  };
  events: PetLifeEvent[];
}

export interface PetAssistantResponse {
  text: string;
  sources: PetSourceReference[];
}

const dayMilliseconds = 24 * 60 * 60 * 1000;

function dateAtMidday(value: string) {
  return new Date(value.includes("T") ? value : `${value}T12:00:00`);
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function daysUntil(value: string, now: Date) {
  const target = dateAtMidday(value).getTime();
  const today = dateAtMidday(isoDate(now)).getTime();
  return Math.round((target - today) / dayMilliseconds);
}

function sortNewest<T extends { date?: string; timestamp?: string; createdAt?: string; recordedAt?: string; importedAt?: string; startDate?: string; administered?: string }>(values: T[]) {
  return [...values].sort((left, right) => {
    const leftDate = left.date ?? left.timestamp ?? left.createdAt ?? left.recordedAt ?? left.importedAt ?? left.startDate ?? left.administered ?? "";
    const rightDate = right.date ?? right.timestamp ?? right.createdAt ?? right.recordedAt ?? right.importedAt ?? right.startDate ?? right.administered ?? "";
    return rightDate.localeCompare(leftDate);
  });
}

function sortAscending<T extends { date?: string; timestamp?: string; startDate?: string; administered?: string }>(values: T[]) {
  return [...values].sort((left, right) => {
    const leftDate = left.date ?? left.timestamp ?? left.startDate ?? left.administered ?? "";
    const rightDate = right.date ?? right.timestamp ?? right.startDate ?? right.administered ?? "";
    return leftDate.localeCompare(rightDate);
  });
}

function recordSource(record: HealthRecord): PetSourceReference {
  return { id: `record:${record.id}`, label: "Medical history", href: "/health", sourceType: "record" };
}

function vaccinationSource(vaccination: Vaccination): PetSourceReference {
  return { id: `vaccination:${vaccination.id}`, label: "Vaccination record", href: "/health", sourceType: "vaccination" };
}

function medicationSource(medication: Medication): PetSourceReference {
  return { id: `medication:${medication.id}`, label: "Medication history", href: "/health", sourceType: "medication" };
}

function weightSource(weight: WeightRecord): PetSourceReference {
  return { id: `weight:${weight.id}`, label: "Weight records", href: "/health", sourceType: "weight" };
}

function reminderSource(reminder: Reminder): PetSourceReference {
  return { id: `reminder:${reminder.id}`, label: "Care calendar", href: "/calendar", sourceType: "reminder" };
}

function appointmentSource(appointment: Appointment): PetSourceReference {
  return { id: `appointment:${appointment.id}`, label: "Appointment", href: "/appointments", sourceType: "appointment" };
}

function wearableSource(petId: string): PetSourceReference {
  return { id: `wearable:${petId}`, label: "Health Band", href: `/health-band?pet=${encodeURIComponent(petId)}`, sourceType: "wearable" };
}

function locationSource(petId: string): PetSourceReference {
  return { id: `location:${petId}`, label: "GPS route", href: `/health-band?pet=${encodeURIComponent(petId)}`, sourceType: "location" };
}

function serviceSource(booking: ServiceBooking): PetSourceReference {
  return { id: `service:${booking.id}`, label: "Service booking", href: "/services", sourceType: "service" };
}

function orderSource(order: Order): PetSourceReference {
  return { id: `order:${order.id}`, label: "Purchase history", href: "/orders", sourceType: "order" };
}

function documentSource(document: PetDocument): PetSourceReference {
  return { id: `document:${document.id}`, label: "Document review", href: "/documents", sourceType: "document" };
}

function memorySource(memory: PetMemory): PetSourceReference {
  return { id: `memory:${memory.id}`, label: "Pet memory", href: `/insights?pet=${encodeURIComponent(memory.petId)}`, sourceType: "memory" };
}

function outcomeSource(outcome: PetInsightOutcome): PetSourceReference {
  return { id: `outcome:${outcome.id}`, label: "Action outcome", href: `/insights?pet=${encodeURIComponent(outcome.petId)}`, sourceType: "outcome" };
}

function uniqueSources(sources: PetSourceReference[]) {
  return Array.from(new Map(sources.map((source) => [source.id, source])).values());
}

function priorityRank(priority: PetInsight["importance"] | PetNextAction["priority"]) {
  return priority === "HIGH" ? 0 : priority === "MEDIUM" ? 1 : 2;
}

function formatRelativeDays(days: number) {
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days === -1) return "yesterday";
  return days > 0 ? `in ${days} days` : `${Math.abs(days)} days ago`;
}

/**
 * Builds one permission-scoped, normalized pet view from existing authoritative
 * records. It does not create a parallel pet profile or duplicate health data.
 */
export function buildPetContext(input: PetContextInput): PetContext {
  const { pet } = input;
  const now = input.now ?? new Date();
  const records = sortNewest(input.records.filter((item) => item.petId === pet.id));
  const vaccinations = sortNewest(input.vaccinations.filter((item) => item.petId === pet.id));
  const medications = sortNewest(input.medications.filter((item) => item.petId === pet.id));
  const weights = sortAscending(input.weights.filter((item) => item.petId === pet.id));
  const reminders = [...input.reminders.filter((item) => item.petId === pet.id)].sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const upcomingAppointments = input.appointments
    .filter((item) => item.petId === pet.id && (item.status === "PENDING" || item.status === "CONFIRMED"))
    .sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const serviceBookings = [...input.bookings.filter((item) => item.petId === pet.id)].sort((left, right) => `${right.date}${right.time}`.localeCompare(`${left.date}${left.time}`));
  const metrics = sortAscending(input.bandMetrics.filter((item) => item.petId === pet.id));
  const habits = sortNewest(input.habits.filter((item) => item.petId === pet.id));
  const alerts = sortNewest(input.bandAlerts.filter((item) => item.petId === pet.id && item.status === "OPEN"));
  const locationPoints = [...input.locationPoints.filter((item) => item.petId === pet.id)].sort((left, right) => left.timestamp.localeCompare(right.timestamp));
  const orders = sortNewest(input.orders.filter((item) => item.petId === pet.id));
  const wearable = input.bands.find((item) => item.petId === pet.id);
  const activeMedication = medications.filter((item) => !item.endDate || item.endDate >= isoDate(now));
  const memories = sortNewest((input.memories ?? []).filter((item) => item.petId === pet.id));
  const documents = sortNewest((input.documents ?? []).filter((item) => item.petId === pet.id).map((item) => ({ ...item, createdAt: item.importedAt })));
  const outcomes = sortNewest((input.insightOutcomes ?? []).filter((item) => item.petId === pet.id).map((item) => ({ ...item, createdAt: item.recordedAt })));

  const context: PetContext = {
    pet,
    generatedAt: now.toISOString(),
    identity: {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      birthDate: pet.birthDate,
      gender: pet.gender,
      image: pet.image,
      allergies: pet.allergies,
      conditions: pet.conditions,
      preferences: pet.dietaryPreferences,
      microchipId: pet.microchipId,
    },
    health: { records, vaccinations, medications, weights, latestWeight: weights.at(-1), latestVetVisit: records.find((record) => record.type === "Consultation") ?? records[0], activeMedication },
    care: { reminders, upcomingAppointments, serviceBookings },
    routine: { habits, latestMetric: metrics.at(-1) },
    technology: { wearable, metrics, alerts, locationPoints, latestLocation: locationPoints.at(-1) },
    commerce: { orders, products: input.products ?? [] },
    knowledge: { memories, documents, outcomes },
    events: [],
  };
  context.events = buildPetLifeEvents(context, input.providers, input.vets);
  return context;
}

/** The common event projection that lets every feature appear on one life timeline. */
export function buildPetLifeEvents(context: PetContext, providers: ServiceProvider[] = [], vets: Vet[] = []): PetLifeEvent[] {
  const events: PetLifeEvent[] = [
    ...context.health.records.map((record) => ({
      id: `record:${record.id}`, petId: context.pet.id, occurredAt: record.date, category: "HEALTH" as const, eventType: "MEDICAL_RECORD_RECORDED",
      title: record.reason, description: record.type === "Consultation" ? "Veterinary consultation recorded" : `${record.type} recorded`, source: "VETERINARIAN" as const, href: "/health", sourceReference: recordSource(record),
    })),
    ...context.health.vaccinations.map((vaccination) => ({
      id: `vaccination:${vaccination.id}`, petId: context.pet.id, occurredAt: vaccination.administered, category: "HEALTH" as const, eventType: "VACCINATION_RECORDED",
      title: `${vaccination.name} vaccination recorded`, description: vaccination.nextDue ? `Next due ${vaccination.nextDue}` : undefined, source: "VETERINARIAN" as const, href: "/health", sourceReference: vaccinationSource(vaccination),
    })),
    ...context.health.medications.map((medication) => ({
      id: `medication:${medication.id}`, petId: context.pet.id, occurredAt: medication.startDate, category: "HEALTH" as const, eventType: "MEDICATION_RECORDED",
      title: `${medication.name} medication recorded`, description: medication.frequency, source: "VETERINARIAN" as const, href: "/health", sourceReference: medicationSource(medication),
    })),
    ...context.health.weights.map((weight) => ({
      id: `weight:${weight.id}`, petId: context.pet.id, occurredAt: weight.date, category: "HEALTH" as const, eventType: "WEIGHT_RECORDED",
      title: "Weight recorded", description: `${weight.weight} kg`, source: "OWNER" as const, href: "/health", sourceReference: weightSource(weight),
    })),
    ...context.care.reminders.map((reminder) => ({
      id: `reminder:${reminder.id}`, petId: context.pet.id, occurredAt: reminder.date, category: "PLANNING" as const, eventType: reminder.status === "DONE" ? "REMINDER_COMPLETED" : "REMINDER_SCHEDULED",
      title: reminder.title, description: reminder.status === "DONE" ? "Care task completed" : reminder.description, source: "SYSTEM" as const, href: "/calendar", sourceReference: reminderSource(reminder),
    })),
    ...context.care.upcomingAppointments.map((appointment) => {
      const veterinarian = vets.find((vet) => vet.id === appointment.vetId);
      return {
        id: `appointment:${appointment.id}`, petId: context.pet.id, occurredAt: appointment.date, category: "PLANNING" as const, eventType: "VET_APPOINTMENT_SCHEDULED",
        title: appointment.reason, description: `${appointment.status === "CONFIRMED" ? "Confirmed" : "Pending"} appointment${veterinarian ? ` with ${veterinarian.name}` : ""}`, source: "OWNER" as const, href: "/appointments", sourceReference: appointmentSource(appointment),
      };
    }),
    ...context.care.serviceBookings.map((booking) => {
      const provider = providers.find((item) => item.id === booking.providerId);
      return {
        id: `service:${booking.id}`, petId: context.pet.id, occurredAt: booking.date, category: "CARE" as const, eventType: booking.status === "COMPLETED" ? "SERVICE_COMPLETED" : "SERVICE_BOOKED",
        title: `${provider?.category ?? "Pet service"} ${booking.status === "COMPLETED" ? "completed" : "booked"}`, description: provider?.businessName, source: "SERVICE_PROVIDER" as const, href: "/services", sourceReference: serviceSource(booking),
      };
    }),
    ...context.routine.habits.slice(0, 12).map((habit) => ({
      id: `habit:${habit.id}`, petId: context.pet.id, occurredAt: habit.timestamp, category: "ACTIVITY" as const, eventType: `${habit.kind}_RECORDED`,
      title: habit.label, description: habit.durationMinutes ? `${habit.durationMinutes} minutes` : "Routine recorded", source: habit.source === "BAND" ? "WEARABLE" as const : "OWNER" as const, href: `/health-band?pet=${encodeURIComponent(context.pet.id)}`, sourceReference: wearableSource(context.pet.id),
    })),
    ...context.technology.metrics.slice(-7).map((metric) => ({
      id: `metric:${metric.id}`, petId: context.pet.id, occurredAt: metric.date, category: "ACTIVITY" as const, eventType: "WEARABLE_SUMMARY_RECORDED",
      title: "Wearable day summary", description: `${metric.activeMinutes} active min · ${metric.steps.toLocaleString("en-IN")} steps`, source: "WEARABLE" as const, href: `/health-band?pet=${encodeURIComponent(context.pet.id)}`, sourceReference: wearableSource(context.pet.id),
    })),
    ...context.commerce.orders.map((order) => ({
      id: `order:${order.id}`, petId: context.pet.id, occurredAt: order.date, category: "COMMERCE" as const, eventType: "PRODUCT_PURCHASED",
      title: `Order ${order.number}`, description: `${order.items.length} item${order.items.length === 1 ? "" : "s"} linked to ${context.pet.name}`, source: "OWNER" as const, href: "/orders", sourceReference: orderSource(order),
    })),
    ...context.knowledge.documents.map((document) => ({
      id: `document:${document.id}`, petId: context.pet.id, occurredAt: document.importedAt, category: "DOCUMENT" as const, eventType: document.status === "VERIFIED" ? "DOCUMENT_VERIFIED" : "DOCUMENT_UPLOADED",
      title: document.status === "VERIFIED" ? `${document.fileName} verified` : `${document.fileName} awaiting review`, description: `${document.category.replaceAll("_", " ").toLowerCase()} · ${document.extractedFields.length} extracted field${document.extractedFields.length === 1 ? "" : "s"}`, source: document.source === "VETERINARIAN" ? "VETERINARIAN" as const : "OWNER" as const, href: "/documents", sourceReference: documentSource(document),
    })),
    ...context.knowledge.memories.filter((memory) => memory.status !== "SUPERSEDED").map((memory) => ({
      id: `memory:${memory.id}`, petId: context.pet.id, occurredAt: memory.recordedAt, category: "LIFE" as const, eventType: "PET_MEMORY_RECORDED",
      title: memory.label, description: memory.kind === "AI_HYPOTHESIS" ? "AI hypothesis recorded separately from medical facts" : memory.value, source: memory.source === "VETERINARIAN" ? "VETERINARIAN" as const : memory.source === "WEARABLE" ? "WEARABLE" as const : memory.source === "AI" ? "AI" as const : "OWNER" as const, href: `/insights?pet=${encodeURIComponent(context.pet.id)}`, sourceReference: memorySource(memory),
    })),
    ...context.knowledge.outcomes.map((outcome) => ({
      id: `outcome:${outcome.id}`, petId: context.pet.id, occurredAt: outcome.recordedAt, category: "INTELLIGENCE" as const, eventType: "OUTCOME_RECORDED",
      title: `${outcome.actionLabel} — ${outcome.status.replaceAll("_", " ").toLowerCase()}`, description: outcome.note, source: "OWNER" as const, href: `/insights?pet=${encodeURIComponent(context.pet.id)}`, sourceReference: outcomeSource(outcome),
    })),
  ];

  if (context.technology.locationPoints.length) {
    const latest = context.technology.latestLocation!;
    events.push({
      id: `location:${context.pet.id}:${latest.timestamp}`, petId: context.pet.id, occurredAt: latest.timestamp, category: "LOCATION", eventType: "GPS_ROUTE_RECORDED",
      title: "GPS route updated", description: "A consented phone location session recorded a route point.", source: "OWNER", href: `/health-band?pet=${encodeURIComponent(context.pet.id)}`, sourceReference: locationSource(context.pet.id),
    });
  }

  return events.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
}

/** A care-management score, never a measurement of health or diagnosis. */
export function calculatePetCareReadiness(context: PetContext, now = new Date(context.generatedAt)): PetCareReadiness {
  let score = 0;
  const strengths: string[] = [];
  const needsAttention: string[] = [];
  const today = isoDate(now);
  const openReminders = context.care.reminders.filter((item) => item.status !== "DONE");
  const overdue = openReminders.filter((item) => item.date < today);
  const latestWeight = context.health.latestWeight;
  const weightAge = latestWeight ? Math.max(0, daysUntil(latestWeight.date, now) * -1) : undefined;

  if (context.health.vaccinations.length) { score += 20; strengths.push("Vaccination records are documented"); }
  else needsAttention.push("Add vaccination documentation");

  if (context.health.records.length) { score += 15; strengths.push("Health history has recorded entries"); }
  else needsAttention.push("Add a first health record");

  if (latestWeight && weightAge !== undefined && weightAge <= 120) { score += 15; strengths.push("A recent weight record is available"); }
  else if (latestWeight) { score += 6; needsAttention.push("Refresh the weight record when practical"); }
  else needsAttention.push("Add a weight record for care planning");

  if (!overdue.length) { score += 20; strengths.push("No overdue care tasks are recorded"); }
  else needsAttention.push(`${overdue.length} care task${overdue.length === 1 ? " is" : "s are"} overdue`);

  if (openReminders.length || context.care.upcomingAppointments.length) { score += 10; strengths.push("Upcoming care is planned"); }
  else needsAttention.push("Add the next planned care task");

  if (context.health.medications.length === 0 || context.health.medications.every((item) => Boolean(item.startDate && item.frequency))) { score += 10; strengths.push("Medication history is tracked"); }
  else needsAttention.push("Complete medication history details");

  if (context.identity.microchipId || context.identity.allergies.length || context.identity.conditions.length) { score += 10; strengths.push("Important passport details are recorded"); }
  else needsAttention.push("Add key passport details, if applicable");

  return {
    score: Math.max(0, Math.min(100, score)),
    strengths: strengths.slice(0, 4),
    needsAttention: needsAttention.slice(0, 4),
    explanation: "Care Readiness reflects how complete and current the recorded care plan is. It is not a health score or medical assessment.",
  };
}

export type PetFreshnessStatus = "CURRENT" | "AGING" | "ATTENTION" | "MISSING" | "NOT_CONNECTED";
export interface PetDataFreshness {
  id: string;
  label: string;
  status: PetFreshnessStatus;
  detail: string;
  lastUpdated?: string;
  source?: PetSourceReference;
}

function ageInDays(value: string, now: Date) {
  return Math.max(0, Math.floor((now.getTime() - dateAtMidday(value).getTime()) / dayMilliseconds));
}

/** Shows recency and verification quality; it never implies a clinical finding. */
export function getPetDataFreshness(context: PetContext, now = new Date(context.generatedAt)): PetDataFreshness[] {
  const latestVaccination = context.health.vaccinations[0];
  const latestRecord = context.health.records[0];
  const latestWeight = context.health.latestWeight;
  const latestDocument = context.knowledge.documents[0];
  const latestMetric = context.routine.latestMetric;
  const vaccineStatus: PetFreshnessStatus = !latestVaccination ? "MISSING" : latestVaccination.nextDue && daysUntil(latestVaccination.nextDue, now) <= 0 ? "ATTENTION" : ageInDays(latestVaccination.administered, now) > 365 ? "AGING" : "CURRENT";
  const recordAge = latestRecord ? ageInDays(latestRecord.date, now) : undefined;
  const weightAge = latestWeight ? ageInDays(latestWeight.date, now) : undefined;
  const documentStatus: PetFreshnessStatus = !latestDocument ? "MISSING" : latestDocument.status === "PENDING_REVIEW" ? "ATTENTION" : ageInDays(latestDocument.importedAt, now) > 365 ? "AGING" : "CURRENT";

  return [
    { id: "vaccinations", label: "Vaccination record", status: vaccineStatus, detail: !latestVaccination ? "No vaccination document or record is saved." : latestVaccination.nextDue ? `Last recorded ${latestVaccination.administered}; next due ${latestVaccination.nextDue}.` : `Last recorded ${latestVaccination.administered}.`, lastUpdated: latestVaccination?.administered, source: latestVaccination ? vaccinationSource(latestVaccination) : undefined },
    { id: "weight", label: "Weight", status: !latestWeight ? "MISSING" : weightAge! > 120 ? "ATTENTION" : weightAge! > 60 ? "AGING" : "CURRENT", detail: !latestWeight ? "Add a factual measurement for trend review." : `${latestWeight.weight} kg recorded ${weightAge} day${weightAge === 1 ? "" : "s"} ago.`, lastUpdated: latestWeight?.date, source: latestWeight ? weightSource(latestWeight) : undefined },
    { id: "health-history", label: "Health history", status: !latestRecord ? "MISSING" : recordAge! > 365 ? "AGING" : "CURRENT", detail: !latestRecord ? "No medical record is saved yet." : `${latestRecord.reason} was recorded ${recordAge} day${recordAge === 1 ? "" : "s"} ago.`, lastUpdated: latestRecord?.date, source: latestRecord ? recordSource(latestRecord) : undefined },
    { id: "documents", label: "Documents", status: documentStatus, detail: !latestDocument ? "No document metadata is saved." : latestDocument.status === "PENDING_REVIEW" ? `${latestDocument.fileName} needs a human review.` : `${latestDocument.fileName} is marked verified.`, lastUpdated: latestDocument?.importedAt, source: latestDocument ? documentSource(latestDocument) : undefined },
    { id: "wearable", label: "Wearable context", status: !context.technology.wearable ? "NOT_CONNECTED" : !latestMetric ? "ATTENTION" : ageInDays(latestMetric.date, now) > 7 ? "AGING" : "CURRENT", detail: !context.technology.wearable ? "No Health Band is connected." : !latestMetric ? "The device has no daily summary yet." : `Latest daily summary is from ${latestMetric.date}.`, lastUpdated: latestMetric?.date, source: context.technology.wearable ? wearableSource(context.pet.id) : undefined },
    { id: "emergency-profile", label: "Emergency profile", status: context.identity.microchipId || context.identity.allergies.length || context.identity.conditions.length ? "CURRENT" : "MISSING", detail: context.identity.microchipId || context.identity.allergies.length || context.identity.conditions.length ? "Identity or important health facts are available for a handoff." : "Add microchip, allergy or condition details if applicable.", source: { id: `pet:${context.pet.id}`, label: "Pet profile", href: `/pets/${encodeURIComponent(context.pet.id)}`, sourceType: "pet" } },
  ];
}

export interface PetOutcomeSummary {
  total: number;
  completed: number;
  followUpNeeded: number;
  notRelevant: number;
  completionRate?: number;
}

export function summarizeInsightOutcomes(context: PetContext): PetOutcomeSummary {
  const outcomes = context.knowledge.outcomes;
  const completed = outcomes.filter((outcome) => outcome.status === "COMPLETED").length;
  return {
    total: outcomes.length,
    completed,
    followUpNeeded: outcomes.filter((outcome) => outcome.status === "FOLLOW_UP_NEEDED").length,
    notRelevant: outcomes.filter((outcome) => outcome.status === "NOT_RELEVANT").length,
    completionRate: outcomes.length ? Math.round((completed / outcomes.length) * 100) : undefined,
  };
}

export interface PetWeeklyBrief {
  petId: string;
  generatedAt: string;
  title: string;
  activity: string;
  care: string;
  upcoming: string;
  needsAttention: string[];
  sources: PetSourceReference[];
}

/** A calm retention summary based only on recorded facts and active insights. */
export function buildPetWeeklyBrief(context: PetContext, insights = generatePetInsights(context)): PetWeeklyBrief {
  const metrics = context.technology.metrics;
  const recentMetrics = metrics.slice(-7);
  const priorMetrics = metrics.slice(-14, -7);
  const recentAverage = recentMetrics.length ? recentMetrics.reduce((sum, item) => sum + item.activeMinutes, 0) / recentMetrics.length : undefined;
  const priorAverage = priorMetrics.length ? priorMetrics.reduce((sum, item) => sum + item.activeMinutes, 0) / priorMetrics.length : undefined;
  const activity = recentAverage === undefined ? "No wearable activity summary is recorded yet." : priorAverage === undefined || priorAverage === 0 ? `Latest recorded activity average: ${Math.round(recentAverage)} minutes per day.` : `Latest recorded activity average is ${Math.round(Math.abs(((recentAverage - priorAverage) / priorAverage) * 100))}% ${recentAverage >= priorAverage ? "above" : "below"} the prior recorded period.`;
  const openCare = context.care.reminders.filter((reminder) => reminder.status !== "DONE");
  const outcome = summarizeInsightOutcomes(context);
  const upcomingAppointment = context.care.upcomingAppointments[0];
  const upcomingReminder = context.care.reminders.find((reminder) => reminder.status !== "DONE");
  return {
    petId: context.pet.id,
    generatedAt: context.generatedAt,
    title: `${context.pet.name} this week`,
    activity,
    care: `${openCare.length} open care task${openCare.length === 1 ? "" : "s"}; ${outcome.completed} recorded action outcome${outcome.completed === 1 ? "" : "s"}.`,
    upcoming: upcomingAppointment ? `${upcomingAppointment.reason} is scheduled for ${upcomingAppointment.date}.` : upcomingReminder ? `${upcomingReminder.title} is scheduled for ${upcomingReminder.date}.` : "No upcoming appointment or open care task is recorded.",
    needsAttention: insights.slice(0, 3).map((insight) => insight.title),
    sources: uniqueSources([...(recentMetrics.length ? [wearableSource(context.pet.id)] : []), ...insights.slice(0, 3).flatMap((insight) => insight.sources)]),
  };
}

export interface PetVisitBrief {
  petId: string;
  petName: string;
  preparedAt: string;
  reason: string;
  recentChanges: string[];
  relevantHistory: string[];
  currentMedication: string[];
  ownerObservations: string[];
  questions: string[];
  sources: PetSourceReference[];
  disclaimer: string;
}

/** Builds a factual pre-visit summary; it does not infer diagnosis or treatment. */
export function buildPetVisitBrief(context: PetContext, reason?: string): PetVisitBrief {
  const insights = generatePetInsights(context).filter((insight) => insight.importance !== "LOW").slice(0, 3);
  const latestRecords = context.health.records.slice(0, 3);
  const ownerObservations = context.knowledge.memories.filter((memory) => memory.source === "OWNER" && memory.status !== "SUPERSEDED").slice(0, 3);
  const appointment = context.care.upcomingAppointments[0];
  return {
    petId: context.pet.id,
    petName: context.pet.name,
    preparedAt: context.generatedAt,
    reason: reason ?? appointment?.reason ?? "Care review",
    recentChanges: insights.length ? insights.map((insight) => insight.summary) : ["No material record-based change is currently flagged."],
    relevantHistory: latestRecords.length ? latestRecords.map((record) => `${record.date}: ${record.reason}${record.followUp ? ` (follow-up ${record.followUp})` : ""}`) : ["No clinical record is saved yet."],
    currentMedication: context.health.activeMedication.length ? context.health.activeMedication.map((medication) => `${medication.name} — ${medication.dosage || "dose not recorded"}, ${medication.frequency || "schedule not recorded"}`) : ["No active medication is recorded."],
    ownerObservations: ownerObservations.length ? ownerObservations.map((memory) => `${memory.label}: ${memory.value}`) : ["No owner observation is recorded for this brief."],
    questions: ["What changes should the owner monitor?", "Is follow-up needed, and when?", "Which passport record should be updated after this visit?"],
    sources: uniqueSources([...(appointment ? [appointmentSource(appointment)] : []), ...latestRecords.map(recordSource), ...insights.flatMap((insight) => insight.sources), ...ownerObservations.map(memorySource)]),
    disclaimer: "This brief summarizes authorized recorded information. A veterinarian remains responsible for clinical assessment, diagnosis and treatment decisions.",
  };
}

/** Deterministic, source-linked observations. They intentionally avoid diagnosis and prescription. */
export function generatePetInsights(context: PetContext, now = new Date(context.generatedAt)): PetInsight[] {
  const insights: PetInsightDraft[] = [];
  const createdAt = now.toISOString();
  const today = isoDate(now);
  const vaccinationDue = context.health.vaccinations
    .filter((vaccination) => Boolean(vaccination.nextDue))
    .sort((left, right) => left.nextDue.localeCompare(right.nextDue))[0];

  if (vaccinationDue) {
    const remaining = daysUntil(vaccinationDue.nextDue, now);
    if (remaining <= 30) {
      insights.push({
        id: `vaccination-due:${vaccinationDue.id}`, petId: context.pet.id, type: "VACCINATION_DUE",
        title: remaining < 0 ? `${vaccinationDue.name} is overdue` : `${vaccinationDue.name} is due ${formatRelativeDays(remaining)}`,
        summary: `${context.pet.name}'s recorded ${vaccinationDue.name} next-due date is ${vaccinationDue.nextDue}.`,
        why: "This is based on the next-due date in the vaccination record.", importance: remaining <= 7 ? "HIGH" : "MEDIUM", confidence: "HIGH",
        action: { id: `book-vet:${vaccinationDue.id}`, label: "Book a veterinarian", href: "/veterinarians", description: "Arrange the recorded vaccine follow-up.", priority: remaining <= 7 ? "HIGH" : "MEDIUM" },
        sources: [vaccinationSource(vaccinationDue)], createdAt,
      });
    }
  }

  const overdue = context.care.reminders.filter((reminder) => reminder.status !== "DONE" && reminder.date < today).sort((left, right) => left.date.localeCompare(right.date));
  if (overdue.length) {
    const first = overdue[0];
    insights.push({
      id: `care-overdue:${first.id}`, petId: context.pet.id, type: "CARE_OVERDUE", title: `${first.title} needs attention`,
      summary: `${context.pet.name}'s care task was scheduled for ${first.date} and is still open.`, why: "This comes from an open task in the shared care calendar.", importance: "HIGH", confidence: "HIGH",
      action: { id: `open-care:${first.id}`, label: "Review care task", href: "/reminders", description: "Complete, reschedule, or update this care task.", priority: "HIGH" },
      sources: [reminderSource(first)], createdAt,
    });
  }

  const upcomingAppointment = context.care.upcomingAppointments[0];
  if (upcomingAppointment) {
    const remaining = daysUntil(upcomingAppointment.date, now);
    if (remaining <= 7 && remaining >= -1) {
      insights.push({
        id: `appointment:${upcomingAppointment.id}`, petId: context.pet.id, type: "UPCOMING_APPOINTMENT", title: `${context.pet.name} has a vet visit ${formatRelativeDays(remaining)}`,
        summary: `The recorded visit is for ${upcomingAppointment.reason} at ${upcomingAppointment.time}.`, why: "This is based on the upcoming appointment in the shared care plan.", importance: "HIGH", confidence: "HIGH",
        action: { id: `prepare-vet:${upcomingAppointment.id}`, label: "Prepare vet questions", href: `/ai-assistant?pet=${encodeURIComponent(context.pet.id)}`, description: "Use the record-based assistant to prepare for the visit.", priority: "HIGH" },
        sources: [appointmentSource(upcomingAppointment)], createdAt,
      });
    }
  }

  const followUpRecord = context.health.records
    .filter((record) => record.followUp && record.followUp >= today)
    .sort((left, right) => (left.followUp ?? "").localeCompare(right.followUp ?? ""))[0];
  if (followUpRecord?.followUp && daysUntil(followUpRecord.followUp, now) <= 30) {
    insights.push({
      id: `follow-up:${followUpRecord.id}`, petId: context.pet.id, type: "FOLLOW_UP", title: "A recorded follow-up is approaching",
      summary: `${context.pet.name}'s ${followUpRecord.reason.toLowerCase()} record lists a follow-up date of ${followUpRecord.followUp}.`, why: "This is the follow-up date stored on the medical record, not a new clinical recommendation.", importance: "MEDIUM", confidence: "HIGH",
      action: { id: `follow-up-vet:${followUpRecord.id}`, label: "Review vet follow-up", href: "/appointments", description: "Check or arrange the recorded follow-up.", priority: "MEDIUM" },
      sources: [recordSource(followUpRecord)], createdAt,
    });
  }

  const weights = context.health.weights;
  if (weights.length >= 3) {
    const start = weights[0];
    const latest = weights.at(-1)!;
    const difference = latest.weight - start.weight;
    if (Math.abs(difference) >= 0.25) {
      insights.push({
        id: `weight-trend:${context.pet.id}:${latest.id}`, petId: context.pet.id, type: "WEIGHT_TREND", title: `Weight has ${difference > 0 ? "increased" : "decreased"} across recorded entries`,
        summary: `${context.pet.name}'s recorded weight moved from ${start.weight} kg to ${latest.weight} kg across ${weights.length} entries.`, why: "This compares the first and latest available weight records; it does not explain the change.", importance: "MEDIUM", confidence: "HIGH",
        action: { id: `view-weight:${latest.id}`, label: "View weight trend", href: `/pets/${encodeURIComponent(context.pet.id)}`, description: "Review the recorded weight history and add context for the veterinarian if needed.", priority: "MEDIUM" },
        sources: uniqueSources([weightSource(start), weightSource(latest)]), createdAt,
      });
    }
  } else if (!weights.length || (context.health.latestWeight && daysUntil(context.health.latestWeight.date, now) < -120)) {
    insights.push({
      id: `weight-gap:${context.pet.id}`, petId: context.pet.id, type: "WEIGHT_GAP", title: "A weight record would strengthen the care plan",
      summary: context.health.latestWeight ? `${context.pet.name}'s latest recorded weight is from ${context.health.latestWeight.date}.` : `No weight record is stored for ${context.pet.name}.`, why: "Care Readiness uses current records to make the care plan easier to review.", importance: "LOW", confidence: "HIGH",
      action: { id: `add-weight:${context.pet.id}`, label: "Add weight", href: "/health", description: "Record a factual weight measurement.", priority: "LOW" },
      sources: context.health.latestWeight ? [weightSource(context.health.latestWeight)] : [{ id: `pet:${context.pet.id}`, label: "Pet profile", href: `/pets/${encodeURIComponent(context.pet.id)}`, sourceType: "pet" }], createdAt,
    });
  }

  const wearableAlert = context.technology.alerts[0];
  if (wearableAlert) {
    insights.push({
      id: `wearable:${wearableAlert.id}`, petId: context.pet.id, type: "WEARABLE_PATTERN", title: wearableAlert.title,
      summary: wearableAlert.description, why: "This is a non-diagnostic observation generated from the recorded Health Band data.", importance: wearableAlert.priority === "ATTENTION" ? "MEDIUM" : "LOW", confidence: "MEDIUM",
      action: { id: `review-band:${wearableAlert.id}`, label: "Review Health Band", href: `/health-band?pet=${encodeURIComponent(context.pet.id)}`, description: "Check the underlying wearable trend and context.", priority: wearableAlert.priority === "ATTENTION" ? "MEDIUM" : "LOW" },
      sources: [wearableSource(context.pet.id)], createdAt,
    });
  }

  const servicePending = context.care.serviceBookings.find((booking) => booking.status === "PENDING");
  if (servicePending) {
    insights.push({
      id: `service:${servicePending.id}`, petId: context.pet.id, type: "SERVICE_BOOKING", title: "A service booking is awaiting confirmation",
      summary: `A pet service is scheduled for ${servicePending.date} at ${servicePending.time}.`, why: "This is based on the shared service booking status.", importance: "LOW", confidence: "HIGH",
      action: { id: `view-service:${servicePending.id}`, label: "View service booking", href: "/services", description: "Review the booking and provider details.", priority: "LOW" },
      sources: [serviceSource(servicePending)], createdAt,
    });
  }

  const pendingDocument = context.knowledge.documents.find((document) => document.status === "PENDING_REVIEW");
  if (pendingDocument) {
    insights.push({
      id: `document-review:${pendingDocument.id}`, petId: context.pet.id, type: "DOCUMENT_REVIEW", title: "A document is waiting for owner review",
      summary: `${pendingDocument.fileName} has ${pendingDocument.extractedFields.length} suggested field${pendingDocument.extractedFields.length === 1 ? "" : "s"} that should be checked before they inform care records.`, why: "Imported file information is intentionally held for review rather than silently changing the passport.", importance: "MEDIUM", confidence: "MEDIUM",
      action: { id: `review-document:${pendingDocument.id}`, label: "Review document", href: "/documents", description: "Confirm or correct the extracted metadata before using it.", priority: "MEDIUM" },
      sources: [documentSource(pendingDocument)], createdAt,
    });
  }

  return insights
    .map((insight): PetInsight => ({
      ...insight,
      evidence: [insight.summary, insight.why],
      timeSensitivity: insight.importance === "HIGH" ? "TODAY" : insight.importance === "MEDIUM" ? "THIS_WEEK" : "WHEN_PRACTICAL",
      status: "ACTIVE",
    }))
    .sort((left, right) => priorityRank(left.importance) - priorityRank(right.importance) || left.title.localeCompare(right.title));
}

export function buildCarePlan(context: PetContext, insights = generatePetInsights(context)): PetCareTask[] {
  const reminderTasks: PetCareTask[] = context.care.reminders.map((reminder) => ({
    id: `reminder:${reminder.id}`, petId: context.pet.id, title: reminder.title, dueDate: reminder.date,
    status: reminder.status === "DONE" ? "COMPLETED" : reminder.date < isoDate(new Date(context.generatedAt)) ? "OVERDUE" : "UPCOMING",
    source: reminder.type, reason: reminder.description, action: { id: `open-reminder:${reminder.id}`, label: "Open care task", href: "/reminders", description: "Review this care task.", priority: reminder.status === "OVERDUE" ? "HIGH" : "MEDIUM" },
  }));
  const insightTasks: PetCareTask[] = insights
    .filter((insight) => !reminderTasks.some((task) => task.action.href === insight.action.href && task.title === insight.title))
    .map((insight): PetCareTask => ({
      id: `insight:${insight.id}`,
      petId: context.pet.id,
      title: insight.title,
      dueDate: undefined,
      status: insight.importance === "HIGH" ? "OVERDUE" : "UPCOMING",
      source: "Pet Intelligence",
      reason: insight.summary,
      action: insight.action,
    }));
  return [...reminderTasks, ...insightTasks].sort((left, right) => priorityRank(left.action.priority) - priorityRank(right.action.priority) || (left.dueDate ?? "9999").localeCompare(right.dueDate ?? "9999"));
}

export function getNextBestActions(insights: PetInsight[], limit = 4): PetNextAction[] {
  const byHref = new Map<string, PetNextAction>();
  for (const insight of insights) {
    const previous = byHref.get(insight.action.href);
    if (!previous || priorityRank(insight.action.priority) < priorityRank(previous.priority)) byHref.set(insight.action.href, insight.action);
  }
  return [...byHref.values()].sort((left, right) => priorityRank(left.priority) - priorityRank(right.priority)).slice(0, limit);
}

/** Explanation-first, allergy-aware product ranking for non-prescription products. */
export function getPetProductRecommendations(context: PetContext, products: Product[], limit = 3) {
  const allergies = context.identity.allergies.map((item) => item.toLowerCase());
  const preferences = context.identity.preferences.map((item) => item.toLowerCase());
  const purchases = new Set(context.commerce.orders.flatMap((order) => order.items.map((item) => item.productId)));
  return products
    .map((product) => {
      if (!product.species.includes(context.pet.species)) return undefined;
      const searchable = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
      if (allergies.some((allergy) => allergy && searchable.includes(allergy) && !searchable.includes(`${allergy}-free`) && !searchable.includes(`no ${allergy}`))) return undefined;
      let score = product.rating + (product.reason ? 1 : 0);
      const reasons = [`Suitable for ${context.pet.name}'s ${context.pet.species.toLowerCase()} profile`];
      const matchedPreference = preferences.find((preference) => product.tags.some((tag) => tag.toLowerCase().includes(preference)));
      if (matchedPreference) { score += 4; reasons.push(`matches the ${matchedPreference} preference`); }
      if (context.pet.activityLevel === "High" && product.tags.some((tag) => /active|activity|outdoor/i.test(tag))) { score += 2; reasons.push("fits the recorded activity level"); }
      if (purchases.has(product.id)) { score += 2; reasons.push("was purchased for this pet before"); }
      return { product, score, reason: reasons.join(" · ") };
    })
    .filter((item): item is { product: Product; score: number; reason: string } => Boolean(item))
    .sort((left, right) => right.score - left.score || right.product.rating - left.product.rating)
    .slice(0, limit);
}

/** Safe deterministic assistant layer for facts already present in the authorized context. */
export function buildPetAssistantResponse(question: string, context: PetContext, now = new Date(context.generatedAt)): PetAssistantResponse {
  const normalized = question.toLowerCase();
  const insights = generatePetInsights(context, now);
  const name = context.pet.name;
  const profileSource: PetSourceReference = { id: `pet:${context.pet.id}`, label: "Pet profile", href: `/pets/${encodeURIComponent(context.pet.id)}`, sourceType: "pet" };
  if (/collapse|seizure|poison|unable to urinate|repeated vomiting|trouble breathing|breath|emergency/.test(normalized)) {
    return {
      text: `I am sorry ${name} may be unwell. I cannot diagnose the cause. For severe, sudden, or worsening symptoms - especially breathing trouble, collapse, repeated vomiting, seizures, toxin exposure, or inability to urinate - contact a veterinarian or emergency veterinary service now. Open Emergency mode to keep ${name}'s allergy, medication and passport details ready to share.`,
      sources: [{ ...profileSource, label: "Emergency profile", href: `/emergency?pet=${encodeURIComponent(context.pet.id)}` }],
    };
  }
  if (/weekly|this week|week review/.test(normalized)) {
    const brief = buildPetWeeklyBrief(context, insights);
    return { text: `${brief.title}: ${brief.activity} ${brief.care} ${brief.upcoming} ${brief.needsAttention.length ? `Worth reviewing: ${brief.needsAttention.join("; ")}.` : ""} This is a summary of recorded information, not a clinical assessment.`, sources: brief.sources };
  }
  if (/document|certificate|prescription|file|report/.test(normalized)) {
    const documents = context.knowledge.documents;
    const pending = documents.filter((document) => document.status === "PENDING_REVIEW");
    return documents.length
      ? { text: `${name} has ${documents.length} document metadata entr${documents.length === 1 ? "y" : "ies"}; ${pending.length ? `${pending.length} await${pending.length === 1 ? "s" : ""} human review before informing care records.` : "the recorded metadata is marked verified."} The system does not interpret raw documents or make a diagnosis.`, sources: uniqueSources(documents.slice(0, 4).map(documentSource)) }
      : { text: `There is no document metadata recorded for ${name} yet. You can add a certificate, prescription, report, or photo to the review queue; review it before it influences care records.`, sources: [] };
  }
  if (/memory|preference|owner observation|routine note/.test(normalized)) {
    const memories = context.knowledge.memories.filter((memory) => memory.status !== "SUPERSEDED");
    return memories.length
      ? { text: `${name}'s saved context includes ${memories.slice(0, 3).map((memory) => `${memory.label}: ${memory.value}`).join(" ")} These are source-tagged context notes, not clinical findings.`, sources: uniqueSources(memories.slice(0, 3).map(memorySource)) }
      : { text: `There are no saved context notes for ${name} yet. You can add an owner observation or preference in Pet Insights, then verify it when appropriate.`, sources: [] };
  }
  if (/summary|summari[sz]e|last year|history/.test(normalized)) {
    const latest = context.health.latestVetVisit;
    const next = context.care.upcomingAppointments[0];
    const parts = [
      `${name}'s authorized record contains ${context.health.records.length} health entr${context.health.records.length === 1 ? "y" : "ies"}, ${context.health.vaccinations.length} vaccination record${context.health.vaccinations.length === 1 ? "" : "s"}, ${context.health.weights.length} weight entr${context.health.weights.length === 1 ? "y" : "ies"}, and ${context.knowledge.documents.length} document metadata entr${context.knowledge.documents.length === 1 ? "y" : "ies"}.`,
      latest ? `The latest recorded visit was ${latest.reason} on ${latest.date}.` : "No veterinary visit is recorded yet.",
      next ? `The next scheduled visit is ${next.reason} on ${next.date} at ${next.time}.` : "There is no upcoming veterinary appointment recorded.",
    ];
    return { text: `${parts.join(" ")} This is a record summary, not a clinical assessment.`, sources: uniqueSources([...(latest ? [recordSource(latest)] : []), ...(next ? [appointmentSource(next)] : []), ...(context.health.vaccinations[0] ? [vaccinationSource(context.health.vaccinations[0])] : [])]) };
  }
  if (/change|insight|recent|band|sleep|activity|habit|trend/.test(normalized)) {
    const selected = insights.slice(0, 3);
    return selected.length
      ? { text: selected.map((insight) => `${insight.title}: ${insight.summary}`).join(" "), sources: uniqueSources(selected.flatMap((insight) => insight.sources)) }
      : { text: `There are no material record-based changes flagged for ${name} right now. Add care records over time to make the timeline more useful.`, sources: [] };
  }
  if (/upcoming|care need|vaccin|remind|calendar/.test(normalized)) {
    const selected = insights.filter((insight) => ["VACCINATION_DUE", "CARE_OVERDUE", "UPCOMING_APPOINTMENT", "FOLLOW_UP"].includes(insight.type)).slice(0, 3);
    return selected.length
      ? { text: selected.map((insight) => `${insight.title}. ${insight.summary}`).join(" "), sources: uniqueSources(selected.flatMap((insight) => insight.sources)) }
      : { text: `${name} has no upcoming care item in the recorded calendar. You can add a reminder or book an appointment when needed.`, sources: [] };
  }
  if (/weight/.test(normalized)) {
    const weights = context.health.weights;
    const latest = weights.at(-1);
    if (!latest) return { text: `There is no recorded weight history for ${name} yet. Add a factual measurement in Health to begin a trend.`, sources: [] };
    const first = weights[0];
    const change = latest.weight - first.weight;
    return { text: `${name}'s latest recorded weight is ${latest.weight} kg on ${latest.date}.${weights.length > 1 ? ` Across ${weights.length} entries, the recorded change is ${change >= 0 ? "+" : ""}${change.toFixed(1)} kg.` : ""} This describes the records only; a veterinarian can interpret any change in context.`, sources: uniqueSources([weightSource(first), weightSource(latest)]) };
  }
  if (/food|eat|product|recommend/.test(normalized)) {
    const names = getPetProductRecommendations(context, context.commerce.products).map((item) => item.product.name);
    return names.length
      ? { text: `For ${name}, the profile-aware non-prescription options include ${names.join(", ")}. These are filtered using the saved species, allergies, preferences and prior purchases where available. Always verify ingredients, and ask a veterinarian before changing a diet for a medical reason.`, sources: [profileSource] }
      : { text: `I can help compare non-prescription products for ${name}, but I do not have a catalog match in this authorized context. Check ingredients against the saved allergies and ask a veterinarian before making a diet change for a medical reason.`, sources: [profileSource] };
  }
  if (/vet|appointment|prepare/.test(normalized)) {
    const brief = buildPetVisitBrief(context);
    return { text: `${name}'s visit brief is prepared for ${brief.reason}. Recent changes: ${brief.recentChanges.join(" ")} Relevant history: ${brief.relevantHistory.join(" ")} Owner observations: ${brief.ownerObservations.join(" ")} Questions to discuss: ${brief.questions.join(" ")} ${brief.disclaimer}`, sources: brief.sources };
  }
  const top = insights[0];
  return top
    ? { text: `${top.title}. ${top.summary} ${top.why} I can summarize ${name}'s recorded history, upcoming care, weight trend, or help prepare questions for a veterinarian.`, sources: top.sources }
    : { text: `I can summarize ${name}'s authorized records and help organize care questions. I do not diagnose, prescribe, or replace a veterinarian.`, sources: [] };
}
