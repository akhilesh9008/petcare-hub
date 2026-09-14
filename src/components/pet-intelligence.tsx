"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Activity, ArrowRight, CalendarClock, CheckCircle2, CircleAlert, Clock3, HeartPulse, MapPin, Package, PawPrint, ShieldCheck, Sparkles, Stethoscope, X } from "lucide-react";
import type { PetCareReadiness, PetInsight, PetLifeEvent, PetNextAction } from "@/lib/pet-digital-twin";
import { Badge, Button, Card } from "./ui";
import { cn, formatDate } from "./utils";

const eventIcons: Record<PetLifeEvent["category"], LucideIcon> = {
  HEALTH: HeartPulse,
  CARE: Sparkles,
  LIFE: PawPrint,
  ACTIVITY: Activity,
  LOCATION: MapPin,
  COMMERCE: Package,
  PLANNING: CalendarClock,
};

const eventStyles: Record<PetLifeEvent["category"], string> = {
  HEALTH: "bg-rose-50 text-rose-700 ring-rose-100",
  CARE: "bg-violet-50 text-violet-700 ring-violet-100",
  LIFE: "bg-teal-50 text-teal-700 ring-teal-100",
  ACTIVITY: "bg-sky-50 text-sky-700 ring-sky-100",
  LOCATION: "bg-orange-50 text-orange-700 ring-orange-100",
  COMMERCE: "bg-slate-100 text-slate-700 ring-slate-200",
  PLANNING: "bg-amber-50 text-amber-700 ring-amber-100",
};

const importanceTone: Record<PetInsight["importance"], "red" | "orange" | "teal"> = {
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "teal",
};

export function PetCareReadinessCard({ readiness, className }: { readiness: PetCareReadiness; className?: string }) {
  const scoreTone = readiness.score >= 75 ? "text-emerald-700" : readiness.score >= 50 ? "text-orange-700" : "text-rose-700";
  const ringTone = readiness.score >= 75 ? "border-emerald-200 bg-emerald-50" : readiness.score >= 50 ? "border-orange-200 bg-orange-50" : "border-rose-200 bg-rose-50";

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex gap-4">
        <div className={cn("grid h-20 w-20 shrink-0 place-items-center rounded-3xl border", ringTone)}>
          <div className="text-center">
            <span className={cn("block text-2xl font-black tracking-tight", scoreTone)}>{readiness.score}</span>
            <span className="block text-[10px] font-bold uppercase tracking-[.13em] text-slate-500">of 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black tracking-[-.02em] text-ink">Care Readiness</h3>
            <Badge tone="teal">Care plan</Badge>
          </div>
          <p className="mt-1 text-sm leading-5 text-slate-600">How complete and current the recorded care plan is—not a health score.</p>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`Care Readiness score ${readiness.score} out of 100`}>
        <div className="h-full rounded-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all" style={{ width: `${readiness.score}%` }} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.12em] text-emerald-700"><CheckCircle2 size={14} /> In place</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">{readiness.strengths.length ? readiness.strengths.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />{item}</li>) : <li>Start recording care details to build this view.</li>}</ul>
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[.12em] text-orange-700"><CircleAlert size={14} /> Improve next</p>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600">{readiness.needsAttention.length ? readiness.needsAttention.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />{item}</li>) : <li>The care plan is well documented.</li>}</ul>
        </div>
      </div>
      <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">{readiness.explanation}</p>
    </Card>
  );
}

export function NextBestActions({ actions, title = "Next best actions", className }: { actions: PetNextAction[]; title?: string; className?: string }) {
  return (
    <Card className={className}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-ink text-white"><Sparkles size={18} /></span>
        <div><h3 className="font-black tracking-[-.02em] text-ink">{title}</h3><p className="mt-1 text-sm text-slate-600">Useful steps ordered from the pet’s recorded context.</p></div>
      </div>
      <div className="mt-5 space-y-2">
        {actions.length ? actions.map((action) => (
          <Link key={action.id} href={action.href} className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 transition hover:border-teal-100 hover:bg-teal-50">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", action.priority === "HIGH" ? "bg-rose-500" : action.priority === "MEDIUM" ? "bg-orange-500" : "bg-teal-500")} />
            <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">{action.label}</span><span className="mt-0.5 block text-xs leading-4 text-slate-500">{action.description}</span></span>
            <ArrowRight className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" size={16} />
          </Link>
        )) : <p className="rounded-xl bg-mint/40 p-4 text-sm text-slate-600">No urgent next step is flagged from the records currently available.</p>}
      </div>
    </Card>
  );
}

export function PetInsightsPanel({ insights, onDismiss, onSnooze, limit, className }: {
  insights: PetInsight[];
  onDismiss?: (insight: PetInsight) => void;
  onSnooze?: (insight: PetInsight) => void;
  limit?: number;
  className?: string;
}) {
  const shown = limit ? insights.slice(0, limit) : insights;
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="eyebrow"><Sparkles size={14} /> Pet Intelligence</p><h3 className="mt-1 font-black tracking-[-.02em] text-ink">Record-based insights</h3><p className="mt-1 text-sm text-slate-600">Observations explain their source and never diagnose.</p></div>
        <Badge tone="violet">{shown.length} active</Badge>
      </div>
      <div className="mt-5 space-y-3">
        {shown.length ? shown.map((insight) => (
          <article key={insight.id} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
            <div className="flex gap-3">
              <span className={cn("mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl", insight.importance === "HIGH" ? "bg-rose-100 text-rose-700" : insight.importance === "MEDIUM" ? "bg-orange-100 text-orange-700" : "bg-teal-100 text-teal-700")}><CircleAlert size={18} /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2"><h4 className="text-sm font-bold text-ink">{insight.title}</h4><Badge tone={importanceTone[insight.importance]}>{insight.importance.toLowerCase()}</Badge></div>
                <p className="mt-1.5 text-sm leading-5 text-slate-600">{insight.summary}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500"><strong className="text-slate-600">Why it appeared:</strong> {insight.why}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={insight.action.href} className="btn-secondary h-8 px-3 text-xs">{insight.action.label}<ArrowRight size={14} /></Link>
                  {onSnooze ? <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => onSnooze(insight)}><Clock3 size={14} /> Snooze</Button> : null}
                  {onDismiss ? <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs" onClick={() => onDismiss(insight)}><X size={14} /> Dismiss</Button> : null}
                </div>
                {insight.sources.length ? <div className="mt-3 flex flex-wrap gap-2">{insight.sources.map((source) => <Link key={source.id} href={source.href} className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-1 text-[11px] font-semibold text-teal-800 ring-1 ring-inset ring-teal-100 hover:bg-teal-50"><ShieldCheck size={12} /> {source.label}</Link>)}</div> : null}
              </div>
            </div>
          </article>
        )) : <div className="rounded-2xl bg-mint/45 p-5 text-sm leading-6 text-slate-600">No active insight is flagged from the data currently recorded. Keep using the passport and care calendar to make this view more useful.</div>}
      </div>
    </Card>
  );
}

export function PetLifeTimeline({ events, title = "Pet life timeline", description = "Health, care and daily life in one chronological view.", limit = 12, action, className }: {
  events: PetLifeEvent[];
  title?: string;
  description?: string;
  limit?: number;
  action?: React.ReactNode;
  className?: string;
}) {
  const shown = events.slice(0, limit);
  return (
    <Card className={className}>
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black tracking-[-.02em] text-ink">{title}</h3><p className="mt-1 text-sm text-slate-600">{description}</p></div>{action}</div>
      {shown.length ? <ol className="mt-6 space-y-0">{shown.map((event, index) => {
        const Icon = eventIcons[event.category];
        return <li key={event.id} className="relative flex gap-3.5 pb-6 last:pb-0">
          {index < shown.length - 1 ? <span className="absolute left-[18px] top-10 h-[calc(100%-22px)] w-px bg-slate-200" aria-hidden="true" /> : null}
          <span className={cn("relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", eventStyles[event.category])}><Icon size={16} /></span>
          <div className="min-w-0 flex-1 pt-0.5"><div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1"><Link href={event.href} className="text-sm font-bold text-ink hover:text-teal-700">{event.title}</Link><time className="text-xs font-semibold text-slate-500">{formatDate(event.occurredAt)}</time></div>{event.description ? <p className="mt-1 text-sm leading-5 text-slate-600">{event.description}</p> : null}<p className="mt-1.5 text-xs font-medium uppercase tracking-[.1em] text-slate-400">{event.category.toLowerCase()} · {event.source.toLowerCase().replace("_", " ")}</p></div>
        </li>;
      })}</ol> : <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">New passport records, care activity and connected-device context will appear here.</div>}
    </Card>
  );
}

export function DigitalTwinFlow({ petName }: { petName: string }) {
  const lanes = [
    { label: "Health", copy: "Records, vaccines, medication and weight", icon: HeartPulse, tone: "bg-rose-50 text-rose-700" },
    { label: "Care", copy: "Visits, services, reminders and routine", icon: CalendarClock, tone: "bg-violet-50 text-violet-700" },
    { label: "Life", copy: "Wearable, routes, purchases and activity", icon: PawPrint, tone: "bg-teal-50 text-teal-700" },
  ];
  return <section className="overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-[#effbf8] via-white to-sky-50 p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow"><Sparkles size={14} /> Digital Twin</p><h2 className="mt-1 text-xl font-black tracking-[-.03em] text-ink">{petName}’s connected care system</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">One pet identity connects every recorded detail to a useful next step—without replacing veterinary judgment.</p></div><Link href="/insights" className="btn-secondary">Open Insights <ArrowRight size={16} /></Link></div><div className="mt-5 grid gap-3 md:grid-cols-3">{lanes.map(({ label, copy, icon: Icon, tone }) => <div key={label} className="rounded-2xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-100"><span className={cn("grid h-10 w-10 place-items-center rounded-2xl", tone)}><Icon size={18} /></span><h3 className="mt-3 font-bold text-ink">{label}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{copy}</p></div>)}</div><div className="mt-4 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white"><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><Sparkles size={16} /></span><p className="text-sm"><strong>Pet Intelligence Engine</strong><span className="text-slate-300"> turns the authorized record into source-linked insights, alerts and next actions.</span></p></div></section>;
}
