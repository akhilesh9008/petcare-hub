import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import type {
  AIConversation,
  AIMessage,
  Appointment,
  AuthSession,
  Cart,
  HealthBandAlert,
  HealthBandDailyMetric,
  Id,
  MedicalRecord,
  Medication,
  Notification,
  Order,
  Pet,
  PetHabitEvent,
  PetServiceListing,
  PetWearableDevice,
  Product,
  PublicUser,
  Reminder,
  RepositoryState,
  ServiceBooking,
  ServiceProvider,
  User,
  UserRole,
  Vaccination,
  Veterinarian,
  WeightRecord,
} from "../types/petcare";

export const MOCK_STORAGE_KEY = "petcare-hub.mock-state.v1";
export const DEMO_OWNER_ID = "user-owner-akhilesh";
export const DEMO_PET_ID = "pet-bruno";
export const LOCAL_DATA_FILE = process.env.PETCARE_LOCAL_DATA_PATH
  ?? join(process.cwd(), "data", "petcare-hub.local.json");

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RepositoryOptions {
  storage?: StorageLike | null;
  storageKey?: string;
  initialState?: RepositoryState;
}

let idSequence = 0;

export function createId(prefix: string): Id {
  idSequence += 1;
  const runtimeCrypto = globalThis.crypto;
  if (runtimeCrypto && typeof runtimeCrypto.randomUUID === "function") {
    return prefix + "-" + runtimeCrypto.randomUUID();
  }

  return prefix + "-" + Date.now().toString(36) + "-" + idSequence.toString(36);
}

export function nowIso(): string {
  return new Date().toISOString();
}

function clone<Value>(value: Value): Value {
  const cloneFn = (globalThis as {
    structuredClone?: <CloneValue>(input: CloneValue) => CloneValue;
  }).structuredClone;

  if (typeof cloneFn === "function") {
    return cloneFn(value);
  }

  return JSON.parse(JSON.stringify(value)) as Value;
}

function demoTimestamp(): string {
  return "2026-08-24T10:00:00.000Z";
}

function demoUser(
  id: string,
  name: string,
  email: string,
  role: UserRole,
): User {
  const timestamp = demoTimestamp();
  return {
    id,
    name,
    email,
    role,
    phone: "+91 90000 00000",
    // `PetCare@123` in the isolated local-demo repository. Production data
    // is created by Prisma seed with bcrypt hashes; this is mock-mode only.
    passwordHash: "mock$demo-salt$dc5ea673",
    isActive: true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

/**
 * A realistic, deliberately small seed that is safe to serialize into
 * localStorage. Database seeding can use the same shape independently.
 */
export function createDemoState(): RepositoryState {
  const timestamp = demoTimestamp();
  const users: User[] = [
    demoUser(DEMO_OWNER_ID, "Akhilesh Sharma", "akhilesh@petcare.demo", "PET_OWNER"),
    demoUser("user-owner-meera", "Meera Iyer", "meera@petcare.demo", "PET_OWNER"),
    demoUser("user-vet-aarav", "Dr. Aarav Mehta", "aarav@petcare.demo", "VETERINARIAN"),
    demoUser("user-vet-kavya", "Dr. Kavya Nair", "kavya@petcare.demo", "VETERINARIAN"),
    demoUser(
      "user-provider-paws",
      "Rhea Kapoor",
      "paws@petcare.demo",
      "SERVICE_PROVIDER",
    ),
    demoUser("user-admin", "Platform Admin", "admin@petcare.demo", "ADMIN"),
  ];

  const pets: Pet[] = [
    {
      id: DEMO_PET_ID,
      ownerId: DEMO_OWNER_ID,
      name: "Bruno",
      species: "DOG",
      breed: "Labrador Retriever",
      dateOfBirth: "2021-05-10",
      gender: "MALE",
      weightKg: 28.4,
      color: "Golden",
      imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16",
      microchipId: "IN-PCH-48291",
      allergies: ["chicken"],
      medicalConditions: [],
      dietaryPreferences: ["grain-free"],
      activityLevel: "HIGH",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "pet-miso",
      ownerId: DEMO_OWNER_ID,
      name: "Miso",
      species: "CAT",
      breed: "Indian Shorthair",
      dateOfBirth: "2023-02-18",
      gender: "FEMALE",
      weightKg: 4.2,
      color: "Calico",
      allergies: [],
      medicalConditions: [],
      dietaryPreferences: ["wet food"],
      activityLevel: "MODERATE",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "pet-coco",
      ownerId: "user-owner-meera",
      name: "Coco",
      species: "DOG",
      breed: "Beagle",
      dateOfBirth: "2020-09-08",
      gender: "FEMALE",
      weightKg: 14.8,
      color: "Tri-colour",
      allergies: [],
      medicalConditions: ["Sensitive skin"],
      dietaryPreferences: [],
      activityLevel: "MODERATE",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const veterinarians: Veterinarian[] = [
    {
      id: "vet-aarav",
      userId: "user-vet-aarav",
      name: "Dr. Aarav Mehta",
      specialization: ["Small animal medicine", "Preventive care"],
      clinic: "Demo Paws Clinic",
      location: "Koregaon Park, Pune",
      rating: 4.8,
      reviewCount: 128,
      yearsOfExperience: 11,
      consultationFee: 700,
      bio: "A fictional demo veterinarian focused on practical preventive care.",
      qualifications: ["BVSc & AH", "MVSc (Small Animal Medicine)"],
      availableSlots: [
        { date: "2026-09-03", time: "10:00", available: true },
        { date: "2026-09-03", time: "11:30", available: true },
        { date: "2026-09-04", time: "16:00", available: true },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "vet-kavya",
      userId: "user-vet-kavya",
      name: "Dr. Kavya Nair",
      specialization: ["Dermatology", "Feline medicine"],
      clinic: "Demo Companion Care",
      location: "Indiranagar, Bengaluru",
      rating: 4.7,
      reviewCount: 96,
      yearsOfExperience: 9,
      consultationFee: 850,
      bio: "A fictional demo veterinarian with an interest in skin and feline care.",
      qualifications: ["BVSc & AH", "Certificate in Veterinary Dermatology"],
      availableSlots: [
        { date: "2026-09-05", time: "09:30", available: true },
        { date: "2026-09-05", time: "14:30", available: true },
      ],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const products: Product[] = [
    {
      id: "product-dog-adult-kibble",
      name: "Harvest Adult Dog Food",
      description: "A complete, non-prescription adult dog food for everyday feeding.",
      category: "FOOD",
      price: 1299,
      discountPercent: 10,
      brand: "Demo Harvest",
      stock: 30,
      rating: 4.6,
      reviewCount: 83,
      species: ["DOG"],
      suitableAge: "ADULT",
      tags: ["active", "everyday"],
      dietaryTags: ["grain-free"],
      allergenTags: [],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-chicken-dog-treats",
      name: "Chicken Training Treats",
      description: "Bite-sized chicken treats for training.",
      category: "TREATS",
      price: 349,
      discountPercent: 0,
      brand: "Demo Treat Co.",
      stock: 40,
      rating: 4.4,
      reviewCount: 60,
      species: ["DOG"],
      suitableAge: "ALL",
      tags: ["training"],
      dietaryTags: [],
      allergenTags: ["chicken"],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-dog-fetch-toy",
      name: "Durable Fetch Ball",
      description: "A washable fetch ball for supervised play.",
      category: "TOYS",
      price: 399,
      discountPercent: 5,
      brand: "Demo Play",
      stock: 52,
      rating: 4.5,
      reviewCount: 47,
      species: ["DOG"],
      suitableAge: "ALL",
      tags: ["active", "outdoor"],
      dietaryTags: [],
      allergenTags: [],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-cat-wet-food",
      name: "Ocean Cat Wet Food",
      description: "A non-prescription wet food formulated for adult cats.",
      category: "FOOD",
      price: 699,
      discountPercent: 0,
      brand: "Demo Ocean",
      stock: 28,
      rating: 4.7,
      reviewCount: 74,
      species: ["CAT"],
      suitableAge: "ADULT",
      tags: ["everyday"],
      dietaryTags: ["wet food"],
      allergenTags: [],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-cat-scratcher",
      name: "Sisal Cat Scratcher",
      description: "A compact sisal scratcher for indoor cats.",
      category: "TOYS",
      price: 899,
      discountPercent: 15,
      brand: "Demo Home",
      stock: 18,
      rating: 4.5,
      reviewCount: 33,
      species: ["CAT"],
      suitableAge: "ALL",
      tags: ["indoor"],
      dietaryTags: [],
      allergenTags: [],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-dog-grooming",
      name: "Gentle Dog Grooming Kit",
      description: "A non-medicated grooming kit for routine coat care.",
      category: "GROOMING",
      price: 799,
      discountPercent: 0,
      brand: "Demo Gentle",
      stock: 21,
      rating: 4.3,
      reviewCount: 21,
      species: ["DOG"],
      suitableAge: "ALL",
      tags: ["grooming"],
      dietaryTags: [],
      allergenTags: [],
      isPrescription: false,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "product-prescription-demo",
      name: "Veterinary Prescription Diet (Demo)",
      description: "A prescription-only demonstration product.",
      category: "HEALTHCARE",
      price: 1899,
      discountPercent: 0,
      brand: "Demo Veterinary",
      stock: 6,
      rating: 4.8,
      reviewCount: 8,
      species: ["DOG", "CAT"],
      suitableAge: "ALL",
      tags: ["prescription"],
      dietaryTags: [],
      allergenTags: [],
      isPrescription: true,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "appointment-bruno-checkup",
      ownerId: DEMO_OWNER_ID,
      petId: DEMO_PET_ID,
      veterinarianId: "vet-aarav",
      date: "2026-09-03",
      time: "10:00",
      type: "IN_PERSON",
      reason: "Annual wellness check",
      status: "CONFIRMED",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "appointment-coco-skin",
      ownerId: "user-owner-meera",
      petId: "pet-coco",
      veterinarianId: "vet-aarav",
      date: "2026-08-12",
      time: "11:00",
      type: "IN_PERSON",
      reason: "Skin consultation follow-up",
      status: "COMPLETED",
      consultationNotes: "Demo consultation notes: monitor the skin and return if concerns continue.",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const vaccinations: Vaccination[] = [
    {
      id: "vaccination-bruno-rabies",
      petId: DEMO_PET_ID,
      vaccineName: "Rabies",
      dateAdministered: "2025-09-15",
      nextDueDate: "2026-09-15",
      veterinarianId: "vet-aarav",
      veterinarianName: "Dr. Aarav Mehta",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "vaccination-miso-tricat",
      petId: "pet-miso",
      vaccineName: "Tricat",
      dateAdministered: "2026-03-20",
      nextDueDate: "2027-03-20",
      veterinarianId: "vet-kavya",
      veterinarianName: "Dr. Kavya Nair",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const medications: Medication[] = [
    {
      id: "medication-coco-demo",
      petId: "pet-coco",
      medicineName: "Demo topical treatment",
      frequency: "As directed by the veterinarian",
      startDate: "2026-08-10",
      endDate: "2026-08-24",
      prescribingVeterinarian: "Dr. Aarav Mehta",
      isActive: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const weightRecords: WeightRecord[] = [
    {
      id: "weight-bruno-jan",
      petId: DEMO_PET_ID,
      date: "2026-01-15",
      weightKg: 28.2,
      createdAt: timestamp,
    },
    {
      id: "weight-bruno-aug",
      petId: DEMO_PET_ID,
      date: "2026-08-15",
      weightKg: 28.4,
      createdAt: timestamp,
    },
  ];

  const wearableDevices: PetWearableDevice[] = [
    {
      id: "band-bruno",
      petId: DEMO_PET_ID,
      deviceIdentifier: "PCH-BAND-48291",
      displayName: "Bruno's PetPulse",
      manufacturer: "PetCare",
      model: "PetPulse One",
      status: "PAIRED",
      batteryPercent: 78,
      pairedAt: "2026-06-01T09:00:00.000Z",
      lastSyncedAt: timestamp,
      createdAt: "2026-06-01T09:00:00.000Z",
      updatedAt: timestamp,
    },
  ];

  const healthBandDailyMetrics: HealthBandDailyMetric[] = [
    { id: "metric-bruno-2026-08-18", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-18", source: "BAND", restingHeartRateBpm: 82, averageHeartRateBpm: 98, maxHeartRateBpm: 142, activityMinutes: 56, steps: 5_760, distanceKm: 4.1, caloriesKcal: 336, sleepMinutes: 522, sleepQualityScore: 84, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-19", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-19", source: "BAND", restingHeartRateBpm: 79, averageHeartRateBpm: 94, maxHeartRateBpm: 136, activityMinutes: 48, steps: 4_980, distanceKm: 3.6, caloriesKcal: 298, sleepMinutes: 548, sleepQualityScore: 88, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-20", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-20", source: "BAND", restingHeartRateBpm: 81, averageHeartRateBpm: 97, maxHeartRateBpm: 145, activityMinutes: 64, steps: 6_410, distanceKm: 4.6, caloriesKcal: 372, sleepMinutes: 534, sleepQualityScore: 86, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-21", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-21", source: "BAND", restingHeartRateBpm: 83, averageHeartRateBpm: 99, maxHeartRateBpm: 148, activityMinutes: 42, steps: 4_220, distanceKm: 3.1, caloriesKcal: 260, sleepMinutes: 505, sleepQualityScore: 79, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-22", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-22", source: "BAND", restingHeartRateBpm: 80, averageHeartRateBpm: 95, maxHeartRateBpm: 139, activityMinutes: 59, steps: 6_020, distanceKm: 4.3, caloriesKcal: 351, sleepMinutes: 552, sleepQualityScore: 90, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-23", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-23", source: "BAND", restingHeartRateBpm: 85, averageHeartRateBpm: 102, maxHeartRateBpm: 151, activityMinutes: 34, steps: 3_440, distanceKm: 2.5, caloriesKcal: 214, sleepMinutes: 405, sleepQualityScore: 64, createdAt: timestamp, updatedAt: timestamp },
    { id: "metric-bruno-2026-08-24", petId: DEMO_PET_ID, deviceId: "band-bruno", date: "2026-08-24", source: "BAND", restingHeartRateBpm: 81, averageHeartRateBpm: 96, maxHeartRateBpm: 141, activityMinutes: 51, steps: 5_180, distanceKm: 3.8, caloriesKcal: 312, sleepMinutes: 526, sleepQualityScore: 85, createdAt: timestamp, updatedAt: timestamp },
  ];

  const habitEvents: PetHabitEvent[] = [
    { id: "habit-bruno-walk-2026-08-22", petId: DEMO_PET_ID, deviceId: "band-bruno", sourceEventId: "PCH-BAND-48291:walk:2026-08-22", type: "WALK", source: "BAND", occurredAt: "2026-08-22T06:45:00.000Z", durationMinutes: 32, note: "Morning walk detected by the band.", createdAt: timestamp, updatedAt: timestamp },
    { id: "habit-bruno-feeding-2026-08-22", petId: DEMO_PET_ID, type: "FEEDING", source: "OWNER", occurredAt: "2026-08-22T13:00:00.000Z", quantity: 280, unit: "g", note: "Lunch logged by owner.", createdAt: timestamp, updatedAt: timestamp },
    { id: "habit-bruno-sleep-2026-08-23", petId: DEMO_PET_ID, deviceId: "band-bruno", sourceEventId: "PCH-BAND-48291:sleep:2026-08-23", type: "SLEEP", source: "BAND", occurredAt: "2026-08-23T00:00:00.000Z", durationMinutes: 405, note: "Sleep estimate from the wearable.", createdAt: timestamp, updatedAt: timestamp },
    { id: "habit-bruno-play-2026-08-24", petId: DEMO_PET_ID, deviceId: "band-bruno", sourceEventId: "PCH-BAND-48291:play:2026-08-24", type: "PLAY", source: "BAND", occurredAt: "2026-08-24T17:15:00.000Z", durationMinutes: 19, note: "Active play detected by the band.", createdAt: timestamp, updatedAt: timestamp },
  ];

  const healthBandAlerts: HealthBandAlert[] = [
    {
      id: "alert-bruno-low-sleep-2026-08-23",
      petId: DEMO_PET_ID,
      deviceId: "band-bruno",
      dailyMetricId: "metric-bruno-2026-08-23",
      dedupeKey: "metric:metric-bruno-2026-08-23:LOW_SLEEP",
      type: "LOW_SLEEP",
      severity: "INFO",
      status: "OPEN",
      title: "Sleep was shorter than Bruno's usual target",
      message: "The band estimated 6h 45m of sleep. This is a wellness signal, not a diagnosis; monitor Bruno's usual behaviour and contact a veterinarian if you are concerned.",
      observedAt: "2026-08-23T08:00:00.000Z",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: "record-bruno-wellness",
      petId: DEMO_PET_ID,
      date: "2026-08-12",
      veterinarianId: "vet-aarav",
      veterinarianName: "Dr. Aarav Mehta",
      clinic: "Demo Paws Clinic",
      reason: "Preventive wellness review",
      symptoms: [],
      diagnosisNotes: "Demo record: routine wellness discussion.",
      attachments: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const serviceProviders: ServiceProvider[] = [
    {
      id: "provider-paws",
      userId: "user-provider-paws",
      name: "Rhea Kapoor",
      businessName: "Demo Paws & Polish",
      description: "A fictional grooming service for local development.",
      location: "Bandra, Mumbai",
      rating: 4.6,
      reviewCount: 42,
      imageUrls: [],
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const services: PetServiceListing[] = [
    {
      id: "service-standard-groom",
      providerId: "provider-paws",
      name: "Standard Dog Grooming",
      category: "GROOMING",
      description: "Bath, brush, nail trim, and coat tidy.",
      price: 1200,
      durationMinutes: 90,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  const reminders: Reminder[] = [
    {
      id: "reminder-bruno-rabies",
      ownerId: DEMO_OWNER_ID,
      petId: DEMO_PET_ID,
      type: "VACCINATION",
      title: "Rabies vaccination due",
      description: "Bruno's Rabies vaccination is due soon.",
      date: "2026-09-15",
      recurring: false,
      status: "PENDING",
      sourceKey: "vaccination:vaccination-bruno-rabies",
      sourceId: "vaccination-bruno-rabies",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "reminder-bruno-appointment",
      ownerId: DEMO_OWNER_ID,
      petId: DEMO_PET_ID,
      type: "VET_APPOINTMENT",
      title: "Vet appointment tomorrow",
      description: "Bruno has an appointment with Dr. Aarav Mehta.",
      date: "2026-09-02",
      time: "10:00",
      recurring: false,
      status: "PENDING",
      sourceKey: "appointment:appointment-bruno-checkup",
      sourceId: "appointment-bruno-checkup",
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];

  return {
    version: 2,
    users,
    sessions: [],
    pets,
    medicalRecords,
    vaccinations,
    medications,
    weightRecords,
    wearableDevices,
    healthBandDailyMetrics,
    habitEvents,
    healthBandAlerts,
    veterinarians,
    appointments,
    products,
    carts: [
      {
        id: "cart-akhilesh",
        ownerId: DEMO_OWNER_ID,
        items: [],
        updatedAt: timestamp,
      },
    ],
    orders: [],
    serviceProviders,
    services,
    serviceBookings: [],
    reminders,
    notifications: [],
    conversations: [],
    aiMessages: [],
  };
}

function isState(value: unknown): value is RepositoryState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<RepositoryState>;
  return (
    typeof candidate.version === "number" &&
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.sessions) &&
    Array.isArray(candidate.pets) &&
    Array.isArray(candidate.medicalRecords) &&
    Array.isArray(candidate.vaccinations) &&
    Array.isArray(candidate.medications) &&
    Array.isArray(candidate.weightRecords) &&
    Array.isArray(candidate.veterinarians) &&
    Array.isArray(candidate.appointments) &&
    Array.isArray(candidate.products) &&
    Array.isArray(candidate.carts) &&
    Array.isArray(candidate.orders) &&
    Array.isArray(candidate.reminders)
  );
}

/**
 * Mock state is stored in browsers between releases. Keep a legacy v1 payload
 * usable by filling in the new health-band collections rather than discarding
 * an owner's existing locally stored records.
 */
function normalizeState(value: RepositoryState): RepositoryState {
  const candidate = value as RepositoryState & Partial<Pick<RepositoryState,
    "wearableDevices" | "healthBandDailyMetrics" | "habitEvents" | "healthBandAlerts"
  >>;

  return {
    ...candidate,
    version: Math.max(candidate.version, 2),
    wearableDevices: Array.isArray(candidate.wearableDevices) ? candidate.wearableDevices : [],
    healthBandDailyMetrics: Array.isArray(candidate.healthBandDailyMetrics)
      ? candidate.healthBandDailyMetrics
      : [],
    habitEvents: Array.isArray(candidate.habitEvents) ? candidate.habitEvents : [],
    healthBandAlerts: Array.isArray(candidate.healthBandAlerts) ? candidate.healthBandAlerts : [],
  };
}

function getRuntimeStorage(): StorageLike | null {
  /**
   * Reading from globalThis is safe in Node, Edge, and browsers; browser-only
   * APIs are never referenced when this module is evaluated on the server.
   */
  const maybeStorage = (globalThis as { localStorage?: StorageLike }).localStorage;
  if (!maybeStorage) {
    return null;
  }

  try {
    const testKey = "__petcare_hub_storage_test__";
    maybeStorage.setItem(testKey, "1");
    maybeStorage.removeItem(testKey);
    return maybeStorage;
  } catch {
    return null;
  }
}

export function createMemoryStorage(
  seed: Record<string, string> = {},
): StorageLike {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

/**
 * Small, durable local-development storage. It deliberately follows the same
 * key/value contract as browser storage so the repository can be replaced by
 * Prisma later without changing the application services. Writes are atomic
 * enough for a single local Next.js server: data is written to a sibling file
 * before it replaces the previous file.
 */
export function createFileStorage(filePath = LOCAL_DATA_FILE): StorageLike {
  function readValues(): Record<string, string> {
    try {
      if (!existsSync(filePath)) return {};
      const parsed: unknown = JSON.parse(readFileSync(filePath, "utf8"));
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return Object.fromEntries(
        Object.entries(parsed as Record<string, unknown>).filter(([, value]) => typeof value === "string"),
      ) as Record<string, string>;
    } catch {
      return {};
    }
  }

  function writeValues(values: Record<string, string>): void {
    try {
      mkdirSync(dirname(filePath), { recursive: true });
      const temporaryFile = `${filePath}.${process.pid}.tmp`;
      writeFileSync(temporaryFile, JSON.stringify(values, null, 2), "utf8");
      renameSync(temporaryFile, filePath);
    } catch {
      // Keep the in-memory repository usable if the filesystem is read-only.
    }
  }

  return {
    getItem(key) {
      return readValues()[key] ?? null;
    },
    setItem(key, value) {
      const values = readValues();
      values[key] = value;
      writeValues(values);
    },
    removeItem(key) {
      const values = readValues();
      delete values[key];
      writeValues(values);
    },
  };
}

function getDefaultStorage(): StorageLike | null {
  if (typeof window !== "undefined") return getRuntimeStorage();
  if (process.env.NODE_ENV === "test" || process.env.VITEST) return createMemoryStorage();
  return createFileStorage();
}

/**
 * JSON-safe repository for local development. It has the same basic query and
 * transaction boundary an API repository would expose, while avoiding a
 * browser global at import time.
 */
export class PetCareRepository {
  private state: RepositoryState;
  private readonly storage: StorageLike | null;
  private readonly storageKey: string;

  public constructor(options: RepositoryOptions = {}) {
    this.storage = options.storage === undefined ? getDefaultStorage() : options.storage;
    this.storageKey = options.storageKey ?? MOCK_STORAGE_KEY;
    this.state = this.load(options.initialState ?? createDemoState());
  }

  private load(fallback: RepositoryState): RepositoryState {
    if (!this.storage) {
      return clone(fallback);
    }

    try {
      const stored = this.storage.getItem(this.storageKey);
      if (!stored) {
        return clone(fallback);
      }

      const parsed: unknown = JSON.parse(stored);
      return isState(parsed) ? clone(normalizeState(parsed)) : clone(fallback);
    } catch {
      return clone(fallback);
    }
  }

  private persist(): void {
    if (!this.storage) {
      return;
    }

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // Quota and privacy-mode failures should leave the in-memory app usable.
    }
  }

  public snapshot(): RepositoryState {
    return clone(this.state);
  }

  public replace(nextState: RepositoryState): void {
    this.state = clone(normalizeState(nextState));
    this.persist();
  }

  public reset(nextState: RepositoryState = createDemoState()): void {
    this.replace(nextState);
  }

  /**
   * Updates happen on a cloned working copy. Returning a clone prevents a
   * caller from accidentally changing repository state after the transaction.
   */
  public transaction<Result>(
    mutate: (draft: RepositoryState) => Result,
  ): Result {
    const draft = clone(this.state);
    const result = mutate(draft);
    this.state = draft;
    this.persist();
    return clone(result);
  }

  public getUser(userId: Id): User | undefined {
    return this.readOne(this.state.users, userId);
  }

  public getPublicUser(userId: Id): PublicUser | undefined {
    const user = this.getUser(userId);
    return user ? toPublicUser(user) : undefined;
  }

  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase();
    const found = this.state.users.find((user) => user.email === normalized);
    return found ? clone(found) : undefined;
  }

  public listUsers(): User[] {
    return clone(this.state.users);
  }

  public getPet(petId: Id): Pet | undefined {
    return this.readOne(this.state.pets, petId);
  }

  public listPets(ownerId?: Id): Pet[] {
    const source = ownerId
      ? this.state.pets.filter((pet) => pet.ownerId === ownerId)
      : this.state.pets;
    return clone(source);
  }

  public listMedicalRecords(petId: Id): MedicalRecord[] {
    return clone(
      this.state.medicalRecords
        .filter((record) => record.petId === petId)
        .sort((left, right) => right.date.localeCompare(left.date)),
    );
  }

  public listVaccinations(petId: Id): Vaccination[] {
    return clone(
      this.state.vaccinations
        .filter((vaccination) => vaccination.petId === petId)
        .sort((left, right) => right.dateAdministered.localeCompare(left.dateAdministered)),
    );
  }

  public listMedications(petId: Id): Medication[] {
    return clone(
      this.state.medications
        .filter((medication) => medication.petId === petId)
        .sort((left, right) => right.startDate.localeCompare(left.startDate)),
    );
  }

  public listWeightRecords(petId: Id): WeightRecord[] {
    return clone(
      this.state.weightRecords
        .filter((weight) => weight.petId === petId)
        .sort((left, right) => left.date.localeCompare(right.date)),
    );
  }

  public getWearableDevice(deviceId: Id): PetWearableDevice | undefined {
    return this.readOne(this.state.wearableDevices, deviceId);
  }

  public listWearableDevices(petId: Id): PetWearableDevice[] {
    return clone(
      this.state.wearableDevices
        .filter((device) => device.petId === petId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    );
  }

  public getLatestWearableDevice(petId: Id): PetWearableDevice | undefined {
    const device = this.state.wearableDevices
      .filter((candidate) => candidate.petId === petId)
      .sort((left, right) => {
        const statusOrder = Number(right.status === "PAIRED") - Number(left.status === "PAIRED");
        return statusOrder || right.updatedAt.localeCompare(left.updatedAt);
      })[0];
    return device ? clone(device) : undefined;
  }

  public listHealthBandDailyMetrics(petId: Id): HealthBandDailyMetric[] {
    return clone(
      this.state.healthBandDailyMetrics
        .filter((metric) => metric.petId === petId)
        .sort((left, right) => left.date.localeCompare(right.date)),
    );
  }

  public listHabitEvents(petId: Id): PetHabitEvent[] {
    return clone(
      this.state.habitEvents
        .filter((event) => event.petId === petId)
        .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt)),
    );
  }

  public listHealthBandAlerts(petId: Id): HealthBandAlert[] {
    return clone(
      this.state.healthBandAlerts
        .filter((alert) => alert.petId === petId)
        .sort((left, right) => right.observedAt.localeCompare(left.observedAt)),
    );
  }

  public getVeterinarian(veterinarianId: Id): Veterinarian | undefined {
    return this.readOne(this.state.veterinarians, veterinarianId);
  }

  public listVeterinarians(): Veterinarian[] {
    return clone(this.state.veterinarians);
  }

  public getAppointment(appointmentId: Id): Appointment | undefined {
    return this.readOne(this.state.appointments, appointmentId);
  }

  public listAppointments(
    filter: Partial<Pick<Appointment, "ownerId" | "petId" | "veterinarianId">> = {},
  ): Appointment[] {
    return clone(
      this.state.appointments
        .filter((appointment) =>
          (!filter.ownerId || appointment.ownerId === filter.ownerId) &&
          (!filter.petId || appointment.petId === filter.petId) &&
          (!filter.veterinarianId || appointment.veterinarianId === filter.veterinarianId),
        )
        .sort((left, right) =>
          (left.date + left.time).localeCompare(right.date + right.time),
        ),
    );
  }

  public listProducts(): Product[] {
    return clone(this.state.products);
  }

  public getProduct(productId: Id): Product | undefined {
    return this.readOne(this.state.products, productId);
  }

  public getCart(ownerId: Id): Cart | undefined {
    const found = this.state.carts.find((cart) => cart.ownerId === ownerId);
    return found ? clone(found) : undefined;
  }

  public listOrders(ownerId?: Id): Order[] {
    const source = ownerId
      ? this.state.orders.filter((order) => order.ownerId === ownerId)
      : this.state.orders;
    return clone(source);
  }

  public listReminders(ownerId: Id, petId?: Id): Reminder[] {
    return clone(
      this.state.reminders
        .filter(
          (reminder) =>
            reminder.ownerId === ownerId && (!petId || reminder.petId === petId),
        )
        .sort((left, right) =>
          (left.date + (left.time ?? "")).localeCompare(
            right.date + (right.time ?? ""),
          ),
        ),
    );
  }

  public listNotifications(ownerId: Id): Notification[] {
    return clone(
      this.state.notifications
        .filter((notification) => notification.ownerId === ownerId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    );
  }

  public listServiceProviders(): ServiceProvider[] {
    return clone(this.state.serviceProviders);
  }

  public listServices(): PetServiceListing[] {
    return clone(this.state.services);
  }

  public listServiceBookings(ownerId?: Id): ServiceBooking[] {
    return clone(
      ownerId
        ? this.state.serviceBookings.filter((booking) => booking.ownerId === ownerId)
        : this.state.serviceBookings,
    );
  }

  public listConversations(ownerId: Id, petId?: Id): AIConversation[] {
    return clone(
      this.state.conversations
        .filter(
          (conversation) =>
            conversation.ownerId === ownerId &&
            (!petId || conversation.petId === petId),
        )
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    );
  }

  public listAiMessages(conversationId: Id): AIMessage[] {
    return clone(
      this.state.aiMessages
        .filter((message) => message.conversationId === conversationId)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt)),
    );
  }

  private readOne<RecordType extends { id: Id }>(
    records: RecordType[],
    id: Id,
  ): RecordType | undefined {
    const found = records.find((record) => record.id === id);
    return found ? clone(found) : undefined;
  }
}

export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

/**
 * Convenience data for components that need a reliable preview before API
 * routes are wired. Use getDemoData() when a mutable copy is required.
 */
export const demoData: RepositoryState = createDemoState();

export function getDemoData(): RepositoryState {
  return clone(demoData);
}

export function getCurrentDemoUser(role: UserRole = "PET_OWNER"): PublicUser {
  const user = demoData.users.find(
    (candidate) => candidate.role === role && candidate.isActive,
  );
  if (!user) {
    throw new Error("No active demo user is available for role " + role + ".");
  }
  return toPublicUser(clone(user));
}

export function getCurrentDemoOwner(): PublicUser {
  const owner = demoData.users.find((user) => user.id === DEMO_OWNER_ID);
  if (!owner) {
    throw new Error("The configured demo owner is missing.");
  }
  return toPublicUser(clone(owner));
}

export function createDemoRepository(
  options: Omit<RepositoryOptions, "initialState"> = {},
): PetCareRepository {
  return new PetCareRepository({ ...options, initialState: getDemoData() });
}

let defaultRepository: PetCareRepository | undefined;

/**
 * Use this for local/demo API routes. Production integrations should inject a
 * database-backed repository through the same service boundary.
 */
export function getRepository(): PetCareRepository {
  if (!defaultRepository) {
    defaultRepository = createDemoRepository();
  }
  return defaultRepository;
}

export function resetRepositoryForTests(): void {
  defaultRepository = undefined;
}
