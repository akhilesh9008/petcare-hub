import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) { try { requireApiActor(request); const { id }=await context.params; const vet=getRepository().getVeterinarian(id); if(!vet) throw Object.assign(new Error("Veterinarian not found."),{statusCode:404});return ok(vet); }catch(error){return apiError(error);} }
