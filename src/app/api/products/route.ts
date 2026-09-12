import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest) { try { requireApiActor(request);const q=(request.nextUrl.searchParams.get("q")??"").toLowerCase();const category=request.nextUrl.searchParams.get("category");const min=Number(request.nextUrl.searchParams.get("minPrice")??0);const max=Number(request.nextUrl.searchParams.get("maxPrice")??Infinity);const rows=getRepository().listProducts().filter((product)=>product.isActive&&(!q||`${product.name} ${product.brand} ${product.tags.join(" ")}`.toLowerCase().includes(q))&&(!category||product.category===category)&&product.price>=min&&product.price<=max);return ok(rows);}catch(error){return apiError(error);} }
