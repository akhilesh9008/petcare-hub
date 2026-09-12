import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest) { try { const actor=requireApiActor(request);return ok(getRepository().listNotifications(actor.id)); }catch(error){return apiError(error);} }
