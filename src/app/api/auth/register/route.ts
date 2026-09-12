import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { apiError, body, ok } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";
import type { RegisterInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Local workspaces can demonstrate each account type. Never allow public
    // professional-role creation in production until a real verification flow
    // (licence, identity and business review) is connected.
    const allowLocalProfessionalRoles = process.env.NODE_ENV !== "production"
      && process.env.ALLOW_SELF_SERVICE_PROFESSIONAL_ROLES !== "false";
    const result = await new AuthService(getRepository(), { allowSelfServiceRoles: allowLocalProfessionalRoles }).register(await body<RegisterInput>(request));
    const response = ok({ user: result.user }, { status: 201 });
    response.cookies.set("petcare_session", result.session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(result.session.expiresAt) });
    response.cookies.set("petcare_role", result.user.role, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
    return response;
  } catch (error) { return apiError(error); }
}
