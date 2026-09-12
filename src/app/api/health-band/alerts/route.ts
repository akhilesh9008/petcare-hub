import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { canWritePet } from "@/lib/authorization";
import { HealthBandError, updateHealthBandAlertStatus } from "@/lib/health-band";
import { getRepository } from "@/lib/repository";
import { healthBandAlertUpdateSchema } from "@/lib/validation";

/** Acknowledges or resolves a non-diagnostic wearable wellness observation. */
export async function PATCH(request: NextRequest) {
  try {
    const actor = requireApiActor(request);
    const input = healthBandAlertUpdateSchema.parse(await body(request));
    const repository = getRepository();
    const pet = repository.snapshot().pets.find((item) => item.id === input.petId);
    if (!pet) throw new HealthBandError("Pet not found.", 404);
    if (!canWritePet(actor, pet)) throw new HealthBandError("You cannot update alerts for this pet.", 403);
    return ok(updateHealthBandAlertStatus(repository, input.petId, input.alertId, input.status as "ACKNOWLEDGED" | "RESOLVED"));
  } catch (error) {
    return apiError(error);
  }
}
