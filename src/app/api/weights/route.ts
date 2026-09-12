import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { canWritePet, requirePetReadAccess } from "@/lib/authorization";
import { createId, getRepository, nowIso } from "@/lib/repository";
import { weightRecordInputSchema } from "@/lib/validation";

export async function GET(request: NextRequest) { try { const actor=requireApiActor(request);const petId=request.nextUrl.searchParams.get("petId");if(!petId)throw Object.assign(new Error("petId is required."),{statusCode:400});const repository=getRepository();const state=repository.snapshot();requirePetReadAccess(actor,state.pets.find((pet)=>pet.id===petId),state);return ok(repository.listWeightRecords(petId));}catch(error){return apiError(error);} }
export async function POST(request: NextRequest) { try { const actor=requireApiActor(request);const input=weightRecordInputSchema.parse(await body(request));const repository=getRepository();const value=repository.transaction((draft)=>{const pet=draft.pets.find((item)=>item.id===input.petId);if(!pet||!canWritePet(actor,pet))throw Object.assign(new Error("You cannot record weight for this pet."),{statusCode:pet?403:404});const existing=draft.weightRecords.find((item)=>item.petId===input.petId&&item.date===input.date);if(existing){Object.assign(existing,{...input,createdAt:existing.createdAt});return existing;}const entry={id:createId("weight"),...input,createdAt:nowIso()};draft.weightRecords.push(entry);return entry;});return ok(value,{status:201});}catch(error){return apiError(error);} }
