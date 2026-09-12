"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ClipboardCopy, FileText, HeartPulse, Pill, Printer, ShieldAlert, Stethoscope } from "lucide-react";
import { usePetcare } from "@/features/petcare-store";
import { formatDate, WorkspaceShell } from "@/features/workspace-shell";

export default function EmergencyPage() {
  const { pets, records, medications, vaccinations, user } = usePetcare();
  const [petId, setPetId] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { if (!pets.some((pet) => pet.id === petId)) setPetId(pets[0]?.id ?? ""); }, [petId, pets]);
  const pet = pets.find((item) => item.id === petId);
  const petRecords = records.filter((item) => item.petId === petId).sort((left, right) => right.date.localeCompare(left.date));
  const petMedications = medications.filter((item) => item.petId === petId).sort((left, right) => right.startDate.localeCompare(left.startDate));
  const petVaccinations = vaccinations.filter((item) => item.petId === petId).sort((left, right) => right.nextDue.localeCompare(left.nextDue));

  async function copyHandoff() {
    if (!pet || !navigator.clipboard) return;
    const summary = [
      `${pet.name} — PetCare emergency handoff`,
      `Owner: ${user.name}${user.phone ? ` (${user.phone})` : ""}`,
      `Species / breed: ${pet.species} / ${pet.breed}`,
      `Microchip: ${pet.microchipId ?? "not recorded"}`,
      `Known allergies: ${pet.allergies.length ? pet.allergies.join(", ") : "none recorded"}`,
      `Conditions: ${pet.conditions.length ? pet.conditions.join(", ") : "none recorded"}`,
      `Medication history: ${petMedications.length ? petMedications.map((item) => `${item.name} (${item.frequency})`).join("; ") : "none recorded"}`,
      `Latest care record: ${petRecords[0] ? `${petRecords[0].reason} on ${formatDate(petRecords[0].date)}` : "none recorded"}`,
    ].join("\n");
    await navigator.clipboard.writeText(summary);
    setCopied(true);
  }

  if (!pet) {
    return <WorkspaceShell title="Emergency mode" subtitle="Important facts, ready to hand off."><div className="surface mx-auto max-w-xl p-10 text-center"><ShieldAlert className="mx-auto text-rose-600" size={34} /><h2 className="mt-4 text-xl font-black text-ink">Add a pet profile first.</h2><p className="mt-2 text-sm text-slate-600">Emergency mode organizes the facts you have recorded for a quick veterinary handoff.</p><Link href="/onboarding" className="btn-primary mt-6">Create pet passport</Link></div></WorkspaceShell>;
  }

  return (
    <WorkspaceShell title="Emergency mode" subtitle="Important facts, ready to hand off—never a substitute for emergency veterinary care.">
      <div className="space-y-6">
        <section className="rounded-3xl border border-rose-200 bg-gradient-to-br from-[#fff1ef] via-white to-[#fff8e8] p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><span className="eyebrow bg-white text-rose-700"><AlertTriangle size={14} /> Urgent care support</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink">Act quickly, then share the facts.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">For severe, sudden or worsening symptoms, contact a veterinarian or emergency veterinary service now. PetCare Hub cannot diagnose, prescribe or determine whether a symptom is an emergency.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={copyHandoff} className="btn-primary"><ClipboardCopy size={16} /> {copied ? "Copied" : "Copy handoff"}</button><button type="button" onClick={() => window.print()} className="btn-secondary"><Printer size={16} /> Print</button></div></div></section>
        <section className="surface p-5"><label className="field-label" htmlFor="emergency-pet">Pet emergency card</label><select className="field mt-2 max-w-md" id="emergency-pet" value={petId} onChange={(event) => { setPetId(event.target.value); setCopied(false); }}>{pets.map((item) => <option value={item.id} key={item.id}>{item.name} · {item.species}</option>)}</select></section>
        <section className="grid gap-6 xl:grid-cols-[.95fr_1.05fr]"><article className="overflow-hidden rounded-3xl bg-ink text-white shadow-lift"><div className="p-6 sm:p-8"><div className="flex gap-4"><img src={pet.image} alt={pet.name} className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/15" /><div><p className="text-sm font-bold text-[#a7ded2]">EMERGENCY PROFILE</p><h2 className="mt-1 text-3xl font-black">{pet.name}</h2><p className="mt-1 text-sm text-slate-300">{pet.breed} · {pet.gender} · {pet.weight} kg</p></div></div><dl className="mt-7 grid gap-5 text-sm sm:grid-cols-2"><div><dt className="font-bold text-white/60">Owner</dt><dd className="mt-1 font-bold">{user.name}</dd><dd className="text-white/75">{user.phone ?? "Phone not recorded"}</dd></div><div><dt className="font-bold text-white/60">Microchip</dt><dd className="mt-1 font-bold">{pet.microchipId ?? "Not recorded"}</dd></div><div><dt className="font-bold text-white/60">Known allergies</dt><dd className="mt-1 font-bold">{pet.allergies.length ? pet.allergies.join(", ") : "None recorded"}</dd></div><div><dt className="font-bold text-white/60">Conditions</dt><dd className="mt-1 font-bold">{pet.conditions.length ? pet.conditions.join(", ") : "None recorded"}</dd></div></dl></div></article>
          <div className="space-y-5"><article className="surface p-6"><div className="flex gap-3"><Pill className="shrink-0 text-moss" /><div><h2 className="font-black text-ink">Medication history</h2><p className="mt-1 text-sm text-slate-600">Show the prescribing veterinarian, schedule and date range if you have it.</p></div></div><div className="mt-5 space-y-3">{petMedications.length ? petMedications.map((item) => <div key={item.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-bold text-ink">{item.name} · {item.dosage}</p><p className="mt-1 text-sm text-slate-600">{item.frequency} · {item.startDate} to {item.endDate || "ongoing"}</p><p className="mt-1 text-xs text-slate-500">Recorded veterinarian: {item.veterinarian}</p></div>) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No medication history is recorded.</p>}</div></article>
            <article className="surface p-6"><div className="flex gap-3"><HeartPulse className="shrink-0 text-moss" /><div><h2 className="font-black text-ink">Recent care facts</h2><p className="mt-1 text-sm text-slate-600">Use these as context for a professional, not to self-diagnose.</p></div></div><div className="mt-5 space-y-3">{petRecords.slice(0, 2).map((item) => <div key={item.id} className="rounded-2xl bg-mint/45 p-4"><p className="font-bold text-ink">{item.reason}</p><p className="mt-1 text-sm text-slate-600">{formatDate(item.date)} · {item.veterinarian}</p></div>)}{petVaccinations.slice(0, 1).map((item) => <div key={item.id} className="rounded-2xl bg-sky p-4"><p className="font-bold text-ink">{item.name} vaccination</p><p className="mt-1 text-sm text-slate-600">Next due {formatDate(item.nextDue)}</p></div>)}{!petRecords.length && !petVaccinations.length ? <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No clinical records are recorded yet.</p> : null}</div></article></div>
        </section>
        <section className="grid gap-4 sm:grid-cols-3"><Link href="/veterinarians" className="surface flex gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"><Stethoscope className="text-moss" /><span><span className="block font-black text-ink">Find a veterinarian</span><span className="mt-1 block text-sm text-slate-600">Open the vetted directory</span></span></Link><Link href="/passport" className="surface flex gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lift"><FileText className="text-moss" /><span><span className="block font-black text-ink">Open passport</span><span className="mt-1 block text-sm text-slate-600">Show timeline and ID</span></span></Link><article className="surface flex gap-3 p-5"><ShieldAlert className="text-rose-600" /><span><span className="block font-black text-ink">Keep observing</span><span className="mt-1 block text-sm text-slate-600">Note onset, changes, food and behaviour for the care team.</span></span></article></section>
      </div>
    </WorkspaceShell>
  );
}
