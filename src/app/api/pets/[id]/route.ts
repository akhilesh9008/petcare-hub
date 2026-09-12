import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { requirePetReadAccess } from "@/lib/authorization";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try { const actor = requireApiActor(request); const { id } = await context.params; const repository = getRepository(); const state = repository.snapshot(); const pet = state.pets.find((item) => item.id === id); requirePetReadAccess(actor, pet, state); return ok(pet); } catch (error) { return apiError(error); }
}
