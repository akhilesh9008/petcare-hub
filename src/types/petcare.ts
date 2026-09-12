/**
 * Domain contracts shared by the mock services, API routes, and UI.
 *
 * Dates are intentionally serialized as ISO strings so the same objects can
 * safely move between Next.js server and client components.
 */

export const USER_ROLES = [
  "PET_OWNER",
  "VETERINARIAN",
  "SERVICE_PROVIDER",
  "ADMIN",
] as const;

export type UserRole = (typeof USER_ROLES)[number];
export type Id = string;
export type ISODateString = string;
export type ISODateTimeString = string;

export const PET_SPECIES = ["DOG", "CAT", "BIRD", "RABBIT", "OTHER"] as const;
export type PetSpecies = (typeof PET_SPECIES)[number];

export const PET_GENDERS = ["MALE", "FEMALE", "UNKNOWN"] as const;
export type PetGender = (typeof PET_GENDERS)[number];

export const ACTIVITY_LEVELS = ["LOW", "MODERATE", "HIGH"] as const;
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number];

export const APPOINTMENT_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const APPOINTMENT_TYPES = ["IN_PERSON", "ONLINE"] as const;
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const REMINDER_TYPES = [
  "VACCINATION",
  "MEDICATION",
  "VET_APPOINTMENT",
  "GROOMING",
  "FOOD_REFILL",
  "DEWORMING",
  "CUSTOM",
] as const;
export type ReminderType = (typeof REMINDER_TYPES)[number];

export const REMINDER_STATUSES = [
  "PENDING",
  "COMPLETED",
  "DISMISSED",
  "OVERDUE",
] as const;
export type ReminderStatus = (typeof REMINDER_STATUSES)[number];

export const ORDER_STATUSES = [
  "PLACED",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const SERVICE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type ServiceBookingStatus = (typeof SERVICE_BOOKING_STATUSES)[number];

export interface User {
  id: Id;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  /** Kept only in repository/server responses, never render this to a client. */
  passwordHash: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface AuthSession {
  id: Id;
  token: string;
  userId: Id;
  expiresAt: ISODateTimeString;
  createdAt: ISODateTimeString;
}

export interface Pet {
  id: Id;
  ownerId: Id;
  name: string;
  species: PetSpecies;
  breed?: string;
  dateOfBirth?: ISODateString;
  gender: PetGender;
  weightKg?: number;
  color?: string;
  imageUrl?: string;
  microchipId?: string;
  allergies: string[];
  medicalConditions: string[];
  dietaryPreferences: string[];
  activityLevel: ActivityLevel;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface MedicalRecord {
  id: Id;
  petId: Id;
  date: ISODateString;
  veterinarianId?: Id;
  veterinarianName?: string;
  clinic?: string;
  reason?: string;
  symptoms: string[];
  diagnosisNotes?: string;
  treatment?: string;
  prescription?: string;
  followUpDate?: ISODateString;
  attachments: string[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Vaccination {
  id: Id;
  petId: Id;
  vaccineName: string;
  dateAdministered: ISODateString;
  nextDueDate?: ISODateString;
  veterinarianId?: Id;
  veterinarianName?: string;
  notes?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Medication {
  id: Id;
  petId: Id;
  medicineName: string;
  dosage?: string;
  frequency?: string;
  startDate: ISODateString;
  endDate?: ISODateString;
  instructions?: string;
  prescribingVeterinarian?: string;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface WeightRecord {
  id: Id;
  petId: Id;
  date: ISODateString;
  weightKg: number;
  note?: string;
  createdAt: ISODateTimeString;
}

/** States reported by a PetCare-compatible wearable. */
export const WEARABLE_DEVICE_STATUSES = ["PAIRED", "OFFLINE", "UNPAIRED"] as const;
export type WearableDeviceStatus = (typeof WEARABLE_DEVICE_STATUSES)[number];

/** Identifies whether an observation came from the band or was entered by a carer. */
export const HEALTH_BAND_DATA_SOURCES = ["BAND", "OWNER", "SYSTEM"] as const;
export type HealthBandDataSource = (typeof HEALTH_BAND_DATA_SOURCES)[number];

export const PET_HABIT_TYPES = [
  "WALK",
  "PLAY",
  "SLEEP",
  "FEEDING",
  "WATER",
  "POTTY",
  "MEDICATION",
  "GROOMING",
] as const;
export type PetHabitType = (typeof PET_HABIT_TYPES)[number];

export const HEALTH_BAND_ALERT_TYPES = [
  "HIGH_RESTING_HEART_RATE",
  "LOW_ACTIVITY",
  "LOW_SLEEP",
  "DEVICE_OFFLINE",
] as const;
export type HealthBandAlertType = (typeof HEALTH_BAND_ALERT_TYPES)[number];

export const HEALTH_BAND_ALERT_SEVERITIES = ["INFO", "WARNING", "URGENT"] as const;
export type HealthBandAlertSeverity = (typeof HEALTH_BAND_ALERT_SEVERITIES)[number];

export const HEALTH_BAND_ALERT_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
export type HealthBandAlertStatus = (typeof HEALTH_BAND_ALERT_STATUSES)[number];

/** A wearable paired to exactly one pet. Device identifiers are never owner-facing secrets. */
export interface PetWearableDevice {
  id: Id;
  petId: Id;
  deviceIdentifier: string;
  displayName: string;
  manufacturer?: string;
  model?: string;
  status: WearableDeviceStatus;
  batteryPercent?: number;
  pairedAt: ISODateTimeString;
  lastSyncedAt?: ISODateTimeString;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/** A per-pet daily aggregate; raw, high-frequency wearable samples are deliberately not retained in mock mode. */
export interface HealthBandDailyMetric {
  id: Id;
  petId: Id;
  deviceId?: Id;
  date: ISODateString;
  source: HealthBandDataSource;
  restingHeartRateBpm?: number;
  averageHeartRateBpm?: number;
  maxHeartRateBpm?: number;
  activityMinutes: number;
  steps?: number;
  distanceKm?: number;
  caloriesKcal?: number;
  sleepMinutes: number;
  sleepQualityScore?: number;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/** A discrete care or behaviour event, which may be recorded by a band or a person. */
export interface PetHabitEvent {
  id: Id;
  petId: Id;
  deviceId?: Id;
  sourceEventId?: string;
  type: PetHabitType;
  source: HealthBandDataSource;
  occurredAt: ISODateTimeString;
  durationMinutes?: number;
  quantity?: number;
  unit?: string;
  note?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

/** An observation generated from configured, non-diagnostic tracker thresholds. */
export interface HealthBandAlert {
  id: Id;
  petId: Id;
  deviceId?: Id;
  dailyMetricId?: Id;
  dedupeKey: string;
  type: HealthBandAlertType;
  severity: HealthBandAlertSeverity;
  status: HealthBandAlertStatus;
  title: string;
  message: string;
  observedAt: ISODateTimeString;
  acknowledgedAt?: ISODateTimeString;
  resolvedAt?: ISODateTimeString;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface HealthBandAggregate {
  daysWithData: number;
  activeDays: number;
  totalActivityMinutes: number;
  averageActivityMinutes: number;
  totalSleepMinutes: number;
  averageSleepMinutes: number;
  totalSteps: number;
  averageRestingHeartRateBpm?: number;
  latestSyncedAt?: ISODateTimeString;
}

export interface HealthBandSummary {
  petId: Id;
  range: { from: ISODateString; to: ISODateString };
  device?: PetWearableDevice;
  latestMetric?: HealthBandDailyMetric;
  metrics: HealthBandDailyMetric[];
  habits: PetHabitEvent[];
  alerts: HealthBandAlert[];
  aggregate: HealthBandAggregate;
}

export interface Veterinarian {
  id: Id;
  /** Links a veterinarian directory profile to a VETERINARIAN account. */
  userId?: Id;
  name: string;
  profileImageUrl?: string;
  specialization: string[];
  clinic: string;
  location: string;
  rating: number;
  reviewCount: number;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string;
  qualifications: string[];
  availableSlots: AppointmentSlot[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface AppointmentSlot {
  date: ISODateString;
  time: string;
  available: boolean;
}

export interface Appointment {
  id: Id;
  ownerId: Id;
  petId: Id;
  veterinarianId: Id;
  date: ISODateString;
  time: string;
  type: AppointmentType;
  reason: string;
  notes?: string;
  status: AppointmentStatus;
  consultationNotes?: string;
  cancelledAt?: ISODateTimeString;
  cancellationReason?: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export const PRODUCT_CATEGORIES = [
  "FOOD",
  "TREATS",
  "TOYS",
  "GROOMING",
  "HEALTHCARE",
  "ACCESSORIES",
  "BEDS",
  "COLLARS",
  "LEASHES",
  "BOWLS",
  "CARRIERS",
  "TRAINING",
] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PET_AGE_GROUPS = ["PUPPY", "ADULT", "SENIOR", "ALL"] as const;
export type PetAgeGroup = (typeof PET_AGE_GROUPS)[number];

export interface Product {
  id: Id;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  discountPercent: number;
  imageUrl?: string;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  species: Array<PetSpecies | "ALL">;
  suitableAge: PetAgeGroup;
  tags: string[];
  dietaryTags: string[];
  allergenTags: string[];
  isPrescription: boolean;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface CartItem {
  id: Id;
  productId: Id;
  quantity: number;
  addedAt: ISODateTimeString;
}

export interface Cart {
  id: Id;
  ownerId: Id;
  items: CartItem[];
  updatedAt: ISODateTimeString;
}

export interface CartLine {
  item: CartItem;
  product: Product;
  unitPrice: number;
  lineSubtotal: number;
  lineDiscount: number;
  lineTotal: number;
}

export interface CartTotals {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  id: Id;
  productId: Id;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  lineTotal: number;
}

export interface Order {
  id: Id;
  orderNumber: string;
  ownerId: Id;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentReference: string;
  status: OrderStatus;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ServiceProvider {
  id: Id;
  userId?: Id;
  name: string;
  businessName: string;
  description: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface PetServiceListing {
  id: Id;
  providerId: Id;
  name: string;
  category:
    | "VETERINARY"
    | "GROOMING"
    | "BOARDING"
    | "WALKING"
    | "TRAINING"
    | "SITTING"
    | "PHOTOGRAPHY";
  description: string;
  price: number;
  durationMinutes?: number;
  isActive: boolean;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface ServiceBooking {
  id: Id;
  ownerId: Id;
  petId: Id;
  serviceId: Id;
  providerId: Id;
  date: ISODateString;
  time: string;
  notes?: string;
  status: ServiceBookingStatus;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Reminder {
  id: Id;
  ownerId: Id;
  petId: Id;
  type: ReminderType;
  title: string;
  description?: string;
  date: ISODateString;
  time?: string;
  recurring: boolean;
  status: ReminderStatus;
  /** A stable key makes generation from health data idempotent. */
  sourceKey?: string;
  sourceId?: Id;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface Notification {
  id: Id;
  ownerId: Id;
  title: string;
  body: string;
  href?: string;
  readAt?: ISODateTimeString;
  createdAt: ISODateTimeString;
}

export interface AIConversation {
  id: Id;
  ownerId: Id;
  petId: Id;
  title: string;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}

export interface AIMessage {
  id: Id;
  conversationId: Id;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: ISODateTimeString;
}

export interface RepositoryState {
  version: number;
  users: User[];
  sessions: AuthSession[];
  pets: Pet[];
  medicalRecords: MedicalRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  weightRecords: WeightRecord[];
  wearableDevices: PetWearableDevice[];
  healthBandDailyMetrics: HealthBandDailyMetric[];
  habitEvents: PetHabitEvent[];
  healthBandAlerts: HealthBandAlert[];
  veterinarians: Veterinarian[];
  appointments: Appointment[];
  products: Product[];
  carts: Cart[];
  orders: Order[];
  serviceProviders: ServiceProvider[];
  services: PetServiceListing[];
  serviceBookings: ServiceBooking[];
  reminders: Reminder[];
  notifications: Notification[];
  conversations: AIConversation[];
  aiMessages: AIMessage[];
}

export interface Recommendation {
  product: Product;
  score: number;
  reasons: string[];
}

export interface AiAssistantResponse {
  content: string;
  followUpQuestions: string[];
  urgent: boolean;
  disclaimer: string;
}

export interface HealthSummary {
  pet: Pet;
  latestWeight?: WeightRecord;
  weightTrend: "INCREASING" | "DECREASING" | "STABLE" | "UNKNOWN";
  completedVaccinations: number;
  upcomingVaccinations: Vaccination[];
  activeMedications: Medication[];
  recentMedicalRecord?: MedicalRecord;
  upcomingAppointments: Appointment[];
}

export type Permission =
  | "pet:read"
  | "pet:write"
  | "medical-record:read"
  | "medical-record:write"
  | "appointment:create"
  | "appointment:manage"
  | "product:manage"
  | "order:read"
  | "platform:admin";
