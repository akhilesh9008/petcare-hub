"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, CalendarDays, ClipboardPlus, Sparkles, X } from "lucide-react";
import {
  DigitalTwinFlow,
  NextBestActions,
  PetCareReadinessCard,
  PetFreshnessPanel,
  PetInsightsPanel,
  PetLifeTimeline,
  PetWeeklyBriefCard,
} from "@/components";
import type { PetInsightOutcome } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";
import {
  buildCarePlan,
  buildPetContext,
  buildPetWeeklyBrief,
  calculatePetCareReadiness,
  generatePetInsights,
  getNextBestActions,
  getPetDataFreshness,
  summarizeInsightOutcomes,
  type PetInsight,
} from "@/lib/pet-digital-twin";

export default function PetInsightsPage() {
  const searchParams = useSearchParams();
  const {
    pets, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, products,
    insightStates, memories, documents, insightOutcomes, dismissInsight, snoozeInsight, recordInsightOutcome, addMemory, verifyMemory,
  } = usePetcare();
  const [petId, setPetId] = useState("");
  const [outcomeInsight, setOutcomeInsight] = useState<PetInsight | null>(null);
  const [outcomeStatus, setOutcomeStatus] = useState<PetInsightOutcome["status"]>("COMPLETED");
  const [outcomeNote, setOutcomeNote] = useState("");
  const [memoryLabel, setMemoryLabel] = useState("");
  const [memoryValue, setMemoryValue] = useState("");

  useEffect(() => {
    const requested = searchParams.get("pet");
    if (requested && pets.some((pet) => pet.id === requested)) setPetId(requested);
    else if (!pets.some((pet) => pet.id === petId)) setPetId(pets[0]?.id ?? "");
  }, [petId, pets, searchParams]);

  const pet = pets.find((item) => item.id === petId);
  const context = useMemo(() => pet ? buildPetContext({
    pet, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, memories, documents, insightOutcomes, products,
  }) : undefined, [pet, records, vaccinations, medications, weights, reminders, appointments, orders, bookings, providers, vets, bands, bandMetrics, habits, bandAlerts, locationPoints, memories, documents, insightOutcomes, products]);
  const readiness = useMemo(() => context ? calculatePetCareReadiness(context) : undefined, [context]);
  const insights = useMemo(() => context ? generatePetInsights(context) : [], [context]);
  const visibleInsights = useMemo(() => {
    const now = Date.now();
    return insights.filter((insight) => {
      if (insightOutcomes.some((outcome) => outcome.petId === insight.petId && outcome.insightId === insight.id)) return false;
      const state = insightStates.find((item) => item.petId === insight.petId && item.insightId === insight.id);
      if (!state) return true;
      if (state.status === "DISMISSED") return false;
      return !state.until || new Date(state.until).getTime() <= now;
    });
  }, [insights, insightOutcomes, insightStates]);
  const actions = useMemo(() => getNextBestActions(visibleInsights), [visibleInsights]);
  const carePlan = useMemo(() => context ? buildCarePlan(context, visibleInsights).slice(0, 5) : [], [context, visibleInsights]);
  const weeklyBrief = useMemo(() => context ? buildPetWeeklyBrief(context, visibleInsights) : undefined, [context, visibleInsights]);
  const freshness = useMemo(() => context ? getPetDataFreshness(context) : [], [context]);
  const outcomeSummary = useMemo(() => context ? summarizeInsightOutcomes(context) : undefined, [context]);

  function startOutcome(insight: PetInsight) {
    setOutcomeInsight(insight);
    setOutcomeStatus("COMPLETED");
    setOutcomeNote("");
  }

  function saveOutcome() {
    if (!outcomeInsight) return;
    recordInsightOutcome({
      petId: outcomeInsight.petId,
      insightId: outcomeInsight.id,
      actionId: outcomeInsight.action.id,
      actionLabel: outcomeInsight.action.label,
      status: outcomeStatus,
      note: outcomeNote.trim() || undefined,
    });
    setOutcomeInsight(null);
    setOutcomeNote("");
  }

  function saveMemory() {
    if (!pet || !memoryLabel.trim() || !memoryValue.trim()) return;
    addMemory({ petId: pet.id, kind: "FACT", label: memoryLabel.trim(), value: memoryValue.trim(), source: "OWNER", confidence: "MEDIUM" });
    setMemoryLabel("");
    setMemoryValue("");
  }

  if (!pet || !context || !readiness) {
    return <WorkspaceShell title="Pet Insights" subtitle="Your connected pet-care operating system."><div className="surface mx-auto max-w-2xl p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-moss"><Sparkles size={25} /></span><h2 className="mt-4 text-xl font-black text-ink">Create a pet passport to unlock Insights.</h2><p className="mt-2 text-sm leading-6 text-slate-600">The Digital Twin brings one pet&apos;s authorized health, care and life records into a single source-linked view.</p><Link href="/onboarding" className="btn-primary mt-5">Create pet passport</Link></div></WorkspaceShell>;
  }

  return (
    <WorkspaceShell title="Pet Insights" subtitle="One connected, explainable view of every recorded care detail." actions={<Link href={`/ai-assistant?pet=${pet.id}`} className="hidden btn-primary sm:inline-flex"><Bot size={16} /> Ask PetCare AI</Link>}>
      <div className="space-y-6">
        <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="eyebrow"><Sparkles size={14} /> Active digital twin</p><h1 className="mt-1 text-2xl font-black tracking-[-.035em] text-ink">{pet.name}&apos;s care intelligence</h1><p className="mt-1 text-sm text-slate-600">Only this pet&apos;s saved profile and authorized workspace records are included.</p></div>
          <label className="block min-w-[12rem]"><span className="field-label">Viewing pet</span><select className="field mt-1" value={petId} onChange={(event) => setPetId(event.target.value)}>{pets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}</select></label>
        </section>

        <DigitalTwinFlow petName={pet.name} />

        <section className="grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
          <PetCareReadinessCard readiness={readiness} />
          <NextBestActions actions={actions} />
        </section>

        {weeklyBrief ? <section className="grid gap-6 xl:grid-cols-[.92fr_1.08fr]"><PetWeeklyBriefCard brief={weeklyBrief} /><PetFreshnessPanel items={freshness} /></section> : null}

        <section className="surface p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow"><ClipboardPlus size={14} /> Context memory</p><h2 className="mt-1 font-black tracking-[-.02em] text-ink">Facts that make {pet.name}&apos;s care more personal</h2><p className="mt-1 max-w-2xl text-sm leading-5 text-slate-600">Keep preferences and owner observations source-tagged. Verify them when you have checked they are still accurate; they remain separate from clinical records.</p></div><span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800">{context.knowledge.memories.length} saved</span></div><div className="mt-5 grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><div className="space-y-2">{context.knowledge.memories.length ? context.knowledge.memories.filter((memory) => memory.status !== "SUPERSEDED").map((memory) => <article key={memory.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"><div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-sm font-bold text-ink">{memory.label}</p><p className="mt-1 text-sm leading-5 text-slate-600">{memory.value}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${memory.status === "VERIFIED" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{memory.status.toLowerCase()}</span></div><div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>{memory.source.toLowerCase().replaceAll("_", " ")}</span><span>·</span><span>{memory.confidence.toLowerCase()} confidence</span>{memory.status !== "VERIFIED" ? <button type="button" onClick={() => verifyMemory(memory.id, "Pet owner")} className="ml-auto font-bold text-teal-700 hover:text-teal-900">Mark verified</button> : null}</div></article>) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No owner context is saved yet.</p>}</div><div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4"><p className="text-sm font-bold text-ink">Add an owner observation</p><label className="mt-3 block"><span className="field-label">Short label</span><input value={memoryLabel} onChange={(event) => setMemoryLabel(event.target.value)} className="field mt-1" placeholder="For example, walking routine" /></label><label className="mt-3 block"><span className="field-label">Factual note</span><textarea value={memoryValue} onChange={(event) => setMemoryValue(event.target.value)} className="field mt-1 min-h-24 py-3" placeholder="Describe what you observed or prefer." /></label><button type="button" className="btn-primary mt-3 w-full" onClick={saveMemory}>Save context note</button></div></div></section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <PetInsightsPanel insights={visibleInsights} onDismiss={(insight) => dismissInsight(pet.id, insight.id)} onSnooze={(insight) => snoozeInsight(pet.id, insight.id)} onRecordOutcome={startOutcome} />
          <div className="surface p-6">
            <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-mint text-moss"><CalendarDays size={19} /></span><div><h2 className="font-black tracking-[-.02em] text-ink">Unified care plan</h2><p className="mt-1 text-sm leading-5 text-slate-600">Tasks created from the calendar plus meaningful record-based follow-ups.{outcomeSummary?.total ? ` ${outcomeSummary.completionRate ?? 0}% of recorded action outcomes are complete.` : ""}</p></div></div>
            <div className="mt-5 space-y-3">{carePlan.length ? carePlan.map((task) => <Link href={task.action.href} key={task.id} className="group block rounded-xl border border-slate-100 bg-slate-50/70 p-3 transition hover:border-teal-100 hover:bg-teal-50"><div className="flex items-start gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${task.status === "OVERDUE" ? "bg-rose-500" : task.status === "COMPLETED" ? "bg-emerald-500" : "bg-teal-500"}`} /><span className="min-w-0 flex-1"><span className="block text-sm font-bold text-ink">{task.title}</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">{task.dueDate ? `Due ${task.dueDate} · ` : ""}{task.reason}</span></span><ArrowRight className="mt-1 shrink-0 text-slate-400 group-hover:text-teal-700" size={15} /></div></Link>) : <p className="rounded-xl bg-mint/40 p-4 text-sm text-slate-600">No open care task is recorded yet.</p>}</div>
            <Link href="/calendar" className="btn-secondary mt-5"><CalendarDays size={16} /> Open care calendar</Link>
          </div>
        </section>

        <PetLifeTimeline events={context.events} action={<Link href={`/pets/${pet.id}`} className="btn-ghost">Open passport <ArrowRight size={15} /></Link>} />

        <section className="rounded-3xl border border-sky-100 bg-sky/35 p-5 sm:flex sm:items-center sm:justify-between sm:p-6"><div className="flex gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-sky-700 shadow-sm"><ClipboardPlus size={20} /></span><div><h2 className="font-black text-ink">Make the next insight more useful</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Add factual records, care activities, document metadata, or a consented Health Band session. The system summarizes the records; it does not diagnose or prescribe.</p></div></div><div className="mt-4 flex flex-wrap gap-2 sm:mt-0"><Link href="/health" className="btn-secondary">Add record</Link><Link href="/documents" className="btn-secondary">Add document</Link><Link href={`/health-band?pet=${pet.id}`} className="btn-primary">Health Band</Link></div></section>
      </div>
      {outcomeInsight ? <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true" aria-labelledby="outcome-title"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Close the loop</p><h2 id="outcome-title" className="mt-1 text-xl font-black text-ink">Record an action outcome</h2><p className="mt-2 text-sm leading-6 text-slate-600">For: {outcomeInsight.title}</p></div><button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-ink" onClick={() => setOutcomeInsight(null)} aria-label="Close"><X size={18} /></button></div><label className="mt-5 block"><span className="field-label">Outcome</span><select value={outcomeStatus} onChange={(event) => setOutcomeStatus(event.target.value as PetInsightOutcome["status"])} className="field mt-1"><option value="COMPLETED">Completed</option><option value="FOLLOW_UP_NEEDED">Follow-up needed</option><option value="NOT_RELEVANT">Not relevant</option></select></label><label className="mt-4 block"><span className="field-label">Note (optional)</span><textarea className="field mt-1 min-h-24 py-3" value={outcomeNote} onChange={(event) => setOutcomeNote(event.target.value)} placeholder="Add a factual note about what happened." /></label><p className="mt-3 text-xs leading-5 text-slate-500">This records the owner&apos;s action outcome without changing the original evidence or medical record.</p><div className="mt-5 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setOutcomeInsight(null)}>Cancel</button><button className="btn-primary" onClick={saveOutcome}>Save outcome</button></div></div></div> : null}
    </WorkspaceShell>
  );
}
