import { NextRequest } from "next/server";
import { apiError, ok, requireApiActor } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function GET(request: NextRequest) {
  try {
    requireApiActor(request); const { searchParams } = request.nextUrl;
    const query = (searchParams.get("q") ?? "").toLowerCase(); const city = (searchParams.get("city") ?? "").toLowerCase(); const specialization = (searchParams.get("specialization") ?? "").toLowerCase(); const minRating = Number(searchParams.get("minRating") ?? 0); const maxFee = Number(searchParams.get("maxFee") ?? Infinity);
    const rows = getRepository().listVeterinarians().filter((vet) => (!query || `${vet.name} ${vet.clinic} ${vet.location} ${vet.specialization.join(" ")}`.toLowerCase().includes(query)) && (!city || vet.location.toLowerCase().includes(city)) && (!specialization || vet.specialization.join(" ").toLowerCase().includes(specialization)) && vet.rating >= minRating && vet.consultationFee <= maxFee);
    return ok(rows);
  } catch (error) { return apiError(error); }
}
