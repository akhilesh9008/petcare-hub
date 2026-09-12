import type {
  Appointment,
  AppointmentStatus,
  Id,
  RepositoryState,
} from "../types/petcare";
import {
  canCreateAppointmentForPet,
  canManageAppointment,
  type Actor,
  AuthorizationError,
  ResourceNotFoundError,
} from "./authorization";
import { createId, PetCareRepository } from "./repository";
import { syncAutomaticRemindersInState } from "./reminders";
import {
  appointmentCreateSchema,
  type AppointmentCreateInput,
} from "./validation";

export class AppointmentConflictError extends Error {
  public readonly statusCode = 409;

  public constructor(
    message = "That appointment time is no longer available.",
  ) {
    super(message);
    this.name = "AppointmentConflictError";
  }
}

export class AppointmentTransitionError extends Error {
  public readonly statusCode = 409;

  public constructor(message: string) {
    super(message);
    this.name = "AppointmentTransitionError";
  }
}

export interface AppointmentServiceOptions {
  now?: () => Date;
}

function isPast(date: string, time: string, now: Date): boolean {
  const today = now.toISOString().slice(0, 10);
  const currentTime = now.toISOString().slice(11, 16);
  return date < today || (date === today && time <= currentTime);
}

function hasSlotConflict(
  state: RepositoryState,
  veterinarianId: Id,
  date: string,
  time: string,
  ignoreAppointmentId?: Id,
): boolean {
  return state.appointments.some(
    (appointment) =>
      appointment.id !== ignoreAppointmentId &&
      appointment.veterinarianId === veterinarianId &&
      appointment.date === date &&
      appointment.time === time &&
      (appointment.status === "PENDING" || appointment.status === "CONFIRMED"),
  );
}

function validTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  if (from === "PENDING") {
    return to === "CONFIRMED" || to === "CANCELLED";
  }
  if (from === "CONFIRMED") {
    return to === "COMPLETED" || to === "CANCELLED";
  }
  return false;
}

export class AppointmentService {
  private readonly clock: () => Date;

  public constructor(
    private readonly repository: PetCareRepository,
    options: AppointmentServiceOptions = {},
  ) {
    this.clock = options.now ?? (() => new Date());
  }

  public create(actor: Actor, input: AppointmentCreateInput): Appointment {
    const parsed = appointmentCreateSchema.parse(input);
    const now = this.clock();
    if (isPast(parsed.date, parsed.time, now)) {
      throw new AppointmentConflictError("Appointments must be booked for a future time.");
    }

    return this.repository.transaction((draft) => {
      const pet = draft.pets.find((candidate) => candidate.id === parsed.petId);
      if (!pet) {
        throw new ResourceNotFoundError("Pet not found.");
      }
      if (!canCreateAppointmentForPet(actor, pet)) {
        throw new AuthorizationError("You can only book an appointment for your own pet.");
      }
      const veterinarian = draft.veterinarians.find(
        (candidate) => candidate.id === parsed.veterinarianId,
      );
      if (!veterinarian) {
        throw new ResourceNotFoundError("Veterinarian not found.");
      }
      if (
        hasSlotConflict(
          draft,
          parsed.veterinarianId,
          parsed.date,
          parsed.time,
        )
      ) {
        throw new AppointmentConflictError();
      }

      const timestamp = now.toISOString();
      const appointment: Appointment = {
        id: createId("appointment"),
        ownerId: pet.ownerId,
        petId: parsed.petId,
        veterinarianId: parsed.veterinarianId,
        date: parsed.date,
        time: parsed.time,
        type: parsed.type,
        reason: parsed.reason,
        notes: parsed.notes,
        status: "PENDING",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      draft.appointments.push(appointment);
      syncAutomaticRemindersInState(draft, now);
      return appointment;
    });
  }

  public cancel(
    actor: Actor,
    appointmentId: Id,
    reason?: string,
  ): Appointment {
    return this.changeStatus(actor, appointmentId, "CANCELLED", "CANCEL", reason);
  }

  public reject(
    actor: Actor,
    appointmentId: Id,
    reason?: string,
  ): Appointment {
    return this.changeStatus(actor, appointmentId, "CANCELLED", "REJECT", reason);
  }

  public confirm(actor: Actor, appointmentId: Id): Appointment {
    return this.changeStatus(actor, appointmentId, "CONFIRMED", "CONFIRM");
  }

  public complete(
    actor: Actor,
    appointmentId: Id,
    consultationNotes?: string,
  ): Appointment {
    return this.repository.transaction((draft) => {
      const appointment = draft.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );
      if (!appointment) {
        throw new ResourceNotFoundError("Appointment not found.");
      }
      if (
        !canManageAppointment(actor, appointment, "COMPLETE", {
          veterinarians: draft.veterinarians,
        })
      ) {
        throw new AuthorizationError("You cannot complete this appointment.");
      }
      if (!validTransition(appointment.status, "COMPLETED")) {
        throw new AppointmentTransitionError(
          "Only a confirmed appointment can be completed.",
        );
      }
      appointment.status = "COMPLETED";
      appointment.consultationNotes = consultationNotes?.trim() || appointment.consultationNotes;
      appointment.updatedAt = this.clock().toISOString();
      syncAutomaticRemindersInState(draft, this.clock());
      return appointment;
    });
  }

  public addConsultationNotes(
    actor: Actor,
    appointmentId: Id,
    notes: string,
  ): Appointment {
    const cleaned = notes.trim();
    if (!cleaned || cleaned.length > 4_000) {
      throw new AppointmentTransitionError(
        "Consultation notes must contain between 1 and 4000 characters.",
      );
    }

    return this.repository.transaction((draft) => {
      const appointment = draft.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );
      if (!appointment) {
        throw new ResourceNotFoundError("Appointment not found.");
      }
      if (
        !canManageAppointment(actor, appointment, "ADD_NOTES", {
          veterinarians: draft.veterinarians,
        })
      ) {
        throw new AuthorizationError("You cannot add notes to this appointment.");
      }
      appointment.consultationNotes = cleaned;
      appointment.updatedAt = this.clock().toISOString();
      return appointment;
    });
  }

  private changeStatus(
    actor: Actor,
    appointmentId: Id,
    nextStatus: AppointmentStatus,
    action: "CANCEL" | "REJECT" | "CONFIRM",
    cancellationReason?: string,
  ): Appointment {
    const now = this.clock();
    return this.repository.transaction((draft) => {
      const appointment = draft.appointments.find(
        (candidate) => candidate.id === appointmentId,
      );
      if (!appointment) {
        throw new ResourceNotFoundError("Appointment not found.");
      }
      if (
        !canManageAppointment(actor, appointment, action, {
          veterinarians: draft.veterinarians,
        })
      ) {
        throw new AuthorizationError("You cannot update this appointment.");
      }
      if (!validTransition(appointment.status, nextStatus)) {
        throw new AppointmentTransitionError(
          "This appointment cannot transition from " +
            appointment.status +
            " to " +
            nextStatus +
            ".",
        );
      }
      appointment.status = nextStatus;
      appointment.updatedAt = now.toISOString();
      if (nextStatus === "CANCELLED") {
        appointment.cancelledAt = now.toISOString();
        appointment.cancellationReason = cancellationReason?.trim();
      }
      syncAutomaticRemindersInState(draft, now);
      return appointment;
    });
  }
}
