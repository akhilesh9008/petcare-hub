import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { canWritePet } from "@/lib/authorization";
import { HealthBandError, recordOwnerHabitEvent } from "@/lib/health-band";
import { getRepository } from "@/lib/repository";
import { habitEventInputSchema } from "@/lib/validation";

/** Stores a factual owner-entered habit in the pet's private timeline. */
export async function POST(request: NextRequest) {
  try {
    const actor = requireApiActor(request);
    const input = habitEventInputSchema.parse(await body(request));
    const repository = getRepository();
    const pet = repository.snapshot().pets.find((item) => item.id === input.petId);
    if (!pet) throw new HealthBandError("Pet not found.", 404);
    if (!canWritePet(actor, pet)) throw new HealthBandError("You cannot log a habit for this pet.", 403);
    return ok(recordOwnerHabitEvent(repository, input.petId, input), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
