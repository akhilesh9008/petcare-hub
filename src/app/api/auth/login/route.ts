import { NextRequest } from "next/server";
import { AuthService } from "@/lib/auth";
import { apiError, body, ok } from "@/lib/api-helpers";
import { getRepository } from "@/lib/repository";
import type { LoginInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const result = await new AuthService(getRepository()).login(await body<LoginInput>(request));
    const response = ok({ user: result.user });
    response.cookies.set("petcare_session", result.session.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", expires: new Date(result.session.expiresAt) });
    response.cookies.set("petcare_role", result.user.role, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
    return response;
  } catch (error) { return apiError(error); }
}
