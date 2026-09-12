import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { isAdministrator } from "@/lib/authorization";
import { getRepository, toPublicUser } from "@/lib/repository";

export async function GET(request: NextRequest) { try { const actor=requireApiActor(request);if(!isAdministrator(actor))throw Object.assign(new Error("Administrator access is required."),{statusCode:403});return ok(getRepository().listUsers().map(toPublicUser)); }catch(error){return apiError(error);} }
