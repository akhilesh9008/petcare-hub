import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor, timestamped } from "@/lib/api-helpers";
import { isAdministrator, requirePetWriteAccess } from "@/lib/authorization";
import { createId, getRepository } from "@/lib/repository";
import { petInputSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try { const actor = requireApiActor(request); const repository = getRepository(); return ok(repository.listPets(isAdministrator(actor) ? undefined : actor.id)); } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  try { const actor = requireApiActor(request); const data = petInputSchema.parse(await body(request)); if (actor.role !== "PET_OWNER" && !isAdministrator(actor)) throw Object.assign(new Error("Only pet owners can create pet profiles."), { statusCode: 403 }); const pet = timestamped({ id: createId("pet"), ownerId: actor.id, ...data }); getRepository().transaction((draft) => draft.pets.push(pet)); return ok(pet, { status: 201 }); } catch (error) { return apiError(error); }
}
export async function PATCH(request: NextRequest) {
  try { const actor = requireApiActor(request); const payload = await body<{ id: string; patch: unknown }>(request); const patch = petInputSchema.partial().parse(payload.patch); const repository = getRepository(); const updated = repository.transaction((draft) => { const pet = draft.pets.find((item) => item.id === payload.id); requirePetWriteAccess(actor, pet); Object.assign(pet, patch, { updatedAt: new Date().toISOString() }); return pet; }); return ok(updated); } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest) {
  try { const actor = requireApiActor(request); const id = request.nextUrl.searchParams.get("id"); if (!id) throw Object.assign(new Error("Pet id is required."), { statusCode: 400 }); const repository = getRepository(); repository.transaction((draft) => { const pet = draft.pets.find((item) => item.id === id); requirePetWriteAccess(actor, pet); draft.pets = draft.pets.filter((item) => item.id !== id); }); return ok({ deleted: true }); } catch (error) { return apiError(error); }
}
