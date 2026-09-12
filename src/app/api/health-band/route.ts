import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { canWritePet, requirePetReadAccess } from "@/lib/authorization";
import { getHealthBandSummary, HealthBandError, syncMockHealthBand } from "@/lib/health-band";
import { getRepository } from "@/lib/repository";
import { healthBandSyncSchema } from "@/lib/validation";

/** Returns a private, per-pet wearable wellness summary. */
export async function GET(request: NextRequest) {
  try {
    const actor = requireApiActor(request);
    const petId = request.nextUrl.searchParams.get("petId");
    if (!petId) throw new HealthBandError("petId is required.");
    const rawDays = request.nextUrl.searchParams.get("days");
    const days = rawDays === null ? undefined : Number(rawDays);
    const repository = getRepository();
    const state = repository.snapshot();
    requirePetReadAccess(actor, state.pets.find((pet) => pet.id === petId), state);
    return ok(getHealthBandSummary(repository, petId, { days }));
  } catch (error) {
    return apiError(error);
  }
}

/** Creates a deterministic demo sync; real provider data belongs behind a verified webhook. */
export async function POST(request: NextRequest) {
  try {
    const actor = requireApiActor(request);
    const input = healthBandSyncSchema.parse(await body(request));
    const repository = getRepository();
    const pet = repository.snapshot().pets.find((item) => item.id === input.petId);
    if (!pet) throw new HealthBandError("Pet not found.", 404);
    if (!canWritePet(actor, pet)) throw new HealthBandError("You cannot sync a band for this pet.", 403);
    return ok(syncMockHealthBand(repository, input.petId, { scenario: input.scenario }), { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
