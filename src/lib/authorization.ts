import type {
  Appointment,
  Id,
  MedicalRecord,
  Order,
  Permission,
  Pet,
  PublicUser,
  RepositoryState,
  User,
  UserRole,
  Veterinarian,
} from "../types/petcare";

export type Actor = Pick<PublicUser, "id" | "role" | "isActive">;

export class AuthorizationError extends Error {
  public readonly statusCode = 403;

  public constructor(message = "You are not authorized to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ResourceNotFoundError extends Error {
  public readonly statusCode = 404;

  public constructor(message = "The requested resource was not found.") {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  PET_OWNER: [
    "pet:read",
    "pet:write",
    "medical-record:read",
    "medical-record:write",
    "appointment:create",
    "order:read",
  ],
  VETERINARIAN: [
    "pet:read",
    "medical-record:read",
    "medical-record:write",
    "appointment:manage",
  ],
  SERVICE_PROVIDER: [],
  ADMIN: [
    "pet:read",
    "pet:write",
    "medical-record:read",
    "medical-record:write",
    "appointment:create",
    "appointment:manage",
    "product:manage",
    "order:read",
    "platform:admin",
  ],
};

export function hasRole(
  actor: Pick<User, "role"> | Pick<PublicUser, "role">,
  ...roles: UserRole[]
): boolean {
  return roles.includes(actor.role);
}

export function hasPermission(actor: Actor, permission: Permission): boolean {
  return actor.isActive && ROLE_PERMISSIONS[actor.role].includes(permission);
}

export function requirePermission(actor: Actor, permission: Permission): void {
  if (!hasPermission(actor, permission)) {
    throw new AuthorizationError("Your role does not have this permission.");
  }
}

export function isAdministrator(actor: Actor): boolean {
  return actor.isActive && actor.role === "ADMIN";
}

export function veterinarianForUser(
  actorId: Id,
  veterinarians: Veterinarian[],
): Veterinarian | undefined {
  return veterinarians.find((veterinarian) => veterinarian.userId === actorId);
}

/**
 * Veterinarians get read access only after an actual, non-cancelled
 * appointment connects them to a pet. A directory profile alone is not
 * sufficient.
 */
export function canReadPet(
  actor: Actor,
  pet: Pet,
  state: Pick<RepositoryState, "appointments" | "veterinarians">,
): boolean {
  if (!actor.isActive) {
    return false;
  }
  if (isAdministrator(actor) || pet.ownerId === actor.id) {
    return true;
  }
  if (actor.role !== "VETERINARIAN") {
    return false;
  }

  const veterinarian = veterinarianForUser(actor.id, state.veterinarians);
  return Boolean(
    veterinarian &&
      state.appointments.some(
        (appointment) =>
          appointment.petId === pet.id &&
          appointment.veterinarianId === veterinarian.id &&
          appointment.status !== "CANCELLED",
      ),
  );
}

export function canWritePet(actor: Actor, pet: Pet): boolean {
  return actor.isActive && (isAdministrator(actor) || pet.ownerId === actor.id);
}

export function canReadMedicalRecord(
  actor: Actor,
  record: MedicalRecord,
  state: Pick<RepositoryState, "pets" | "appointments" | "veterinarians">,
): boolean {
  const pet = state.pets.find((candidate) => candidate.id === record.petId);
  return Boolean(pet && canReadPet(actor, pet, state));
}

export function canWriteMedicalRecord(
  actor: Actor,
  record: Pick<MedicalRecord, "petId">,
  state: Pick<RepositoryState, "pets" | "appointments" | "veterinarians">,
): boolean {
  const pet = state.pets.find((candidate) => candidate.id === record.petId);
  if (!pet || !actor.isActive) {
    return false;
  }
  if (isAdministrator(actor) || pet.ownerId === actor.id) {
    return true;
  }
  return actor.role === "VETERINARIAN" && canReadPet(actor, pet, state);
}

export type AppointmentAction =
  | "READ"
  | "CANCEL"
  | "REJECT"
  | "CONFIRM"
  | "COMPLETE"
  | "ADD_NOTES";

export function canManageAppointment(
  actor: Actor,
  appointment: Appointment,
  action: AppointmentAction,
  state: Pick<RepositoryState, "veterinarians">,
): boolean {
  if (!actor.isActive) {
    return false;
  }
  if (isAdministrator(actor)) {
    return true;
  }
  if (appointment.ownerId === actor.id) {
    return action === "READ" || action === "CANCEL";
  }
  if (actor.role !== "VETERINARIAN") {
    return false;
  }
  const veterinarian = veterinarianForUser(actor.id, state.veterinarians);
  if (!veterinarian || veterinarian.id !== appointment.veterinarianId) {
    return false;
  }
  return (
    action === "READ" ||
    action === "REJECT" ||
    action === "CONFIRM" ||
    action === "COMPLETE" ||
    action === "ADD_NOTES"
  );
}

export function canCreateAppointmentForPet(actor: Actor, pet: Pet): boolean {
  return actor.isActive && (isAdministrator(actor) || pet.ownerId === actor.id);
}

export function canReadOrder(actor: Actor, order: Order): boolean {
  return actor.isActive && (isAdministrator(actor) || order.ownerId === actor.id);
}

export function requirePetReadAccess(
  actor: Actor,
  pet: Pet | undefined,
  state: Pick<RepositoryState, "appointments" | "veterinarians">,
): asserts pet is Pet {
  if (!pet) {
    throw new ResourceNotFoundError("Pet not found.");
  }
  if (!canReadPet(actor, pet, state)) {
    throw new AuthorizationError("You cannot access this pet's private information.");
  }
}

export function requirePetWriteAccess(actor: Actor, pet: Pet | undefined): asserts pet is Pet {
  if (!pet) {
    throw new ResourceNotFoundError("Pet not found.");
  }
  if (!canWritePet(actor, pet)) {
    throw new AuthorizationError("You cannot edit this pet.");
  }
}

export function requireAppointmentAccess(
  actor: Actor,
  appointment: Appointment | undefined,
  action: AppointmentAction,
  state: Pick<RepositoryState, "veterinarians">,
): asserts appointment is Appointment {
  if (!appointment) {
    throw new ResourceNotFoundError("Appointment not found.");
  }
  if (!canManageAppointment(actor, appointment, action, state)) {
    throw new AuthorizationError("You cannot manage this appointment.");
  }
}
