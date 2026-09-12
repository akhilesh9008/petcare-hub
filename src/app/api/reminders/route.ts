import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { isAdministrator } from "@/lib/authorization";
import { createId, getRepository, nowIso } from "@/lib/repository";
import { createReminder, setReminderStatus } from "@/lib/reminders";
import { reminderInputSchema } from "@/lib/validation";

export async function GET(request:NextRequest){try{const actor=requireApiActor(request);const petId=request.nextUrl.searchParams.get("petId")??undefined;return ok(getRepository().listReminders(isAdministrator(actor)?request.nextUrl.searchParams.get("ownerId")??actor.id:actor.id,petId));}catch(error){return apiError(error);}}
export async function POST(request:NextRequest){try{const actor=requireApiActor(request);const reminder=createReminder(getRepository(),actor,reminderInputSchema.parse(await body(request)));return ok(reminder,{status:201});}catch(error){return apiError(error);}}
export async function PATCH(request:NextRequest){try{const actor=requireApiActor(request);const payload=await body<{id:string;status:"COMPLETED"|"DISMISSED"}> (request);return ok(setReminderStatus(getRepository(),actor,payload.id,payload.status));}catch(error){return apiError(error);}}
