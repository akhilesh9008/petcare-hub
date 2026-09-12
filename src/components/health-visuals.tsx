"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Activity, CalendarDays, FileText, HeartPulse, Pill, Stethoscope } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge, Card, type BadgeTone } from "./ui";
import { cn, formatDate } from "./utils";

export interface WeightPoint {
  date: string | Date;
  weight: number;
}

export interface WeightTrendChartProps {
  data: WeightPoint[];
  unit?: string;
  title?: string;
  description?: string;
  trendLabel?: string;
  className?: string;
  height?: number;
  action?: ReactNode;
}

function ChartEmpty({ label, height }: { label: string; height: number }) {
  return (
    <div className="grid place-items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 text-center text-sm text-slate-500" style={{ height }}>
      {label}
    </div>
  );
}

export function WeightTrendChart({
  data,
  unit = "kg",
  title = "Weight trend",
  description = "Track weight over time for informational care planning.",
  trendLabel,
  className,
  height = 256,
  action,
}: WeightTrendChartProps) {
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {trendLabel ? <Badge tone="teal">{trendLabel}</Badge> : action}
      </div>
      <div className="mt-5" style={{ height }}>
        {data.length === 0 ? (
          <ChartEmpty label="Add weight records to see a trend." height={height} />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="petcareWeightGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickMargin={10}
                minTickGap={24}
                tickFormatter={(value) => formatDate(value, { day: "numeric", month: "short" })}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value) => `${value} ${unit}`}
                width={52}
              />
              <Tooltip
                labelFormatter={(label) => formatDate(label)}
                formatter={(value) => [`${value} ${unit}`, "Weight"]}
                contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px -10px rgb(15 23 42 / 0.18)" }}
              />
              <Area type="monotone" dataKey="weight" stroke="#0d9488" strokeWidth={3} fill="url(#petcareWeightGradient)" activeDot={{ r: 5, strokeWidth: 3, fill: "#ffffff" }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export interface CareStatusDatum {
  name: string;
  value: number;
  color?: string;
}

export interface CareStatusDonutProps {
  data: CareStatusDatum[];
  title?: string;
  description?: string;
  centerLabel?: string;
  centerValue?: string | number;
  className?: string;
  height?: number;
}

const donutColors = ["#0d9488", "#38bdf8", "#f59e0b", "#fb7185", "#8b5cf6"];

export function CareStatusDonut({
  data,
  title = "Care status",
  description,
  centerLabel = "Records",
  centerValue,
  className,
  height = 248,
}: CareStatusDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className={className}>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="relative mt-3" style={{ height }}>
        {data.length === 0 ? (
          <ChartEmpty label="Care information will appear here." height={height} />
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="62%" outerRadius="82%" paddingAngle={3} stroke="none">
                  {data.map((item, index) => <Cell key={`${item.name}-${index}`} fill={item.color ?? donutColors[index % donutColors.length]} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px -10px rgb(15 23 42 / 0.18)" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">{centerValue ?? total}</span>
              <span className="mt-0.5 text-xs font-medium text-slate-500">{centerLabel}</span>
            </div>
          </>
        )}
      </div>
      {data.length ? (
        <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-600">
          {data.map((item, index) => <li key={item.name} className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? donutColors[index % donutColors.length] }} aria-hidden="true" /><span className="truncate">{item.name}</span><span className="ml-auto font-bold text-slate-800">{item.value}</span></li>)}
        </ul>
      ) : null}
    </Card>
  );
}

export interface ActivityChartDatum {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ActivityBarChartProps {
  data: ActivityChartDatum[];
  title?: string;
  description?: string;
  valueLabel?: string;
  secondaryValueLabel?: string;
  className?: string;
  height?: number;
}

export function ActivityBarChart({
  data,
  title = "Care activity",
  description,
  valueLabel = "Completed",
  secondaryValueLabel = "Upcoming",
  className,
  height = 244,
}: ActivityBarChartProps) {
  const hasSecondary = data.some((item) => item.secondaryValue !== undefined);

  return (
    <Card className={className}>
      <div>
        <h3 className="font-bold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      <div className="mt-5" style={{ height }}>
        {data.length === 0 ? <ChartEmpty label="Activity will appear here as care is recorded." height={height} /> : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={4}>
              <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
              <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} allowDecimals={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 12, borderColor: "#e2e8f0", boxShadow: "0 10px 25px -10px rgb(15 23 42 / 0.18)" }} />
              {hasSecondary ? <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} /> : null}
              <Bar dataKey="value" name={valueLabel} fill="#0d9488" radius={[7, 7, 2, 2]} maxBarSize={34} />
              {hasSecondary ? <Bar dataKey="secondaryValue" name={secondaryValueLabel} fill="#7dd3fc" radius={[7, 7, 2, 2]} maxBarSize={34} /> : null}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export type TimelineEventType = "vaccination" | "medication" | "visit" | "record" | "weight" | "reminder" | string;

export interface HealthTimelineEvent {
  id: string;
  date: string | Date;
  title: string;
  description?: string;
  type?: TimelineEventType;
  meta?: string;
  icon?: LucideIcon;
  tone?: BadgeTone;
}

const defaultTimelineIcons: Record<string, LucideIcon> = {
  vaccination: HeartPulse,
  medication: Pill,
  visit: Stethoscope,
  record: FileText,
  weight: Activity,
  reminder: CalendarDays,
};

const defaultTimelineTones: Record<string, BadgeTone> = {
  vaccination: "sky",
  medication: "violet",
  visit: "teal",
  record: "slate",
  weight: "orange",
  reminder: "orange",
};

const timelineIconClasses: Record<BadgeTone, string> = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  orange: "bg-orange-50 text-orange-700 ring-orange-100",
  red: "bg-rose-50 text-rose-700 ring-rose-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  violet: "bg-violet-50 text-violet-700 ring-violet-100",
};

export interface HealthTimelineProps {
  events: HealthTimelineEvent[];
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
  action?: ReactNode;
}

export function HealthTimeline({
  events,
  title = "Health timeline",
  description,
  emptyMessage = "No health activity has been added yet.",
  className,
  action,
}: HealthTimelineProps) {
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {events.length === 0 ? (
        <ChartEmpty label={emptyMessage} height={144} />
      ) : (
        <ol className="mt-6 space-y-0">
          {events.map((event, index) => {
            const type = event.type?.toLowerCase() ?? "record";
            const Icon = event.icon ?? defaultTimelineIcons[type] ?? FileText;
            const tone = event.tone ?? defaultTimelineTones[type] ?? "slate";
            const isLast = index === events.length - 1;

            return (
              <li key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
                {!isLast ? <span className="absolute left-[18px] top-10 h-[calc(100%-22px)] w-px bg-slate-200" aria-hidden="true" /> : null}
                <span className={cn("relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", timelineIconClasses[tone])}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                    <h4 className="text-sm font-bold text-slate-900">{event.title}</h4>
                    <time className="text-xs font-semibold text-slate-500">{formatDate(event.date)}</time>
                  </div>
                  {event.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{event.description}</p> : null}
                  {event.meta ? <p className="mt-1.5 text-xs font-medium text-slate-500">{event.meta}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

export { WeightTrendChart as WeightChart };
