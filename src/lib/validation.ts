import { z } from "zod";

import {
  ACTIVITY_LEVELS,
  APPOINTMENT_TYPES,
  HEALTH_BAND_ALERT_STATUSES,
  PET_HABIT_TYPES,
  PET_GENDERS,
  PET_SPECIES,
  PRODUCT_CATEGORIES,
  REMINDER_TYPES,
} from "../types/petcare";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a date in YYYY-MM-DD format.");

const timeOfDay = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Use a time in HH:mm format.");

const optionalTrimmedText = z.string().trim().max(2_000).optional();
const PUBLIC_ACCOUNT_ROLES = ["PET_OWNER", "VETERINARIAN", "SERVICE_PROVIDER"] as const;
const LOGIN_ACCOUNT_ROLES = [...PUBLIC_ACCOUNT_ROLES, "ADMIN"] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160).transform((value) => value.toLowerCase()),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/).optional(),
  password: z
    .string()
    .min(8, "Password must contain at least 8 characters.")
    .max(128),
  /** Admin accounts can never be created from the public registration form. */
  role: z.enum(PUBLIC_ACCOUNT_ROLES).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(128),
  /** A UI guard only; the server still determines the account's real role. */
  expectedRole: z.enum(LOGIN_ACCOUNT_ROLES).optional(),
});

export const petInputSchema = z.object({
  name: z.string().trim().min(1).max(60),
  species: z.enum(PET_SPECIES),
  breed: z.string().trim().max(100).optional(),
  dateOfBirth: isoDate.optional(),
  gender: z.enum(PET_GENDERS).default("UNKNOWN"),
  weightKg: z.number().positive().max(300).optional(),
  color: z.string().trim().max(80).optional(),
  imageUrl: z.string().url().max(1_000).optional(),
  microchipId: z.string().trim().max(100).optional(),
  allergies: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  medicalConditions: z
    .array(z.string().trim().min(1).max(150))
    .max(30)
    .default([]),
  dietaryPreferences: z
    .array(z.string().trim().min(1).max(100))
    .max(20)
    .default([]),
  activityLevel: z.enum(ACTIVITY_LEVELS).default("MODERATE"),
});

export const medicalRecordInputSchema = z.object({
  petId: z.string().min(1),
  date: isoDate,
  veterinarianId: z.string().min(1).optional(),
  veterinarianName: z.string().trim().max(100).optional(),
  clinic: z.string().trim().max(150).optional(),
  reason: z.string().trim().max(500).optional(),
  symptoms: z.array(z.string().trim().min(1).max(150)).max(30).default([]),
  diagnosisNotes: optionalTrimmedText,
  treatment: optionalTrimmedText,
  prescription: optionalTrimmedText,
  followUpDate: isoDate.optional(),
  attachments: z.array(z.string().url().max(1_000)).max(10).default([]),
});

export const vaccinationInputSchema = z
  .object({
    petId: z.string().min(1),
    vaccineName: z.string().trim().min(1).max(120),
    dateAdministered: isoDate,
    nextDueDate: isoDate.optional(),
    veterinarianId: z.string().min(1).optional(),
    veterinarianName: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(2_000).optional(),
  })
  .superRefine((data, context) => {
    if (
      data.nextDueDate &&
      data.nextDueDate < data.dateAdministered
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextDueDate"],
        message: "The next due date cannot be before administration.",
      });
    }
  });

export const medicationInputSchema = z
  .object({
    petId: z.string().min(1),
    medicineName: z.string().trim().min(1).max(120),
    dosage: z.string().trim().max(200).optional(),
    frequency: z.string().trim().max(100).optional(),
    startDate: isoDate,
    endDate: isoDate.optional(),
    instructions: z.string().trim().max(2_000).optional(),
    prescribingVeterinarian: z.string().trim().max(100).optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, context) => {
    if (data.endDate && data.endDate < data.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "The end date cannot be before the start date.",
      });
    }
  });

export const weightRecordInputSchema = z.object({
  petId: z.string().min(1),
  date: isoDate,
  weightKg: z.number().positive().max(300),
  note: z.string().trim().max(500).optional(),
});

export const appointmentCreateSchema = z.object({
  petId: z.string().min(1),
  veterinarianId: z.string().min(1),
  date: isoDate,
  time: timeOfDay,
  type: z.enum(APPOINTMENT_TYPES),
  reason: z.string().trim().min(3).max(500),
  notes: z.string().trim().max(2_000).optional(),
});

export const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
]);

export const cartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6 digit PIN code."),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(3_000),
  category: z.enum(PRODUCT_CATEGORIES),
  price: z.number().positive().max(1_000_000),
  discountPercent: z.number().min(0).max(100).default(0),
  stock: z.number().int().min(0).max(1_000_000),
});

export const reminderInputSchema = z.object({
  petId: z.string().min(1),
  type: z.enum(REMINDER_TYPES),
  title: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1_000).optional(),
  date: isoDate,
  time: timeOfDay.optional(),
  recurring: z.boolean().default(false),
});

export const aiMessageSchema = z.object({
  petId: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  message: z.string().trim().min(1).max(4_000),
});

export const healthBandSyncSchema = z.object({
  petId: z.string().min(1),
  /** Only exposed for deterministic local-demo testing; production providers post verified data instead. */
  scenario: z.enum(["BASELINE", "LOW_ACTIVITY", "ELEVATED_HEART_RATE", "SHORT_SLEEP"]).optional(),
});

export const habitEventInputSchema = z.object({
  petId: z.string().min(1),
  deviceId: z.string().min(1).optional(),
  type: z.enum(PET_HABIT_TYPES),
  occurredAt: z.string().datetime({ offset: true }),
  durationMinutes: z.number().int().min(1).max(1_440).optional(),
  quantity: z.number().nonnegative().max(1_000_000).optional(),
  unit: z.string().trim().max(30).optional(),
  note: z.string().trim().max(1_000).optional(),
});

export const healthBandAlertUpdateSchema = z.object({
  petId: z.string().min(1),
  alertId: z.string().min(1),
  status: z.enum(HEALTH_BAND_ALERT_STATUSES).refine((value) => value !== "OPEN", "Use ACKNOWLEDGED or RESOLVED."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PetInput = z.infer<typeof petInputSchema>;
export type MedicalRecordInput = z.infer<typeof medicalRecordInputSchema>;
export type VaccinationInput = z.infer<typeof vaccinationInputSchema>;
export type MedicationInput = z.infer<typeof medicationInputSchema>;
export type WeightRecordInput = z.infer<typeof weightRecordInputSchema>;
export type AppointmentCreateInput = z.infer<typeof appointmentCreateSchema>;
export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReminderInput = z.infer<typeof reminderInputSchema>;
export type HealthBandSyncInput = z.infer<typeof healthBandSyncSchema>;
export type HabitEventInput = z.infer<typeof habitEventInputSchema>;
