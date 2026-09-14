"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, CalendarDays, ClipboardPlus, Sparkles } from "lucide-react";
import { DigitalTwinFlow, NextBestActions, PetCareReadinessCard, PetInsightsPanel, PetLifeTimeline } from "@/components";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";
import { buildCarePlan, buildPetContext, calculatePetCareReadiness, generatePetInsights, getNextBestActions } from "@/lib/pet-digital-twin";

export default function PetInsightsPage() {
  const searchParams = useSearchParams();
  const {
    pets, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, products,
    insightStates, dismissInsight, snoozeInsight,
  } = usePetcare();
  const [petId, setPetId] = useState("");

  useEffect(() => {
    const requested = searchParams.get("pet");
    if (requested && pets.some((pet) => pet.id === requested)) setPetId(requested);
    else if (!pets.some((pet) => pet.id === petId)) setPetId(pets[0]?.id ?? "");
  }, [petId, pets, searchParams]);

  const pet = pets.find((item) => item.id === petId);
  const context = useMemo(() => pet ? buildPetContext({
    pet, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, products,
  }) : undefined, [pet, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, products]);
  const readiness = useMemo(() => context ? calculatePetCareReadiness(context) : undefined, [context]);
  const insights = useMemo(() => context ? generatePetInsights(context) : [], [context]);
  const visibleInsights = useMemo(() => {
    const now = Date.now();
    return insights.filter((insight) => {
      const state = insightStates.find((item) => item.petId === insight.petId && item.insightId === insight.id);
      if (!state) return true;
      if (state.status === "DISMISSED") return false;
      return !state.until || new Date(state.until).getTime() <= now;
    });
  }, [insights, insightStates]);
  const actions = useMemo(() => getNextBestActions(visibleInsights), [visibleInsights]);
  const carePlan = useMemo(() => context ? buildCarePlan(context, visibleInsights).slice(0, 5) : [], [context, visibleInsights]);

  if (!pet || !context || !readiness) {
    return <WorkspaceShell title="Pet Insights" subtitle="Your connected pet-care operating system."><div className="surface mx-auto max-w-2xl p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-moss"><Sparkles size={25} /></span><h2 className="mt-4 text-xl font-black text-ink">Create a pet passport to unlock Insights.</h2><p className="mt-2 text-sm leading-6 text-slate-600">The Digital Twin brings one pet’s authorized health, care and life records into a single source-linked view.</p><Link href="/onboarding" className="btn-primary mt-5">Create pet passport</Link></div></WorkspaceShell>;
  }

  return (
    <WorkspaceShell title="Pet Insights" subtitle="One connected, explainable view of every recorded care detail." actions={<Link href={`/ai-assistant?pet=${pet.id}`} className="hidden btn-primary sm:inline-flex"><Bot size={16} /> Ask PetCare AI</Link>}>
      <div className="space-y-6">
        <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="eyebrow"><Sparkles size={14} /> Active digital twin</p><h1 className="mt-1 text-2xl font-black tracking-[-.035em] text-ink">{pet.name}’s care intelligence</h1><p className="mt-1 text-sm text-slate-600">Only this pet’s saved profile and authorized workspace records are included.</p></div>
          <label className="block min-w-[12rem]"><span className="field-label">Viewing pet</span><select className="field mt-1" value={petId} onChange={(event) => setPetId(event.target.value)}>{pets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}</select></label>
        </section>

        <DigitalTwinFlow petName={pet.name} />

        <section className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]"><PetCareReadinessCard readiness={readiness} /><NextBestActions actions={actions} /></section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <PetInsightsPanel insights={visibleInsights} onDismiss={(insight) => dismissInsight(pet.id, insight.id)} onSnooze={(insight) => snoozeInsight(pet.id, insight.id)} />
          <div className="surface p-6"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-moss"><CalendarDays size={19} /></span><div><h2 className="font-black tracking-[-.02em] text-ink">Unified care plan</h2><p className="mt-1 text-sm leading-5 text-slate-600">Tasks created from the calendar plus meaningful record-based follow-ups.</p></div></div><div className="mt-5 space-y-3">{carePlan.length ? carePlan.map((task) => <Link href={task.action.href} key={task.id} className="group block rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-teal-100 hover:bg-teal-50"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${task.status === "OVERDUE" ? "bg-rose-500" : task.status === "COMPLETED" ? "bg-emerald-500" : "bg-teal-500"}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">{task.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.dueDate ? `Due ${task.dueDate} · ` : ""}{task.reason}</span></span><ArrowRight className="mt-1 shrink-0 text-slate-400 group-hover:text-teal-700" size={15} /></div></Link>) : <p className="rounded-xl bg-mint/40 p-4 text-sm text-slate-600">No open care task is recorded yet.</p>}</div><Link href="/calendar" className="btn-secondary mt-5"><CalendarDays size={16} /> Open care calendar</Link></div>
        </section>

        <PetLifeTimeline events={context.events} action={<Link href={`/pets/${pet.id}`} className="btn-ghost">Open passport <ArrowRight size={15} /></Link>} />

        <section className="rounded-3xl border border-sky-100 bg-sky/35 p-5 sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm"><ClipboardPlus size={20} /></span><div><h2 className="font-black text-ink">Make the next insight more useful</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Add factual records, care activities or a consented Health Band session. The system summarizes the records; it does not diagnose or prescribe.</p></div></div><div className="mt-4 flex gap-2 sm:mt-0"><Link href="/health" className="btn-secondary">Add record</Link><Link href={`/health-band?pet=${pet.id}`} className="btn-primary">Health Band</Link></div></section>
      </div>
    </WorkspaceShell>
  );
}
