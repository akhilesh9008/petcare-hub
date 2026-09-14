"use client";

import { ReactNode, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity, Bot, CalendarDays, ClipboardList, HeartHandshake, HeartPulse, Home, Images, LayoutDashboard, MapPinned, Package, PawPrint, QrCode, Settings, ShieldAlert, ShoppingBag, Sparkles, Stethoscope, UserRound, UsersRound, Watch,
} from "lucide-react";
import { AppShell, type NavigationItem } from "@/components";
import { clearDemoSession } from "@/features/auth/session";
import { LanguageSelector, useLanguage } from "@/features/language";
import { usePetcare } from "@/features/petcare-store";

const ownerNavigation: NavigationItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home, exact: true },
  { label: "My Pets", href: "/pets", icon: PawPrint },
  { label: "Pet Insights", href: "/insights", icon: Sparkles },
  { label: "Digital passport", href: "/passport", icon: QrCode },
  { label: "Health", href: "/health", icon: HeartPulse },
  { label: "Health Band", href: "/health-band", icon: Watch },
  { label: "Veterinarians", href: "/veterinarians", icon: Stethoscope },
  { label: "Appointments", href: "/appointments", icon: CalendarDays },
  { label: "Care calendar", href: "/calendar", icon: CalendarDays },
  { label: "Breeding match", href: "/breeding", icon: HeartHandshake },
  { label: "Pet social", href: "/social", icon: Images },
  { label: "Pet-friendly places", href: "/places", icon: MapPinned },
  { label: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { label: "Services", href: "/services", icon: Sparkles },
  { label: "Reminders", href: "/reminders", icon: ClipboardList },
  { label: "PetCare AI", href: "/ai-assistant", icon: Bot },
  { label: "Emergency", href: "/emergency", icon: ShieldAlert },
  { label: "Orders", href: "/orders", icon: Package },
];

const roleNavigation: Record<string, NavigationItem[]> = {
  VETERINARIAN: [
    { label: "Overview", href: "/veterinarian", icon: LayoutDashboard, exact: true },
    { label: "Appointments", href: "/veterinarian?tab=appointments", icon: CalendarDays },
    { label: "Patients", href: "/veterinarian?tab=patients", icon: UsersRound },
    { label: "Availability", href: "/veterinarian?tab=availability", icon: Activity },
  ],
  SERVICE_PROVIDER: [
    { label: "Overview", href: "/provider", icon: LayoutDashboard, exact: true },
    { label: "Bookings", href: "/provider?tab=bookings", icon: CalendarDays },
    { label: "Services", href: "/provider?tab=services", icon: Sparkles },
    { label: "Profile", href: "/provider?tab=profile", icon: UserRound },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Users", href: "/admin?tab=users", icon: UsersRound },
    { label: "Products", href: "/admin?tab=products", icon: ShoppingBag },
    { label: "Operations", href: "/admin?tab=operations", icon: ClipboardList },
  ],
};

const navigationTranslationKeys: Record<string, string> = {
  "Dashboard": "nav.dashboard",
  "My Pets": "nav.pets",
  "Pet Insights": "nav.insights",
  "Digital passport": "nav.passport",
  "Health": "nav.health",
  "Health Band": "nav.healthBand",
  "Veterinarians": "nav.veterinarians",
  "Appointments": "nav.appointments",
  "Care calendar": "nav.calendar",
  "Breeding match": "nav.breeding",
  "Pet social": "nav.social",
  "Pet-friendly places": "nav.places",
  "Marketplace": "nav.marketplace",
  "Services": "nav.services",
  "Reminders": "nav.reminders",
  "PetCare AI": "nav.ai",
  "Emergency": "nav.emergency",
  "Orders": "nav.orders",
  "Profile": "nav.profile",
  "Settings": "nav.settings",
  "Overview": "nav.overview",
  "Patients": "nav.patients",
  "Availability": "nav.availability",
  "Bookings": "nav.bookings",
  "Switch workspace": "nav.switchWorkspace",
  "Users": "nav.users",
  "Products": "nav.products",
  "Operations": "nav.operations",
};

interface WorkspaceShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  role?: "PET_OWNER" | "VETERINARIAN" | "SERVICE_PROVIDER" | "ADMIN";
}

export function WorkspaceShell({ children, title, subtitle, actions, role = "PET_OWNER" }: WorkspaceShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, reminders, cart } = usePetcare();
  const navigation = useMemo(() => {
    const items = role === "PET_OWNER" ? ownerNavigation : roleNavigation[role];
    return items.map((item) => ({ ...item, label: t(navigationTranslationKeys[item.label], item.label) }));
  }, [role, t]);
  const footer = useMemo<NavigationItem[]>(() => (role === "PET_OWNER"
    ? [
        { id: "profile", label: "Profile", href: "/profile", icon: UserRound },
        { id: "settings", label: "Settings", href: "/profile?tab=settings", icon: Settings },
      ]
    : [{ label: "Switch workspace", href: "/login", icon: UserRound }]).map((item) => ({ ...item, label: t(navigationTranslationKeys[item.label], item.label) })), [role, t]);
  const notificationCount = reminders.filter((item) => item.status !== "DONE").length;
  const displayUser = user;

  return (
    <AppShell
      navigation={navigation}
      footerNavigation={footer}
      activeHref={pathname}
      title={title}
      subtitle={subtitle}
      user={{ name: displayUser.name, email: displayUser.email, roleLabel: role.split("_").map((word) => word[0] + word.slice(1).toLowerCase()).join(" "), profileHref: "/profile" }}
      headerActions={<div className="flex items-center gap-2"><LanguageSelector compact />{actions}</div>}
      notificationCount={notificationCount + cart.reduce((sum, item) => sum + item.quantity, 0)}
      onNotificationClick={() => router.push("/reminders")}
      onSignOut={() => { void fetch("/api/auth/logout", { method: "POST" }); clearDemoSession(); router.push("/"); router.refresh(); }}
    >
      <div className="app-page">{children}</div>
    </AppShell>
  );
}

export function formatPetAge(birthDate: string) {
  const start = new Date(`${birthDate}T12:00:00`);
  const months = Math.max(0, Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)));
  if (months < 12) return `${months} mo`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  return remainder ? `${years} yr ${remainder} mo` : `${years} yrs`;
}

export function formatDate(value: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(`${value}T12:00:00`));
}

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
