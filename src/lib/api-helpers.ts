import { NextRequest, NextResponse } from "next/server";
import type { Actor } from "@/lib/authorization";
import { AuthService } from "@/lib/auth";
import { getRepository } from "@/lib/repository";

export function requireApiActor(request: NextRequest): Actor {
  const result = new AuthService(getRepository()).getSession(request.cookies.get("petcare_session")?.value);
  if (!result) {
    const error = new Error("Authentication is required.") as Error & { statusCode: number };
    error.statusCode = 401;
    throw error;
  }
  const user = result.user;
  return { id: user.id, role: user.role, isActive: user.isActive };
}

export function apiError(error: unknown) {
  const typed = error as { message?: string; statusCode?: number; issues?: unknown };
  const status = typed.statusCode ?? (typed.issues ? 422 : 500);
  return NextResponse.json({ error: typed.message ?? "Something went wrong.", issues: typed.issues }, { status });
}

export function ok(data: unknown, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export async function body<T = unknown>(request: NextRequest): Promise<T> {
  try { return await request.json() as T; } catch {
    const error = new Error("Request body must be valid JSON.") as Error & { statusCode: number };
    error.statusCode = 400;
    throw error;
  }
}

export function timestamped<T extends object>(value: T) {
  const now = new Date().toISOString();
  return { ...value, createdAt: now, updatedAt: now };
}
