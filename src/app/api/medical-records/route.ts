import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { canWriteMedicalRecord, requirePetReadAccess } from "@/lib/authorization";
import { createId, getRepository, nowIso } from "@/lib/repository";
import { medicalRecordInputSchema, type MedicalRecordInput } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try { const actor = requireApiActor(request); const petId = request.nextUrl.searchParams.get("petId"); if (!petId) throw Object.assign(new Error("petId is required."), { statusCode: 400 }); const repository = getRepository(); const state = repository.snapshot(); requirePetReadAccess(actor, state.pets.find((pet) => pet.id === petId), state); return ok(repository.listMedicalRecords(petId)); } catch (error) { return apiError(error); }
}
export async function POST(request: NextRequest) {
  try { const actor = requireApiActor(request); const input = medicalRecordInputSchema.parse(await body<MedicalRecordInput>(request)); const repository = getRepository(); const record = repository.transaction((draft) => { if (!canWriteMedicalRecord(actor, { petId: input.petId }, draft)) throw Object.assign(new Error("You cannot add a medical record for this pet."), { statusCode: 403 }); const value = { id: createId("record"), ...input, createdAt: nowIso(), updatedAt: nowIso() }; draft.medicalRecords.push(value); return value; }); return ok(record, { status: 201 }); } catch (error) { return apiError(error); }
}
export async function PATCH(request: NextRequest) {
  try { const actor = requireApiActor(request); const payload = await body<{ id: string; patch: Partial<MedicalRecordInput> }>(request); const repository = getRepository(); const record = repository.transaction((draft) => { const current = draft.medicalRecords.find((item) => item.id === payload.id); if (!current || !canWriteMedicalRecord(actor, current, draft)) throw Object.assign(new Error("You cannot update this medical record."), { statusCode: current ? 403 : 404 }); const patch = medicalRecordInputSchema.partial().parse(payload.patch); Object.assign(current, patch, { updatedAt: nowIso() }); return current; }); return ok(record); } catch (error) { return apiError(error); }
}
export async function DELETE(request: NextRequest) {
  try { const actor = requireApiActor(request); const id = request.nextUrl.searchParams.get("id"); const repository = getRepository(); repository.transaction((draft) => { const record = draft.medicalRecords.find((item) => item.id === id); if (!record || !canWriteMedicalRecord(actor, record, draft)) throw Object.assign(new Error("You cannot delete this medical record."), { statusCode: record ? 403 : 404 }); draft.medicalRecords = draft.medicalRecords.filter((item) => item.id !== id); }); return ok({ deleted: true }); } catch (error) { return apiError(error); }
}
