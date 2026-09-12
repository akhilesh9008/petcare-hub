"use client";

import {
  forwardRef,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { Check, Loader2 } from "lucide-react";

import { cn, getInitials } from "./utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "coral";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[#0b6b62] text-white shadow-[0_10px_18px_-12px_rgba(8,86,78,.75)] hover:bg-[#07564f] hover:shadow-[0_15px_24px_-14px_rgba(8,86,78,.8)] focus-visible:outline-teal-600",
  secondary:
    "bg-[#eaf5fc] text-sky-900 hover:bg-[#dceffc] focus-visible:outline-sky-600",
  outline:
    "border border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-teal-600",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-500",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 focus-visible:outline-rose-600",
  coral:
    "bg-orange-500 text-white shadow-sm hover:bg-orange-600 focus-visible:outline-orange-500",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-sm",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 hover:-translate-y-px active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-55",
        buttonVariantClasses[variant],
        buttonSizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
}

const cardPaddingClasses: Record<NonNullable<CardProps["padding"]>, string> = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  className,
  padding = "md",
  hoverable = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_9px_24px_-17px_rgba(15,62,63,.34)]",
        cardPaddingClasses[padding],
        hoverable && "transition duration-200 hover:-translate-y-0.5 hover:border-teal-200/80 hover:shadow-[0_18px_35px_-20px_rgba(15,62,63,.42)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type BadgeTone = "slate" | "teal" | "sky" | "orange" | "red" | "green" | "violet";

const badgeToneClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  teal: "bg-[#e6f5f1] text-[#075e56] ring-[#c8e9e1]",
  sky: "bg-sky-50 text-sky-800 ring-sky-100",
  orange: "bg-orange-50 text-orange-800 ring-orange-100",
  red: "bg-rose-50 text-rose-700 ring-rose-100",
  green: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  violet: "bg-violet-50 text-violet-800 ring-violet-100",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  dot?: boolean;
}

export function Badge({ className, tone = "slate", dot = false, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        badgeToneClasses[tone],
        className,
      )}
      {...props}
    >
      {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const avatarSizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-teal-100 via-[#e6f5f1] to-sky-100 font-bold text-teal-800",
        avatarSizeClasses[size],
        className,
      )}
      {...props}
    >
      {src ? (
        // An ordinary image keeps this component usable without requiring remote image configuration.
        <img src={src} alt={alt ?? name ?? "Avatar"} className="h-full w-full object-cover" />
      ) : (
        <span aria-label={alt ?? name ?? "Avatar"}>{getInitials(name)}</span>
      )}
    </div>
  );
}

interface FieldMetaProps {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  containerClassName?: string;
}

function FieldMeta({
  label,
  hint,
  error,
  required,
  id,
  children,
  containerClassName,
}: FieldMetaProps & { id: string; children: ReactNode }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label ? (
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
          {required ? <span className="ml-1 text-rose-600">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs leading-5 text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

const fieldBaseClass =
  "block w-full rounded-xl border bg-slate-50/80 px-3.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:bg-white focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const fieldStateClass = (hasError?: boolean) =>
  hasError
    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100"
    : "border-slate-200 focus:border-teal-500 focus:ring-teal-100";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, FieldMetaProps {}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { id, label, hint, error, required, containerClassName, className, "aria-describedby": describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <FieldMeta
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      containerClassName={containerClassName}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[describedBy, messageId].filter(Boolean).join(" ") || undefined}
        className={cn(fieldBaseClass, fieldStateClass(Boolean(error)), "h-11", className)}
        {...props}
      />
    </FieldMeta>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, FieldMetaProps {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { id, label, hint, error, required, containerClassName, className, children, "aria-describedby": describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const messageId = error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined;

  return (
    <FieldMeta
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      containerClassName={containerClassName}
    >
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[describedBy, messageId].filter(Boolean).join(" ") || undefined}
        className={cn(
          fieldBaseClass,
          fieldStateClass(Boolean(error)),
          "h-11 appearance-none bg-[linear-gradient(45deg,transparent_50%,#64748b_50%),linear-gradient(135deg,#64748b_50%,transparent_50%)] bg-[position:calc(100%-18px)_18px,calc(100%-13px)_18px] bg-[size:5px_5px,5px_5px] bg-no-repeat pr-10",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldMeta>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, FieldMetaProps {}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { id, label, hint, error, required, containerClassName, className, "aria-describedby": describedBy, ...props },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const messageId = error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined;

  return (
    <FieldMeta
      id={textareaId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      containerClassName={containerClassName}
    >
      <textarea
        ref={ref}
        id={textareaId}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={[describedBy, messageId].filter(Boolean).join(" ") || undefined}
        className={cn(fieldBaseClass, fieldStateClass(Boolean(error)), "min-h-28 resize-y py-3", className)}
        {...props}
      />
    </FieldMeta>
  );
});

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
  description?: ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { id, label, description, className, containerClassName, ...props },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <label htmlFor={checkboxId} className={cn("flex cursor-pointer items-start gap-3", containerClassName)}>
      <input
        ref={ref}
        id={checkboxId}
        type="checkbox"
        className={cn(
          "mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          className,
        )}
        {...props}
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium text-slate-700">{label}</span>
        {description ? <span className="block text-xs leading-5 text-slate-500">{description}</span> : null}
      </span>
    </label>
  );
});

export interface StatusDotProps {
  tone?: BadgeTone;
  label: string;
  className?: string;
}

export function StatusDot({ tone = "green", label, className }: StatusDotProps) {
  const dotTone: Record<BadgeTone, string> = {
    slate: "bg-slate-400",
    teal: "bg-teal-500",
    sky: "bg-sky-500",
    orange: "bg-orange-500",
    red: "bg-rose-500",
    green: "bg-emerald-500",
    violet: "bg-violet-500",
  };

  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-slate-600", className)}>
      <span className={cn("h-2 w-2 rounded-full", dotTone[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}

export function Checkmark({ className }: { className?: string }) {
  return <Check className={cn("h-4 w-4", className)} aria-hidden="true" />;
}
