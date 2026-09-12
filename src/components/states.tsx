"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, Loader2, RefreshCw, Sparkles } from "lucide-react";

import { Button, Card } from "./ui";
import { cn } from "./utils";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-12 sm:py-16", className)}>
      <span className={cn("grid place-items-center rounded-3xl bg-gradient-to-br from-teal-50 to-sky-50 text-teal-700", compact ? "h-12 w-12" : "h-16 w-16")}>
        <Icon className={compact ? "h-6 w-6" : "h-8 w-8"} aria-hidden="true" />
      </span>
      <h3 className={cn("mt-4 font-bold tracking-tight text-slate-900", compact ? "text-base" : "text-lg")}>{title}</h3>
      {description ? <p className={cn("mt-1.5 max-w-md leading-6 text-slate-500", compact ? "text-sm" : "text-sm")}>{description}</p> : null}
      {action ?? (actionLabel && onAction ? <Button className="mt-5" onClick={onAction}>{actionLabel}</Button> : null)}
    </div>
  );
}

export interface LoadingStateProps {
  label?: string;
  fullPage?: boolean;
  className?: string;
}

export function LoadingState({ label = "Loading your pet care data…", fullPage = false, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        fullPage ? "min-h-[60vh] px-6" : "min-h-48 px-4 py-10",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /></span>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <span className="sr-only">Please wait.</span>
    </div>
  );
}

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this information. Please check your connection and try again.",
  onRetry,
  retryLabel = "Try again",
  action,
  className,
  compact = false,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center", compact ? "px-4 py-8" : "px-6 py-12 sm:py-16", className)} role="alert">
      <span className={cn("grid place-items-center rounded-3xl bg-rose-50 text-rose-600", compact ? "h-12 w-12" : "h-16 w-16")}>
        <AlertCircle className={compact ? "h-6 w-6" : "h-8 w-8"} aria-hidden="true" />
      </span>
      <h3 className={cn("mt-4 font-bold tracking-tight text-slate-900", compact ? "text-base" : "text-lg")}>{title}</h3>
      <p className="mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ?? (onRetry ? <Button variant="outline" className="mt-5" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={onRetry}>{retryLabel}</Button> : null)}
    </div>
  );
}

export interface CardSkeletonProps {
  className?: string;
  lines?: number;
  hasAvatar?: boolean;
}

export function CardSkeleton({ className, lines = 3, hasAvatar = false }: CardSkeletonProps) {
  return (
    <Card className={cn("animate-pulse", className)} aria-hidden="true">
      <div className="flex gap-3">
        {hasAvatar ? <span className="h-12 w-12 shrink-0 rounded-2xl bg-slate-200" /> : null}
        <div className="min-w-0 flex-1 space-y-3">
          {Array.from({ length: lines }, (_, index) => (
            <span
              key={index}
              className={cn("block h-3 rounded-full bg-slate-200", index === 0 ? "w-3/5" : index === lines - 1 ? "w-2/5" : "w-full")}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

export interface GridSkeletonProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

export function GridSkeleton({ count = 3, className, itemClassName }: GridSkeletonProps) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", className)} aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => <CardSkeleton key={index} className={itemClassName} hasAvatar />)}
    </div>
  );
}

export function InlineLoading({ label = "Updating…", className }: { label?: string; className?: string }) {
  return <span className={cn("inline-flex items-center gap-2 text-sm font-medium text-slate-500", className)} role="status"><Loader2 className="h-4 w-4 animate-spin text-teal-600" aria-hidden="true" />{label}</span>;
}

export function SuccessHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm leading-5 text-emerald-800", className)}><Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />{children}</p>;
}
