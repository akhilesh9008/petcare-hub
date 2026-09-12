import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest) { try { requireApiActor(request);const q=(request.nextUrl.searchParams.get("q")??"").toLowerCase();const category=request.nextUrl.searchParams.get("category");const repository=getRepository();const services=repository.listServices().filter((service)=>service.isActive&&(!category||service.category===category)&&(!q||`${service.name} ${service.description} ${service.category}`.toLowerCase().includes(q)));return ok({services,providers:repository.listServiceProviders()});}catch(error){return apiError(error);} }
