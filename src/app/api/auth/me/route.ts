import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth";
import { apiError, ok } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";

/** Returns the signed-in account without ever exposing credential hashes. */
export async function GET(request: NextRequest) {
  try {
    const result = new AuthService(getRepository()).requireSession(
      request.cookies.get("petcare_session")?.value,
    );
    return ok({ user: result.user });
  } catch (error) {
    return apiError(error);
  }
}
