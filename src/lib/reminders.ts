import type {
  Appointment,
  Id,
  Medication,
  Reminder,
  ReminderStatus,
  RepositoryState,
  Vaccination,
} from "../types/petcare";
import { canWritePet, type Actor, AuthorizationError, ResourceNotFoundError } from "./authorization";
import { createId, nowIso, PetCareRepository } from "./repository";
import { reminderInputSchema, type ReminderInput } from "./validation";

export interface ReminderSyncResult {
  created: number;
  updated: number;
  dismissed: number;
}

export interface ReminderGroups {
  today: Reminder[];
  upcoming: Reminder[];
  overdue: Reminder[];
  completed: Reminder[];
}

function isoDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}

function isoTime(now: Date): string {
  return now.toISOString().slice(11, 16);
}

function shiftDate(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function nextStatus(reminder: Reminder, now: Date): ReminderStatus {
  if (reminder.status === "COMPLETED" || reminder.status === "DISMISSED") {
    return reminder.status;
  }

  const today = isoDate(now);
  if (reminder.date < today) {
    return "OVERDUE";
  }
  if (
    reminder.date === today &&
    reminder.time &&
    reminder.time < isoTime(now)
  ) {
    return "OVERDUE";
  }
  return "PENDING";
}

function vaccinationReminder(
  vaccination: Vaccination,
  ownerId: Id,
  timestamp: string,
): Reminder | undefined {
  if (!vaccination.nextDueDate) {
    return undefined;
  }
  return {
    id: createId("reminder"),
    ownerId,
    petId: vaccination.petId,
    type: "VACCINATION",
    title: vaccination.vaccineName + " vaccination due",
    description: vaccination.vaccineName + " is due for your pet.",
    date: vaccination.nextDueDate,
    recurring: false,
    status: "PENDING",
    sourceKey: "vaccination:" + vaccination.id,
    sourceId: vaccination.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function medicationReminder(
  medication: Medication,
  ownerId: Id,
  timestamp: string,
): Reminder | undefined {
  if (!medication.endDate) {
    return undefined;
  }
  return {
    id: createId("reminder"),
    ownerId,
    petId: medication.petId,
    type: "MEDICATION",
    title: "Medication course ends: " + medication.medicineName,
    description:
      "Review the end of " +
      medication.medicineName +
      " with the prescribing veterinarian if you have questions.",
    date: medication.endDate,
    recurring: false,
    status: "PENDING",
    sourceKey: "medication:" + medication.id,
    sourceId: medication.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function appointmentReminder(
  appointment: Appointment,
  ownerId: Id,
  timestamp: string,
): Reminder | undefined {
  if (appointment.status === "CANCELLED" || appointment.status === "COMPLETED") {
    return undefined;
  }
  return {
    id: createId("reminder"),
    ownerId,
    petId: appointment.petId,
    type: "VET_APPOINTMENT",
    title: "Vet appointment tomorrow",
    description: "Your appointment is scheduled for " + appointment.date + " at " + appointment.time + ".",
    date: shiftDate(appointment.date, -1),
    time: appointment.time,
    recurring: false,
    status: "PENDING",
    sourceKey: "appointment:" + appointment.id,
    sourceId: appointment.id,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function upsertAutomaticReminder(
  state: RepositoryState,
  generated: Reminder,
  now: Date,
  result: ReminderSyncResult,
): void {
  const existing = state.reminders.find(
    (reminder) => reminder.sourceKey === generated.sourceKey,
  );
  if (!existing) {
    generated.status = nextStatus(generated, now);
    state.reminders.push(generated);
    result.created += 1;
    return;
  }

  const shouldKeepResolution =
    existing.status === "COMPLETED" || existing.status === "DISMISSED";
  const changed =
    existing.title !== generated.title ||
    existing.description !== generated.description ||
    existing.date !== generated.date ||
    existing.time !== generated.time ||
    existing.ownerId !== generated.ownerId ||
    existing.petId !== generated.petId ||
    existing.type !== generated.type;

  existing.ownerId = generated.ownerId;
  existing.petId = generated.petId;
  existing.type = generated.type;
  existing.title = generated.title;
  existing.description = generated.description;
  existing.date = generated.date;
  existing.time = generated.time;
  existing.recurring = generated.recurring;
  existing.sourceId = generated.sourceId;
  if (!shouldKeepResolution) {
    existing.status = nextStatus(existing, now);
  }
  if (changed) {
    existing.updatedAt = now.toISOString();
    result.updated += 1;
  }
}

/**
 * This pure-state version lets other domain services keep the generated
 * reminder in the same repository transaction as its source record.
 */
export function syncAutomaticRemindersInState(
  state: RepositoryState,
  now: Date = new Date(),
): ReminderSyncResult {
  const result: ReminderSyncResult = { created: 0, updated: 0, dismissed: 0 };
  const timestamp = now.toISOString();
  const generatedKeys = new Set<string>();

  for (const vaccination of state.vaccinations) {
    const ownerId = state.pets.find((pet) => pet.id === vaccination.petId)?.ownerId;
    if (!ownerId) {
      continue;
    }
    const reminder = vaccinationReminder(vaccination, ownerId, timestamp);
    if (reminder?.sourceKey) {
      generatedKeys.add(reminder.sourceKey);
      upsertAutomaticReminder(state, reminder, now, result);
    }
  }

  for (const medication of state.medications) {
    const ownerId = state.pets.find((pet) => pet.id === medication.petId)?.ownerId;
    if (!ownerId) {
      continue;
    }
    const reminder = medicationReminder(medication, ownerId, timestamp);
    if (reminder?.sourceKey) {
      generatedKeys.add(reminder.sourceKey);
      upsertAutomaticReminder(state, reminder, now, result);
    }
  }

  for (const appointment of state.appointments) {
    const ownerId = state.pets.find((pet) => pet.id === appointment.petId)?.ownerId;
    if (!ownerId) {
      continue;
    }
    const reminder = appointmentReminder(appointment, ownerId, timestamp);
    if (reminder?.sourceKey) {
      generatedKeys.add(reminder.sourceKey);
      upsertAutomaticReminder(state, reminder, now, result);
    }
  }

  for (const reminder of state.reminders) {
    if (!reminder.sourceKey) {
      const status = nextStatus(reminder, now);
      if (status !== reminder.status) {
        reminder.status = status;
        reminder.updatedAt = timestamp;
        result.updated += 1;
      }
      continue;
    }

    if (
      !generatedKeys.has(reminder.sourceKey) &&
      reminder.status !== "COMPLETED" &&
      reminder.status !== "DISMISSED"
    ) {
      reminder.status = "DISMISSED";
      reminder.updatedAt = timestamp;
      result.dismissed += 1;
    }
  }

  return result;
}

export function syncAutomaticReminders(
  repository: PetCareRepository,
  now: Date = new Date(),
): ReminderSyncResult {
  return repository.transaction((draft) => syncAutomaticRemindersInState(draft, now));
}

export function createReminder(
  repository: PetCareRepository,
  actor: Actor,
  input: ReminderInput,
  now: Date = new Date(),
): Reminder {
  const parsed = reminderInputSchema.parse(input);
  return repository.transaction((draft) => {
    const pet = draft.pets.find((candidate) => candidate.id === parsed.petId);
    if (!pet) {
      throw new ResourceNotFoundError("Pet not found.");
    }
    if (!canWritePet(actor, pet)) {
      throw new AuthorizationError("You cannot add a reminder for this pet.");
    }

    const timestamp = now.toISOString();
    const reminder: Reminder = {
      id: createId("reminder"),
      ownerId: pet.ownerId,
      petId: parsed.petId,
      type: parsed.type,
      title: parsed.title,
      description: parsed.description,
      date: parsed.date,
      time: parsed.time,
      recurring: parsed.recurring,
      status: "PENDING",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    reminder.status = nextStatus(reminder, now);
    draft.reminders.push(reminder);
    return reminder;
  });
}

export function setReminderStatus(
  repository: PetCareRepository,
  actor: Actor,
  reminderId: Id,
  status: Extract<ReminderStatus, "COMPLETED" | "DISMISSED">,
  now: Date = new Date(),
): Reminder {
  return repository.transaction((draft) => {
    const reminder = draft.reminders.find((candidate) => candidate.id === reminderId);
    if (!reminder) {
      throw new ResourceNotFoundError("Reminder not found.");
    }
    const pet = draft.pets.find((candidate) => candidate.id === reminder.petId);
    if (!pet || !canWritePet(actor, pet)) {
      throw new AuthorizationError("You cannot update this reminder.");
    }
    reminder.status = status;
    reminder.updatedAt = now.toISOString();
    return reminder;
  });
}

export function groupReminders(
  reminders: Reminder[],
  now: Date = new Date(),
): ReminderGroups {
  const today = isoDate(now);
  const result: ReminderGroups = {
    today: [],
    upcoming: [],
    overdue: [],
    completed: [],
  };
  for (const source of reminders) {
    const reminder = { ...source, status: nextStatus(source, now) };
    if (reminder.status === "COMPLETED" || reminder.status === "DISMISSED") {
      result.completed.push(reminder);
    } else if (reminder.status === "OVERDUE") {
      result.overdue.push(reminder);
    } else if (reminder.date === today) {
      result.today.push(reminder);
    } else {
      result.upcoming.push(reminder);
    }
  }
  return result;
}

export { nowIso };
