import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

export async function POST(request: NextRequest) {
  try {
    new AuthService(getRepository()).logout(request.cookies.get("petcare_session")?.value);
    const response = ok({ loggedOut: true });
    response.cookies.delete("petcare_session"); response.cookies.delete("petcare_role");
    return response;
  } catch (error) { return apiError(error); }
}
