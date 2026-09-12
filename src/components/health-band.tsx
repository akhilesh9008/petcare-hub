"use client";

import { useId, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  BatteryLow,
  BedDouble,
  BellRing,
  Bluetooth,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Footprints,
  HeartPulse,
  MoonStar,
  PawPrint,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  TrendingUp,
  Utensils,
  Watch,
  Zap,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "./ui";
import { cn, formatCompactNumber } from "./utils";

/** Connection state reported by a pet health band. */
export type HealthBandConnectionState = "connected" | "syncing" | "disconnected" | "low-battery";

/** Shared color vocabulary for the health-band cards. */
export type HealthBandTone = "teal" | "sky" | "rose" | "amber" | "violet";

export interface HealthBandDevice {
  name: string;
  model?: string;
  status: HealthBandConnectionState;
  batteryLevel?: number;
  lastSynced?: string;
  firmwareVersion?: string;
}

export interface HealthBandDay {
  /** A stable application identifier, such as an ISO date. */
  id: string;
  day: string;
  date: string;
  /** Highlight a date as today without making it the selected date. */
  isToday?: boolean;
}

export interface HealthBandMetric {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  detail?: string;
  /** A 0–100 goal completion percentage, if the metric has a target. */
  progress?: number;
  icon?: LucideIcon;
  tone?: HealthBandTone;
}

export interface HealthBandActivityPoint {
  label: string;
  steps: number;
  activeMinutes?: number;
}

export interface HealthBandSleepStage {
  id: string;
  label: string;
  minutes: number;
  color?: string;
}

export interface HealthBandSleepData {
  duration: string;
  score?: number;
  bedtime?: string;
  wakeTime?: string;
  stages?: HealthBandSleepStage[];
}

export interface HealthBandHabit {
  id: string;
  label: string;
  detail?: string;
  completed: number;
  target: number;
  icon?: LucideIcon;
  tone?: HealthBandTone;
}

export type HealthBandAlertSeverity = "info" | "attention" | "urgent";

export interface HealthBandAlert {
  id: string;
  severity: HealthBandAlertSeverity;
  title: string;
  description: string;
  time?: string;
  actionLabel?: string;
}

const defaultDays: HealthBandDay[] = [
  { id: "mon", day: "Mon", date: "24" },
  { id: "tue", day: "Tue", date: "25", isToday: true },
  { id: "wed", day: "Wed", date: "26" },
  { id: "thu", day: "Thu", date: "27" },
  { id: "fri", day: "Fri", date: "28" },
  { id: "sat", day: "Sat", date: "29" },
  { id: "sun", day: "Sun", date: "30" },
];

const defaultDevice: HealthBandDevice = {
  name: "PawPulse Band",
  model: "Series 2",
  status: "connected",
  batteryLevel: 84,
  lastSynced: "Synced just now",
  firmwareVersion: "v2.4.1",
};

const defaultMetrics: HealthBandMetric[] = [
  {
    id: "heart-rate",
    label: "Resting heart rate",
    value: 92,
    unit: "bpm",
    detail: "Within usual range",
    progress: 72,
    icon: HeartPulse,
    tone: "rose",
  },
  {
    id: "steps",
    label: "Daily movement",
    value: "6,480",
    unit: "steps",
    detail: "81% of goal",
    progress: 81,
    icon: Footprints,
    tone: "teal",
  },
  {
    id: "active-minutes",
    label: "Active minutes",
    value: 48,
    unit: "min",
    detail: "12 min above average",
    progress: 68,
    icon: Activity,
    tone: "sky",
  },
  {
    id: "calories",
    label: "Energy burned",
    value: 286,
    unit: "kcal",
    detail: "Updated 6 min ago",
    progress: 58,
    icon: Zap,
    tone: "amber",
  },
];

const defaultActivity: HealthBandActivityPoint[] = [
  { label: "6a", steps: 320, activeMinutes: 4 },
  { label: "8a", steps: 980, activeMinutes: 11 },
  { label: "10a", steps: 760, activeMinutes: 8 },
  { label: "12p", steps: 1120, activeMinutes: 13 },
  { label: "2p", steps: 590, activeMinutes: 7 },
  { label: "4p", steps: 1490, activeMinutes: 16 },
  { label: "6p", steps: 1220, activeMinutes: 14 },
];

const defaultSleep: HealthBandSleepData = {
  duration: "8h 12m",
  score: 88,
  bedtime: "10:18 pm",
  wakeTime: "6:30 am",
  stages: [
    { id: "deep", label: "Deep", minutes: 109, color: "#0f766e" },
    { id: "light", label: "Light", minutes: 276, color: "#5eead4" },
    { id: "rem", label: "REM", minutes: 107, color: "#a5b4fc" },
  ],
};

const defaultHabits: HealthBandHabit[] = [
  { id: "walk", label: "Morning walk", detail: "25 minute target", completed: 25, target: 25, icon: Footprints, tone: "teal" },
  { id: "meal", label: "Breakfast", detail: "Logged at 8:10 am", completed: 1, target: 1, icon: Utensils, tone: "amber" },
  { id: "rest", label: "Quiet rest", detail: "2 hours recommended", completed: 76, target: 120, icon: MoonStar, tone: "violet" },
];

const defaultAlerts: HealthBandAlert[] = [
  {
    id: "recovery",
    severity: "attention",
    title: "A little more rest today",
    description: "Activity is higher than the recent average. Consider a calmer evening routine.",
    time: "35 min ago",
    actionLabel: "View guidance",
  },
  {
    id: "hydration",
    severity: "info",
    title: "Hydration check-in",
    description: "It may be a good time to refresh the water bowl after the afternoon walk.",
    time: "2h ago",
  },
];

const toneClasses: Record<HealthBandTone, { icon: string; dot: string; progress: string; soft: string }> = {
  teal: {
    icon: "bg-teal-50 text-teal-700 ring-teal-100",
    dot: "bg-teal-500",
    progress: "bg-teal-500",
    soft: "from-teal-50 to-emerald-50/50",
  },
  sky: {
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
    dot: "bg-sky-500",
    progress: "bg-sky-500",
    soft: "from-sky-50 to-cyan-50/50",
  },
  rose: {
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    dot: "bg-rose-500",
    progress: "bg-rose-500",
    soft: "from-rose-50 to-orange-50/50",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
    progress: "bg-amber-500",
    soft: "from-amber-50 to-orange-50/50",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700 ring-violet-100",
    dot: "bg-violet-500",
    progress: "bg-violet-500",
    soft: "from-violet-50 to-indigo-50/50",
  },
};

const connectionMeta: Record<HealthBandConnectionState, { label: string; classes: string; dot: string }> = {
  connected: { label: "Connected", classes: "bg-emerald-50 text-emerald-800 ring-emerald-100", dot: "bg-emerald-500" },
  syncing: { label: "Syncing", classes: "bg-sky-50 text-sky-800 ring-sky-100", dot: "bg-sky-500" },
  disconnected: { label: "Not connected", classes: "bg-slate-100 text-slate-700 ring-slate-200", dot: "bg-slate-400" },
  "low-battery": { label: "Low battery", classes: "bg-amber-50 text-amber-800 ring-amber-100", dot: "bg-amber-500" },
};

const alertMeta: Record<HealthBandAlertSeverity, { icon: LucideIcon; classes: string; iconClasses: string }> = {
  info: { icon: Sparkles, classes: "border-sky-100 bg-sky-50/60", iconClasses: "bg-white text-sky-700 ring-sky-100" },
  attention: { icon: AlertTriangle, classes: "border-amber-100 bg-amber-50/65", iconClasses: "bg-white text-amber-700 ring-amber-100" },
  urgent: { icon: BellRing, classes: "border-rose-100 bg-rose-50/70", iconClasses: "bg-white text-rose-700 ring-rose-100" },
};

function clampProgress(value: number | undefined) {
  if (value === undefined || Number.isNaN(value)) return undefined;
  return Math.max(0, Math.min(100, value));
}

function formatMetricValue(value: string | number) {
  return typeof value === "number" ? formatCompactNumber(value) : value;
}

function metricFallbackIcon(id: string): LucideIcon {
  const normalizedId = id.toLowerCase();
  if (normalizedId.includes("heart")) return HeartPulse;
  if (normalizedId.includes("sleep")) return MoonStar;
  if (normalizedId.includes("step") || normalizedId.includes("walk")) return Footprints;
  if (normalizedId.includes("activity")) return Activity;
  return Target;
}

function BandIllustration({ status }: { status: HealthBandConnectionState }) {
  const isConnected = status === "connected" || status === "syncing";

  return (
    <div className="relative mx-auto flex h-32 w-40 items-center justify-center sm:mx-0" aria-hidden="true">
      <span className="absolute h-[4.8rem] w-40 rounded-[2rem] border border-white/15 bg-gradient-to-r from-[#0a3134] via-[#165b5b] to-[#0a3134] shadow-inner" />
      <span className="absolute h-16 w-[4.8rem] rounded-[1.4rem] border border-white/35 bg-gradient-to-br from-[#e9faf6] via-[#93d9cf] to-[#3b8d88] p-1.5 shadow-[0_18px_35px_-14px_rgba(0,0,0,.7)]">
        <span className="grid h-full w-full place-items-center rounded-[1rem] border border-[#0d5856]/25 bg-[#113d41] text-white shadow-inner">
          <PawPrint className="h-6 w-6" strokeWidth={2.25} />
        </span>
      </span>
      <span className={cn("absolute bottom-3 right-1 h-3 w-3 rounded-full ring-4 ring-[#123e40]", isConnected ? "bg-emerald-400" : "bg-slate-400")} />
    </div>
  );
}

export interface HealthBandStatusPillProps {
  status: HealthBandConnectionState;
  className?: string;
}

export function HealthBandStatusPill({ status, className }: HealthBandStatusPillProps) {
  const meta = connectionMeta[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset", meta.classes, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot, status === "syncing" && "animate-pulse")} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

export interface HealthBandDaySelectorProps {
  days: HealthBandDay[];
  selectedDayId?: string;
  onDayChange?: (day: HealthBandDay) => void;
  className?: string;
  ariaLabel?: string;
}

/** A compact, accessible, controlled-or-uncontrolled day picker for health-band summaries. */
export function HealthBandDaySelector({
  days,
  selectedDayId,
  onDayChange,
  className,
  ariaLabel = "Choose a day for band health data",
}: HealthBandDaySelectorProps) {
  const firstDayId = days[0]?.id;
  const [internalSelectedDayId, setInternalSelectedDayId] = useState(selectedDayId ?? days.find((day) => day.isToday)?.id ?? firstDayId);
  const activeDayId = selectedDayId ?? internalSelectedDayId;

  if (!days.length) return null;

  return (
    <div className={cn("overflow-x-auto pb-1", className)}>
      <div className="flex min-w-max items-center gap-1.5 rounded-2xl border border-slate-100 bg-white/80 p-1.5 shadow-[0_10px_24px_-20px_rgba(15,62,63,.32)]" role="group" aria-label={ariaLabel}>
        {days.map((day) => {
          const isSelected = day.id === activeDayId;
          return (
            <button
              key={day.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${day.day} ${day.date}${day.isToday ? ", today" : ""}`}
              className={cn(
                "relative grid min-h-14 min-w-12 place-items-center rounded-xl px-2 py-1.5 text-center transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600",
                isSelected ? "bg-[#0b6b62] text-white shadow-[0_10px_20px_-12px_rgba(8,86,78,.8)]" : "text-slate-500 hover:bg-teal-50 hover:text-teal-800",
              )}
              onClick={() => {
                if (selectedDayId === undefined) setInternalSelectedDayId(day.id);
                onDayChange?.(day);
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{day.day}</span>
              <span className="mt-0.5 text-sm font-extrabold">{day.date}</span>
              {day.isToday && !isSelected ? <span className="absolute bottom-1 h-1 w-1 rounded-full bg-teal-500" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface HealthBandConnectionCardProps {
  device: HealthBandDevice;
  className?: string;
  onConnect?: () => void;
  onSync?: () => void;
  connectLabel?: string;
  syncLabel?: string;
}

/** A visual status and pairing surface for a pet's wearable health band. */
export function HealthBandConnectionCard({
  device,
  className,
  onConnect,
  onSync,
  connectLabel = "Manage band",
  syncLabel = "Sync now",
}: HealthBandConnectionCardProps) {
  const isPaired = device.status === "connected" || device.status === "syncing" || device.status === "low-battery";
  const batteryLevel = device.batteryLevel === undefined ? undefined : clampProgress(device.batteryLevel);
  const BatteryIcon = batteryLevel !== undefined && batteryLevel < 20 ? BatteryLow : BatteryCharging;

  return (
    <Card className={cn("relative overflow-hidden border-0 bg-[#123f42] p-0 text-white shadow-[0_22px_45px_-26px_rgba(11,64,64,.72)]", className)}>
      <div className="pointer-events-none absolute -right-24 -top-28 h-56 w-56 rounded-full bg-teal-300/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-sky-300/10 blur-3xl" aria-hidden="true" />
      <div className="relative grid gap-2 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-5 sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-teal-100/85"><Watch className="h-3.5 w-3.5" /> Health band</span>
            <HealthBandStatusPill status={device.status} className="bg-white/12 text-white ring-white/15" />
          </div>
          <h3 className="mt-3 text-xl font-extrabold tracking-tight text-white">{device.name}</h3>
          <p className="mt-1 text-sm text-teal-50/75">{device.model ?? "Wearable wellness companion"}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-teal-50/80">
            {batteryLevel !== undefined ? (
              <span className="inline-flex items-center gap-1.5"><BatteryIcon className="h-4 w-4" /> {batteryLevel}% battery</span>
            ) : null}
            {device.lastSynced ? <span className="inline-flex items-center gap-1.5"><RefreshCw className={cn("h-3.5 w-3.5", device.status === "syncing" && "animate-spin")} /> {device.lastSynced}</span> : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={isPaired ? onSync : onConnect}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-white px-3.5 text-sm font-bold text-[#0e5d58] shadow-sm transition hover:-translate-y-px hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {isPaired ? <RefreshCw className={cn("h-4 w-4", device.status === "syncing" && "animate-spin")} /> : <Bluetooth className="h-4 w-4" />}
              {isPaired ? syncLabel : connectLabel}
            </button>
            {isPaired ? <span className="inline-flex h-9 items-center rounded-xl border border-white/15 bg-white/5 px-3 text-xs font-semibold text-teal-50/75">{device.firmwareVersion ?? "Firmware current"}</span> : null}
          </div>
        </div>
        <BandIllustration status={device.status} />
      </div>
    </Card>
  );
}

export interface HealthBandMetricCardProps {
  metric: HealthBandMetric;
  className?: string;
}

export function HealthBandMetricCard({ metric, className }: HealthBandMetricCardProps) {
  const tone = metric.tone ?? "teal";
  const styles = toneClasses[tone];
  const Icon = metric.icon ?? metricFallbackIcon(metric.id);
  const progress = clampProgress(metric.progress);

  return (
    <Card className={cn("group min-w-0 overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_30px_-22px_rgba(15,62,63,.45)]", className)}>
      <div className="flex items-start justify-between gap-3">
        <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", styles.icon)}>
          <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
        </span>
        {metric.detail ? <span className="max-w-[9.5rem] text-right text-[11px] font-semibold leading-4 text-slate-500">{metric.detail}</span> : null}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.11em] text-slate-500">{metric.label}</p>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <span className="truncate text-2xl font-extrabold tracking-tight text-slate-900">{formatMetricValue(metric.value)}</span>
        {metric.unit ? <span className="text-xs font-bold text-slate-500">{metric.unit}</span> : null}
      </div>
      {progress !== undefined ? (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${metric.label} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <span className={cn("block h-full rounded-full", styles.progress)} style={{ width: `${progress}%` }} />
        </div>
      ) : null}
    </Card>
  );
}

export interface HealthBandMetricsGridProps {
  metrics: HealthBandMetric[];
  className?: string;
}

export function HealthBandMetricsGrid({ metrics, className }: HealthBandMetricsGridProps) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2", className)}>
      {metrics.map((metric) => <HealthBandMetricCard key={metric.id} metric={metric} />)}
    </div>
  );
}

export interface HealthBandActivityChartProps {
  data: HealthBandActivityPoint[];
  stepGoal?: number;
  title?: string;
  className?: string;
  action?: ReactNode;
}

/** An hourly activity visualization with an understandable daily-goal summary. */
export function HealthBandActivityChart({
  data,
  stepGoal = 8000,
  title = "Movement rhythm",
  className,
  action,
}: HealthBandActivityChartProps) {
  const totalSteps = data.reduce((sum, point) => sum + point.steps, 0);
  const totalActiveMinutes = data.reduce((sum, point) => sum + (point.activeMinutes ?? 0), 0);
  const goalProgress = stepGoal > 0 ? Math.min(100, Math.round((totalSteps / stepGoal) * 100)) : 0;

  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100"><TrendingUp className="h-4 w-4" /></span>
            <div>
              <h3 className="font-extrabold text-slate-900">{title}</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">A view of today&apos;s activity pattern</p>
            </div>
          </div>
        </div>
        {action ?? <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-700">{goalProgress}% goal</span>}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">{formatCompactNumber(totalSteps)} <span className="text-sm font-bold text-slate-500">steps</span></p>
          <p className="mt-1 text-sm text-slate-500">{totalActiveMinutes ? `${totalActiveMinutes} active min` : "Movement is being captured"}</p>
        </div>
        <div className="min-w-[9rem] rounded-2xl bg-slate-50 px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-3 text-xs font-bold text-slate-600"><span>Daily goal</span><span className="text-teal-700">{formatCompactNumber(stepGoal)}</span></div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200"><span className="block h-full rounded-full bg-teal-500" style={{ width: `${goalProgress}%` }} /></div>
        </div>
      </div>

      <div className="mt-4 h-48">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} barCategoryGap="28%">
              <defs>
                <linearGradient id="healthBandActivityGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#18a397" />
                  <stop offset="100%" stopColor="#0d766e" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 4" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(value) => formatCompactNumber(Number(value))} width={36} />
              <Tooltip
                cursor={{ fill: "rgba(226,232,240,.45)" }}
                contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 14px 30px -16px rgb(15 23 42 / .28)", fontSize: 12 }}
                labelStyle={{ color: "#475569", fontWeight: 700 }}
              />
              <Bar dataKey="steps" name="Steps" fill="url(#healthBandActivityGradient)" radius={[7, 7, 3, 3]} maxBarSize={38} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-sm text-slate-500">Activity will appear after the band syncs.</div>
        )}
      </div>
    </Card>
  );
}

export interface HealthBandSleepCardProps {
  sleep: HealthBandSleepData;
  title?: string;
  className?: string;
}

export function HealthBandSleepCard({ sleep, title = "Sleep & recovery", className }: HealthBandSleepCardProps) {
  const score = clampProgress(sleep.score ?? 0) ?? 0;
  const stages = sleep.stages ?? [];
  const totalStageMinutes = stages.reduce((sum, stage) => sum + Math.max(0, stage.minutes), 0);

  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-violet-100"><BedDouble className="h-4 w-4" /></span>
          <div>
            <h3 className="font-extrabold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">A restorative overnight snapshot</p>
          </div>
        </div>
        {sleep.score !== undefined ? <span className="text-xs font-bold text-violet-700">Good recovery</span> : null}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#0d9488 ${score * 3.6}deg, #e2e8f0 0deg)` }} role="img" aria-label={`Sleep score ${score} out of 100`}>
          <div className="grid h-[4.2rem] w-[4.2rem] place-items-center rounded-full bg-white text-center shadow-inner">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">{sleep.score ?? "—"}</span>
            <span className="-mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">score</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-3xl font-extrabold tracking-tight text-slate-900">{sleep.duration}</p>
          <p className="mt-1 text-sm text-slate-500">Total sleep</p>
          {(sleep.bedtime || sleep.wakeTime) ? <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500"><Clock3 className="h-3.5 w-3.5 text-violet-500" /> {sleep.bedtime ?? "—"} – {sleep.wakeTime ?? "—"}</p> : null}
        </div>
      </div>

      {stages.length ? (
        <div className="mt-6">
          <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" aria-label="Sleep stage distribution" role="img">
            {stages.map((stage, index) => {
              const width = totalStageMinutes > 0 ? (Math.max(0, stage.minutes) / totalStageMinutes) * 100 : 0;
              const color = stage.color ?? ["#0f766e", "#5eead4", "#a5b4fc", "#f9a8d4"][index % 4];
              return <span key={stage.id} style={{ width: `${width}%`, backgroundColor: color }} title={`${stage.label}: ${stage.minutes} minutes`} />;
            })}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-2 text-xs">
            {stages.map((stage, index) => {
              const color = stage.color ?? ["#0f766e", "#5eead4", "#a5b4fc", "#f9a8d4"][index % 4];
              return (
                <div key={stage.id} className="flex min-w-0 items-center gap-1.5 text-slate-600">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className="truncate">{stage.label}</span>
                  <span className="ml-auto font-bold text-slate-800">{stage.minutes}m</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export interface HealthBandHabitListProps {
  habits: HealthBandHabit[];
  title?: string;
  className?: string;
  onHabitClick?: (habit: HealthBandHabit) => void;
}

export function HealthBandHabitList({ habits, title = "Daily habits", className, onHabitClick }: HealthBandHabitListProps) {
  const completeCount = habits.filter((habit) => habit.target > 0 && habit.completed >= habit.target).length;

  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100"><CheckCircle2 className="h-4 w-4" /></span>
            <div>
              <h3 className="font-extrabold text-slate-900">{title}</h3>
              <p className="mt-0.5 text-xs font-medium text-slate-500">Small routines, clearly tracked</p>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{completeCount}/{habits.length} done</span>
      </div>

      <ul className="mt-5 space-y-3">
        {habits.length ? habits.map((habit) => {
          const tone = habit.tone ?? "teal";
          const styles = toneClasses[tone];
          const Icon = habit.icon ?? Target;
          const progress = habit.target > 0 ? clampProgress((habit.completed / habit.target) * 100) ?? 0 : 0;
          const complete = habit.target > 0 && habit.completed >= habit.target;

          return (
            <li key={habit.id}>
              <button
                type="button"
                onClick={() => onHabitClick?.(habit)}
                className={cn("group flex w-full items-center gap-3 rounded-2xl border border-transparent px-2 py-2 text-left transition", onHabitClick && "hover:border-slate-100 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600")}
              >
                <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", styles.icon)}><Icon className="h-4 w-4" /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3"><span className="truncate text-sm font-bold text-slate-800">{habit.label}</span><span className={cn("text-xs font-bold", complete ? "text-emerald-700" : "text-slate-500")}>{habit.completed}/{habit.target}</span></span>
                  {habit.detail ? <span className="mt-0.5 block truncate text-xs text-slate-500">{habit.detail}</span> : null}
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100"><span className={cn("block h-full rounded-full", complete ? "bg-emerald-500" : styles.progress)} style={{ width: `${progress}%` }} /></span>
                </span>
                {onHabitClick ? <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-600" /> : null}
              </button>
            </li>
          );
        }) : <li className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-7 text-center text-sm text-slate-500">Habit tracking will appear here after the next sync.</li>}
      </ul>
    </Card>
  );
}

export interface HealthBandAlertListProps {
  alerts: HealthBandAlert[];
  title?: string;
  className?: string;
  onAlertAction?: (alert: HealthBandAlert) => void;
  onViewAll?: () => void;
}

export function HealthBandAlertList({
  alerts,
  title = "Wellness signals",
  className,
  onAlertAction,
  onViewAll,
}: HealthBandAlertListProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-50 text-rose-700 ring-1 ring-rose-100"><BellRing className="h-4 w-4" /></span>
          <div>
            <h3 className="font-extrabold text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500">Patterns worth a closer look</p>
          </div>
        </div>
        {onViewAll ? <button type="button" onClick={onViewAll} className="text-xs font-bold text-teal-700 transition hover:text-teal-900">View all</button> : null}
      </div>

      <div className="mt-5 space-y-3">
        {alerts.length ? alerts.map((alert) => {
          const meta = alertMeta[alert.severity];
          const Icon = meta.icon;
          return (
            <article key={alert.id} className={cn("rounded-2xl border p-3.5", meta.classes)}>
              <div className="flex items-start gap-3">
                <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-xl ring-1", meta.iconClasses)}><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                    <h4 className="text-sm font-extrabold text-slate-800">{alert.title}</h4>
                    {alert.time ? <time className="text-[11px] font-semibold text-slate-500">{alert.time}</time> : null}
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{alert.description}</p>
                  {alert.actionLabel ? <button type="button" onClick={() => onAlertAction?.(alert)} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-teal-700 transition hover:text-teal-900">{alert.actionLabel}<ChevronRight className="h-3.5 w-3.5" /></button> : null}
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 px-5 text-center">
            <div><ShieldCheck className="mx-auto h-5 w-5 text-emerald-600" /><p className="mt-2 text-sm font-bold text-emerald-800">No wellness signals right now</p><p className="mt-1 text-xs text-emerald-700/80">The latest band sync looks steady.</p></div>
          </div>
        )}
      </div>
    </Card>
  );
}

export interface PetHealthBandOverviewProps {
  /** Name used in the friendly overview heading. */
  petName?: string;
  heading?: string;
  description?: string;
  className?: string;
  device?: Partial<HealthBandDevice>;
  days?: HealthBandDay[];
  selectedDayId?: string;
  onDayChange?: (day: HealthBandDay) => void;
  metrics?: HealthBandMetric[];
  activity?: HealthBandActivityPoint[];
  stepGoal?: number;
  sleep?: HealthBandSleepData;
  habits?: HealthBandHabit[];
  alerts?: HealthBandAlert[];
  onConnect?: () => void;
  onSync?: () => void;
  connectLabel?: string;
  syncLabel?: string;
  onHabitClick?: (habit: HealthBandHabit) => void;
  onAlertAction?: (alert: HealthBandAlert) => void;
  onViewAllAlerts?: () => void;
}

/**
 * A full, composition-friendly wearable overview. It intentionally owns no data
 * fetching or persistence, so applications can supply live band data however they choose.
 */
export function PetHealthBandOverview({
  petName = "your pet",
  heading,
  description = "A gentle, informational view of movement, rest, and everyday routines.",
  className,
  device,
  days = defaultDays,
  selectedDayId,
  onDayChange,
  metrics = defaultMetrics,
  activity = defaultActivity,
  stepGoal = 8000,
  sleep = defaultSleep,
  habits = defaultHabits,
  alerts = defaultAlerts,
  onConnect,
  onSync,
  connectLabel,
  syncLabel,
  onHabitClick,
  onAlertAction,
  onViewAllAlerts,
}: PetHealthBandOverviewProps) {
  const headingId = useId();
  const resolvedDevice: HealthBandDevice = {
    name: device?.name ?? defaultDevice.name,
    model: device?.model ?? defaultDevice.model,
    status: device?.status ?? defaultDevice.status,
    batteryLevel: device?.batteryLevel ?? defaultDevice.batteryLevel,
    lastSynced: device?.lastSynced ?? defaultDevice.lastSynced,
    firmwareVersion: device?.firmwareVersion ?? defaultDevice.firmwareVersion,
  };
  const overviewHeading = heading ?? `${petName}'s band day`;

  return (
    <section className={cn("space-y-5", className)} aria-labelledby={headingId}>
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 ring-1 ring-inset ring-teal-100"><PawPrint className="h-3.5 w-3.5" /> Pet health band</span>
          <h2 id={headingId} className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{overviewHeading}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
        </div>
        <HealthBandDaySelector days={days} selectedDayId={selectedDayId} onDayChange={onDayChange} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.04fr)_minmax(21rem,.96fr)]">
        <HealthBandConnectionCard device={resolvedDevice} onConnect={onConnect} onSync={onSync} connectLabel={connectLabel} syncLabel={syncLabel} />
        <HealthBandMetricsGrid metrics={metrics} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.22fr)_minmax(20rem,.78fr)]">
        <HealthBandActivityChart data={activity} stepGoal={stepGoal} />
        <HealthBandSleepCard sleep={sleep} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HealthBandHabitList habits={habits} onHabitClick={onHabitClick} />
        <HealthBandAlertList alerts={alerts} onAlertAction={onAlertAction} onViewAll={onViewAllAlerts} />
      </div>
      <p className="flex items-start gap-2 rounded-xl border border-slate-100 bg-white/60 px-3.5 py-3 text-xs leading-5 text-slate-500"><Sun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />Band insights are informational wellness observations and are not a substitute for veterinary care.</p>
    </section>
  );
}
