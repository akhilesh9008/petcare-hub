import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { AppointmentService } from "@/lib/appointments";
import { canManageAppointment, isAdministrator } from "@/lib/authorization";
import { getRepository } from "@/lib/repository";
import { appointmentCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) { try { const actor=requireApiActor(request);const repository=getRepository();const state=repository.snapshot();const rows=repository.listAppointments().filter((appointment)=>isAdministrator(actor)||canManageAppointment(actor,appointment,"READ",state));return ok(rows); }catch(error){return apiError(error);} }
export async function POST(request: NextRequest) { try {const actor=requireApiActor(request);const appointment=new AppointmentService(getRepository()).create(actor,appointmentCreateSchema.parse(await body(request)));return ok(appointment,{status:201});}catch(error){return apiError(error);} }
export async function PATCH(request: NextRequest) { try {const actor=requireApiActor(request);const payload=await body<{id:string;action:"confirm"|"cancel"|"reject"|"complete"|"notes";notes?:string}> (request);const service=new AppointmentService(getRepository());const result=payload.action==="confirm"?service.confirm(actor,payload.id):payload.action==="cancel"?service.cancel(actor,payload.id,payload.notes):payload.action==="reject"?service.reject(actor,payload.id,payload.notes):payload.action==="complete"?service.complete(actor,payload.id,payload.notes):service.addConsultationNotes(actor,payload.id,payload.notes??"");return ok(result);}catch(error){return apiError(error);} }
