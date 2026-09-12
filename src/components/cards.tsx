"use client";

import type { ReactNode } from "react";
import {
  BellRing,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  MapPin,
  Package,
  PawPrint,
  Repeat2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Stethoscope,
} from "lucide-react";

import { Avatar, Badge, Button, Card, type BadgeTone } from "./ui";
import { cn, formatCurrency, formatDate, formatTime } from "./utils";

function CardTextAction({
  href,
  onClick,
  label = "View details",
  className,
}: {
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}) {
  const content = (
    <>
      {label}
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
    </>
  );

  const classes = cn(
    "inline-flex items-center gap-0.5 rounded-lg text-sm font-semibold text-teal-700 transition hover:text-teal-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
    className,
  );

  if (href) {
    return <a href={href} className={classes}>{content}</a>;
  }

  if (onClick) {
    return <button type="button" onClick={onClick} className={classes}>{content}</button>;
  }

  return null;
}

export type PetHealthStatus = "excellent" | "good" | "attention" | "overdue" | "unknown";

export interface PetCardData {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  age?: string;
  weight?: string | number;
  imageUrl?: string | null;
  healthStatus?: PetHealthStatus;
  nextCare?: string;
}

const petStatus: Record<PetHealthStatus, { label: string; tone: BadgeTone }> = {
  excellent: { label: "Excellent", tone: "green" },
  good: { label: "On track", tone: "teal" },
  attention: { label: "Needs attention", tone: "orange" },
  overdue: { label: "Care overdue", tone: "red" },
  unknown: { label: "Health status", tone: "slate" },
};

export interface PetCardProps {
  pet: PetCardData;
  href?: string;
  onEdit?: () => void;
  compact?: boolean;
  className?: string;
}

export function PetCard({ pet, href, onEdit, compact = false, className }: PetCardProps) {
  const status = petStatus[pet.healthStatus ?? "unknown"];

  return (
    <Card padding="none" hoverable className={cn("overflow-hidden", className)}>
      <div className={cn("relative bg-gradient-to-br from-teal-50 via-white to-sky-50", compact ? "p-4" : "p-5")}>
        <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-[4rem] bg-teal-100/70" aria-hidden="true" />
        <div className="relative flex items-start gap-3.5">
          <Avatar src={pet.imageUrl} name={pet.name} size={compact ? "md" : "lg"} className="rounded-2xl ring-4 ring-white" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900">{pet.name}</h3>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {[pet.breed, pet.species].filter(Boolean).join(" · ") || "Pet profile"}
                </p>
              </div>
              <Badge tone={status.tone} className="shrink-0">{status.label}</Badge>
            </div>
            {!compact ? (
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-slate-600">
                {pet.age ? <span>{pet.age}</span> : null}
                {pet.weight !== undefined && pet.weight !== null ? <span>{pet.weight}{typeof pet.weight === "number" ? " kg" : ""}</span> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {!compact ? (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3.5">
          <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
            <HeartPulse className="h-4 w-4 shrink-0 text-teal-600" aria-hidden="true" />
            <span className="truncate">{pet.nextCare ?? "No care due soon"}</span>
          </span>
          <CardTextAction href={href} onClick={onEdit} label={onEdit ? "Edit" : "Profile"} className="shrink-0" />
        </div>
      ) : null}
    </Card>
  );
}

export type AppointmentStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "CANCELED";

export interface AppointmentCardData {
  id: string;
  petName: string;
  veterinarianName: string;
  clinicName?: string;
  date: string | Date;
  time?: string | Date;
  type?: "IN_PERSON" | "ONLINE" | string;
  status: AppointmentStatus | string;
  reason?: string;
  veterinarianImageUrl?: string | null;
}

const appointmentStatusTone = (status: string): BadgeTone => {
  switch (status.toUpperCase()) {
    case "CONFIRMED":
    case "COMPLETED":
      return "green";
    case "PENDING":
      return "orange";
    case "CANCELLED":
    case "CANCELED":
      return "red";
    default:
      return "slate";
  }
};

export interface AppointmentCardProps {
  appointment: AppointmentCardData;
  href?: string;
  onCancel?: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  className?: string;
}

export function AppointmentCard({
  appointment,
  href,
  onCancel,
  onPrimaryAction,
  primaryActionLabel = "View appointment",
  className,
}: AppointmentCardProps) {
  const normalizedStatus = appointment.status.replace(/_/g, " ").toLowerCase();
  const canCancel = ["PENDING", "CONFIRMED"].includes(appointment.status.toUpperCase());

  return (
    <Card className={cn("p-0", className)}>
      <div className="flex gap-3 p-4 sm:p-5">
        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-sky-50 text-sky-800">
          <span className="text-[11px] font-bold uppercase tracking-wide">{formatDate(appointment.date, { month: "short" })}</span>
          <span className="text-lg font-extrabold leading-4">{formatDate(appointment.date, { day: "numeric" })}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-bold text-slate-900">{appointment.veterinarianName}</h3>
              <p className="mt-0.5 truncate text-sm text-slate-500">{appointment.clinicName ?? "Veterinary consultation"}</p>
            </div>
            <Badge tone={appointmentStatusTone(appointment.status)} className="capitalize">
              {normalizedStatus}
            </Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium text-slate-600">
            <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{formatTime(appointment.time)}</span>
            <span className="flex items-center gap-1.5"><PawPrint className="h-3.5 w-3.5 text-slate-400" />{appointment.petName}</span>
            {appointment.type ? <span className="capitalize">{appointment.type.replace(/_/g, " ").toLowerCase()}</span> : null}
          </div>
          {appointment.reason ? <p className="mt-2 line-clamp-1 text-xs text-slate-500">{appointment.reason}</p> : null}
        </div>
      </div>
      {(href || onPrimaryAction || (onCancel && canCancel)) ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
          {onCancel && canCancel ? <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button> : null}
          {onPrimaryAction ? <Button size="sm" onClick={onPrimaryAction}>{primaryActionLabel}</Button> : null}
          {!onPrimaryAction && href ? <CardTextAction href={href} label={primaryActionLabel} /> : null}
        </div>
      ) : null}
    </Card>
  );
}

export type ReminderStatus = "UPCOMING" | "DUE_TODAY" | "OVERDUE" | "COMPLETED" | string;

export interface ReminderCardData {
  id: string;
  title: string;
  petName?: string;
  dueDate: string | Date;
  dueTime?: string | Date;
  type?: string;
  description?: string;
  status?: ReminderStatus;
  recurring?: boolean;
}

export interface ReminderCardProps {
  reminder: ReminderCardData;
  href?: string;
  onComplete?: () => void;
  onSnooze?: () => void;
  className?: string;
}

export function ReminderCard({ reminder, href, onComplete, onSnooze, className }: ReminderCardProps) {
  const status = (reminder.status ?? "UPCOMING").toUpperCase();
  const tone: BadgeTone = status === "OVERDUE" ? "red" : status === "COMPLETED" ? "green" : status === "DUE_TODAY" ? "orange" : "teal";
  const canComplete = status !== "COMPLETED";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <div className={cn("absolute bottom-0 left-0 top-0 w-1", status === "OVERDUE" ? "bg-rose-500" : status === "COMPLETED" ? "bg-emerald-500" : "bg-teal-500")} aria-hidden="true" />
      <div className="flex gap-3 pl-1">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
          <BellRing className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className={cn("truncate text-sm font-bold text-slate-900", status === "COMPLETED" && "text-slate-500 line-through")}>{reminder.title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{[reminder.petName, reminder.type].filter(Boolean).join(" · ")}</p>
            </div>
            <Badge tone={tone} className="shrink-0 capitalize">{status.replace(/_/g, " ").toLowerCase()}</Badge>
          </div>
          {reminder.description ? <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-600">{reminder.description}</p> : null}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-slate-400" />{formatDate(reminder.dueDate)}</span>
            {reminder.dueTime ? <span className="flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-slate-400" />{formatTime(reminder.dueTime)}</span> : null}
            {reminder.recurring ? <span className="flex items-center gap-1.5"><Repeat2 className="h-3.5 w-3.5 text-slate-400" />Recurring</span> : null}
          </div>
        </div>
      </div>
      {(href || onComplete || onSnooze) ? (
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
          {onSnooze && canComplete ? <Button variant="ghost" size="sm" onClick={onSnooze}>Snooze</Button> : null}
          {onComplete && canComplete ? <Button variant="outline" size="sm" leftIcon={<CheckCircle2 className="h-4 w-4" />} onClick={onComplete}>Complete</Button> : null}
          {href ? <CardTextAction href={href} /> : null}
        </div>
      ) : null}
    </Card>
  );
}

export interface ProductCardData {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  originalPrice?: number | null;
  rating?: number | null;
  reviewCount?: number | null;
  brand?: string;
  category?: string;
  species?: string;
  stock?: number | null;
  badge?: string;
  recommendationReason?: string;
}

export interface ProductCardProps {
  product: ProductCardData;
  href?: string;
  onAddToCart?: () => void;
  addToCartLabel?: string;
  className?: string;
}

export function ProductCard({ product, href, onAddToCart, addToCartLabel = "Add", className }: ProductCardProps) {
  const discounted = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discount = discounted && product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const outOfStock = product.stock !== undefined && product.stock !== null && product.stock <= 0;

  return (
    <Card padding="none" hoverable className={cn("group overflow-hidden", className)}>
      <div className="relative aspect-[5/4] overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid h-full place-items-center bg-gradient-to-br from-sky-50 to-teal-50 text-teal-700"><Package className="h-10 w-10" aria-hidden="true" /></div>
        )}
        {product.badge || discounted ? (
          <Badge tone="orange" className="absolute left-3 top-3 shadow-sm">{product.badge ?? `${discount}% off`}</Badge>
        ) : null}
        {outOfStock ? <Badge tone="slate" className="absolute right-3 top-3 shadow-sm">Out of stock</Badge> : null}
      </div>
      <div className="p-4">
        <div className="min-h-11">
          {product.brand ? <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">{product.brand}</p> : null}
          <h3 className="line-clamp-2 text-sm font-bold leading-5 text-slate-900">{product.name}</h3>
        </div>
        {product.rating ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-700"><Star className="h-3 w-3 fill-current" aria-hidden="true" />{product.rating.toFixed(1)}</span>
            {product.reviewCount ? <span>({product.reviewCount})</span> : null}
          </div>
        ) : null}
        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <span className="block text-base font-extrabold tracking-tight text-slate-900">{formatCurrency(product.price)}</span>
            {discounted && product.originalPrice ? <span className="text-xs text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span> : null}
          </div>
          {onAddToCart ? (
            <Button size="sm" variant="primary" onClick={onAddToCart} disabled={outOfStock} leftIcon={<ShoppingCart className="h-3.5 w-3.5" />}>
              {outOfStock ? "Sold out" : addToCartLabel}
            </Button>
          ) : href ? <CardTextAction href={href} label="View" /> : null}
        </div>
        {product.recommendationReason ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-teal-50 px-2.5 py-2 text-xs leading-4 text-teal-800"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{product.recommendationReason}</p>
        ) : null}
      </div>
    </Card>
  );
}

export interface VetCardData {
  id: string;
  name: string;
  specialization: string;
  clinicName?: string;
  location?: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  yearsExperience?: number | null;
  consultationFee?: number | null;
  nextAvailable?: string;
  verified?: boolean;
}

export interface VetCardProps {
  vet: VetCardData;
  href?: string;
  onBook?: () => void;
  bookLabel?: string;
  className?: string;
}

export function VetCard({ vet, href, onBook, bookLabel = "Book visit", className }: VetCardProps) {
  return (
    <Card hoverable className={cn("p-0", className)}>
      <div className="p-4 sm:p-5">
        <div className="flex gap-3.5">
          <Avatar src={vet.imageUrl} name={vet.name} size="lg" className="rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-slate-900">{vet.name}</h3>
                <p className="mt-0.5 truncate text-sm font-medium text-teal-700">{vet.specialization}</p>
              </div>
              {vet.verified ? <ShieldCheck className="h-5 w-5 shrink-0 text-teal-600" aria-label="Verified profile" /> : null}
            </div>
            <p className="mt-1.5 truncate text-sm text-slate-500">{vet.clinicName ?? "Veterinary professional"}</p>
            {vet.location ? <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{vet.location}</p> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-100 py-3 text-xs font-semibold text-slate-600">
          {vet.rating ? <span className="flex items-center gap-1 text-amber-700"><Star className="h-3.5 w-3.5 fill-current" />{vet.rating.toFixed(1)}{vet.reviewCount ? <span className="font-medium text-slate-400">({vet.reviewCount})</span> : null}</span> : null}
          {vet.yearsExperience ? <span>{vet.yearsExperience}+ yrs experience</span> : null}
          {vet.consultationFee ? <span>{formatCurrency(vet.consultationFee)}</span> : null}
        </div>
        {vet.nextAvailable ? <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CalendarDays className="h-3.5 w-3.5" />{vet.nextAvailable}</p> : null}
      </div>
      {(href || onBook) ? (
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 sm:px-5">
          {href ? <CardTextAction href={href} label="Profile" /> : <span />}
          {onBook ? <Button size="sm" onClick={onBook} leftIcon={<Stethoscope className="h-3.5 w-3.5" />}>{bookLabel}</Button> : null}
        </div>
      ) : null}
    </Card>
  );
}

export interface ServiceCardData {
  id: string;
  providerName: string;
  serviceName: string;
  location?: string;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  price?: number | null;
  priceSuffix?: string;
  availability?: string;
  featured?: boolean;
  description?: string;
}

export interface ServiceCardProps {
  service: ServiceCardData;
  href?: string;
  onBook?: () => void;
  bookLabel?: string;
  className?: string;
  footer?: ReactNode;
}

export function ServiceCard({ service, href, onBook, bookLabel = "Book service", className, footer }: ServiceCardProps) {
  return (
    <Card padding="none" hoverable className={cn("overflow-hidden", className)}>
      <div className="relative aspect-[16/9] bg-slate-100">
        {service.imageUrl ? <img src={service.imageUrl} alt={service.serviceName} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center bg-gradient-to-br from-sky-50 to-teal-50 text-teal-700"><Briefcase className="h-10 w-10" aria-hidden="true" /></div>}
        {service.featured ? <Badge tone="orange" className="absolute left-3 top-3 shadow-sm"><Sparkles className="h-3 w-3" />Featured</Badge> : null}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">{service.serviceName}</p>
            <h3 className="mt-1 truncate text-base font-bold text-slate-900">{service.providerName}</h3>
          </div>
          {service.rating ? <span className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-amber-700"><Star className="h-3.5 w-3.5 fill-current" />{service.rating.toFixed(1)}</span> : null}
        </div>
        {service.location ? <p className="mt-2 flex items-center gap-1.5 truncate text-sm text-slate-500"><MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />{service.location}</p> : null}
        {service.description ? <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-600">{service.description}</p> : null}
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            {service.price !== undefined && service.price !== null ? <p className="text-base font-extrabold text-slate-900">{formatCurrency(service.price)}<span className="ml-1 text-xs font-medium text-slate-500">{service.priceSuffix ?? "starting"}</span></p> : null}
            {service.availability ? <p className="mt-1 text-xs font-semibold text-emerald-700">{service.availability}</p> : null}
          </div>
          {onBook ? <Button size="sm" onClick={onBook}>{bookLabel}</Button> : href ? <CardTextAction href={href} label="Details" /> : null}
        </div>
        {footer ? <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div> : null}
      </div>
    </Card>
  );
}
