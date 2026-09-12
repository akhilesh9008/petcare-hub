import { NextRequest } from "next/server";
import { apiError, body, ok, requireApiActor } from "@/lib/api-helpers";
import { CartService } from "@/lib/cart";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest) { try { const actor=requireApiActor(request);const service=new CartService(getRepository());return ok(service.getTotals(actor)); }catch(error){return apiError(error);} }
export async function POST(request: NextRequest) { try {const actor=requireApiActor(request);const payload=await body<{productId:string;quantity?:number;operation?:"remove"|"set"}> (request);const service=new CartService(getRepository());const cart=payload.operation==="remove"?service.removeItem(actor,payload.productId):payload.operation==="set"?service.updateQuantity(actor,{productId:payload.productId,quantity:payload.quantity??1}):service.addItem(actor,{productId:payload.productId,quantity:payload.quantity??1});return ok(cart);}catch(error){return apiError(error);} }
