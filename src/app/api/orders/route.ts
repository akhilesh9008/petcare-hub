import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { CartService } from "@/lib/cart";
import { isAdministrator } from "@/lib/authorization";
import { getRepository } from "@/lib/repository";
import type { CheckoutInput } from "@/lib/validation";

export async function GET(request: NextRequest) {try{const actor=requireApiActor(request);return ok(getRepository().listOrders(isAdministrator(actor)?undefined:actor.id));}catch(error){return apiError(error);}}
export async function POST(request: NextRequest) {try{const actor=requireApiActor(request);const order=new CartService(getRepository()).checkout(actor,await body<CheckoutInput>(request));return ok(order,{status:201});}catch(error){return apiError(error);}}
