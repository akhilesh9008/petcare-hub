import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/dashboard", "/pets", "/passport", "/calendar", "/emergency", "/health", "/health-band", "/veterinarians", "/appointments", "/breeding", "/social", "/places", "/marketplace", "/cart", "/checkout", "/orders", "/services", "/reminders", "/ai-assistant", "/profile", "/veterinarian", "/provider", "/admin", "/onboarding", "/professional-onboarding"];

export function middleware(request: NextRequest) {
  if (!protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))) return NextResponse.next();
  if (!request.cookies.get("petcare_session")?.value) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  const role = request.cookies.get("petcare_role")?.value;
  const path = request.nextUrl.pathname;
  const workspaceForRole: Record<string, string> = {
    PET_OWNER: "/dashboard",
    VETERINARIAN: "/veterinarian",
    SERVICE_PROVIDER: "/provider",
    ADMIN: "/admin",
  };
  const isVeterinarianWorkspace = path === "/veterinarian" || path.startsWith("/veterinarian/");
  const isProviderWorkspace = path === "/provider" || path.startsWith("/provider/");
  const isAdminWorkspace = path === "/admin" || path.startsWith("/admin/");
  const requiredRole = isVeterinarianWorkspace ? "VETERINARIAN"
    : isProviderWorkspace ? "SERVICE_PROVIDER"
      : isAdminWorkspace ? "ADMIN"
        : undefined;
  const isProfessionalOnboarding = path.startsWith("/professional-onboarding");

  if (requiredRole && role !== requiredRole && role !== "ADMIN") {
    return NextResponse.redirect(new URL(workspaceForRole[role ?? ""] ?? "/dashboard", request.url));
  }
  if (isProfessionalOnboarding && role !== "VETERINARIAN" && role !== "SERVICE_PROVIDER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(workspaceForRole[role ?? ""] ?? "/dashboard", request.url));
  }
  if (!requiredRole && !isProfessionalOnboarding && role && role !== "PET_OWNER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL(workspaceForRole[role] ?? "/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
