"use client";

import type { HTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus, Search, SlidersHorizontal, X } from "lucide-react";

import { Card } from "./ui";
import { cn } from "./utils";

export interface SectionHeadingProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: ReactNode;
  eyebrow?: string;
}

export function SectionHeading({ title, description, action, eyebrow, className, ...props }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-3", className)} {...props}>
      <div>
        {eyebrow ? <p className="mb-1 text-xs font-bold uppercase tracking-[0.14em] text-teal-700">{eyebrow}</p> : null}
        <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export type MetricTrend = "up" | "down" | "flat";

export interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: LucideIcon;
  trend?: MetricTrend;
  trendLabel?: string;
  accent?: "teal" | "sky" | "orange" | "violet";
}

const accentClasses = {
  teal: "bg-teal-50 text-teal-700",
  sky: "bg-sky-50 text-sky-700",
  orange: "bg-orange-50 text-orange-700",
  violet: "bg-violet-50 text-violet-700",
};

export function DashboardCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  accent = "teal",
  className,
  ...props
}: DashboardCardProps) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const trendClass = trend === "down" ? "text-rose-700 bg-rose-50" : trend === "up" ? "text-emerald-700 bg-emerald-50" : "text-slate-600 bg-slate-100";

  return (
    <Card hoverable className={cn("relative overflow-hidden", className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        {Icon ? <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-2xl", accentClasses[accent])}><Icon className="h-5 w-5" aria-hidden="true" /></span> : null}
      </div>
      {trendLabel || description ? (
        <div className="mt-4 flex items-center gap-2 text-xs">
          {trend ? <span className={cn("inline-flex items-center gap-0.5 rounded-full px-1.5 py-1 font-bold", trendClass)}><TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />{trendLabel}</span> : null}
          {description ? <span className="truncate text-slate-500">{description}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  onClear?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  className,
  ariaLabel = "Search",
  onClear,
}: SearchBarProps) {
  const clear = () => {
    onChange("");
    onClear?.();
  };

  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{ariaLabel}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
      />
      {value ? (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </label>
  );
}

export interface FilterChipProps {
  label: ReactNode;
  active?: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  count?: number;
  className?: string;
}

export function FilterChip({ label, active = false, onClick, icon: Icon, count, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500",
        active
          ? "border-teal-200 bg-teal-50 text-teal-800"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
        className,
      )}
      aria-pressed={active}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
      {count !== undefined ? <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]", active ? "bg-teal-100" : "bg-slate-100")}>{count}</span> : null}
    </button>
  );
}

export interface FilterPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  label?: string;
}

export function FilterPanel({ children, label = "Filters", className, ...props }: FilterPanelProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      <span className="inline-flex h-9 items-center gap-1.5 pr-1 text-sm font-bold text-slate-600"><SlidersHorizontal className="h-4 w-4 text-slate-400" aria-hidden="true" />{label}</span>
      {children}
    </div>
  );
}

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: DataColumn<T>[];
  rows: T[];
  getRowId?: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  emptyContent?: ReactNode;
  className?: string;
}

/** A semantic table with a scroll container for compact screens. */
export function DataTable<T>({
  columns,
  rows,
  getRowId = (_, index) => index,
  onRowClick,
  emptyContent = "No records found.",
  className,
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <table className="min-w-full divide-y divide-slate-100 text-left">
        <thead className="bg-slate-50/70">
          <tr>
            {columns.map((column) => <th key={column.id} scope="col" className={cn("whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:px-5", column.headerClassName)}>{column.header}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? rows.map((row, index) => (
            <tr
              key={getRowId(row, index)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn("transition", onRowClick && "cursor-pointer hover:bg-teal-50/50 focus-within:bg-teal-50/50")}
            >
              {columns.map((column) => <td key={column.id} className={cn("whitespace-nowrap px-4 py-4 text-sm text-slate-700 sm:px-5", column.className)}>{column.cell(row, index)}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={Math.max(columns.length, 1)} className="px-5 py-12 text-center text-sm text-slate-500">{emptyContent}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
