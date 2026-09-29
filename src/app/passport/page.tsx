"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarDays, CheckCircle2, Copy, FileText, LockKeyhole, Pill, Printer, QrCode, Share2, ShieldCheck, Syringe } from "lucide-react";
import { usePetcare } from "@/features/petcare-store";
import { formatDate, formatPetAge, WorkspaceShell } from "@/features/workspace-shell";

function passportToken(id: string) {
  let value = 0;
  for (const character of id) value = (value * 31 + character.charCodeAt(0)) >>> 0;
  return `PCH-${value.toString(36).toUpperCase().padStart(7, "0")}`;
}

function qrCells(seed: string) {
  let value = 2_166_136_261;
  for (const character of seed) {
    value ^= character.charCodeAt(0);
    value = Math.imul(value, 16_777_619);
  }
  return Array.from({ length: 21 * 21 }, (_, index) => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return Boolean((value >>> 0) & 1) || index % 17 === 0;
  });
}

function finderCell(row: number, column: number, top: number, left: number) {
  const x = column - left;
  const y = row - top;
  if (x < 0 || x > 6 || y < 0 || y > 6) return undefined;
  return x === 0 || x === 6 || y === 0 || y === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
}

function PassportMarker({ token }: { token: string }) {
  const cells = useMemo(() => qrCells(token), [token]);
  return (
    <div className="rounded-[1.7rem] bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <div className="grid aspect-square w-44 grid-cols-[repeat(21,minmax(0,1fr))] gap-px bg-white" aria-label="Pet passport check-in code">
        {cells.map((cell, index) => {
          const row = Math.floor(index / 21);
          const column = index % 21;
          const finder = finderCell(row, column, 0, 0) ?? finderCell(row, column, 0, 14) ?? finderCell(row, column, 14, 0);
          return <span key={index} className={finder ?? cell ? "bg-ink" : "bg-white"} />;
        })}
      </div>
      <p className="mt-3 text-center font-mono text-xs font-bold tracking-[.16em] text-slate-700">{token}</p>
    </div>
  );
}

export default function PassportPage() {
  const { pets, records, vaccinations, medications, reminders, weights, documents, user, hydrated } = usePetcare();
  const search = useSearchParams();
  const [petId, setPetId] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const requestedPet = search.get("pet");
    if (requestedPet && pets.some((pet) => pet.id === requestedPet)) {
      setPetId(requestedPet);
    } else if (!pets.some((pet) => pet.id === petId)) {
      setPetId(pets[0]?.id ?? "");
    }
  }, [petId, pets, search]);

  const pet = pets.find((item) => item.id === petId);
  const token = pet ? passportToken(`${user.id}:${pet.id}`) : "PCH-PRIVATE";
  const url = typeof window === "undefined" || !pet ? "" : `${window.location.origin}/passport?pet=${encodeURIComponent(pet.id)}`;
  const petRecords = records.filter((item) => item.petId === petId).sort((left, right) => right.date.localeCompare(left.date));
  const petVaccinations = vaccinations.filter((item) => item.petId === petId).sort((left, right) => right.administered.localeCompare(left.administered));
  const petMedications = medications.filter((item) => item.petId === petId).sort((left, right) => right.startDate.localeCompare(left.startDate));
  const petDocuments = documents.filter((item) => item.petId === petId);
  const petReminders = reminders.filter((item) => item.petId === petId && item.status !== "DONE").sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const latestWeight = weights.filter((item) => item.petId === petId).sort((left, right) => right.date.localeCompare(left.date))[0];

  async function sharePassport() {
    if (!pet || !url) return;
    const shareData = { title: `${pet.name}'s PetCare Passport`, text: `${pet.name}'s private PetCare passport check-in link`, url };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setNotice("Local passport link copied to your clipboard.");
      }
    } catch {
      // Closing a native share dialog should not surface as an error.
    }
  }

  async function copyLink() {
    if (!url || !navigator.clipboard) return;
    await navigator.clipboard.writeText(url);
    setNotice("Local passport link copied to your clipboard.");
  }

  if (!hydrated) {
    return <WorkspaceShell title="Digital Pet Passport" subtitle="Loading your private pet record."><div className="surface p-12 text-center text-sm font-semibold text-slate-600">Loading passport…</div></WorkspaceShell>;
  }

  if (!pets.length || !pet) {
    return <WorkspaceShell title="Digital Pet Passport" subtitle="A share-ready view of the important care facts."><div className="surface mx-auto max-w-xl p-10 text-center"><QrCode className="mx-auto text-moss" size={32} /><h2 className="mt-4 text-xl font-black text-ink">Create a pet profile to issue a passport.</h2><p className="mt-2 text-sm leading-6 text-slate-600">The passport keeps identity, allergies, medication, vaccinations, care history and an emergency handoff in one place.</p><Link href="/onboarding" className="btn-primary mt-6">Create pet passport</Link></div></WorkspaceShell>;
  }

  return (
    <WorkspaceShell title="Digital Pet Passport" subtitle="A private, share-ready view of the important care facts.">
      <div className="space-y-6">
        {notice ? <p className="rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-moss">{notice}</p> : null}
        <section className="overflow-hidden rounded-3xl bg-ink text-white shadow-lift">
          <div className="grid gap-7 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="eyebrow bg-white/10 text-[#a7ded2]"><ShieldCheck size={14} /> Private health passport</span>
              <div className="mt-5 flex flex-wrap items-center gap-4"><img src={pet.image} alt={pet.name} className="h-20 w-20 rounded-3xl object-cover ring-4 ring-white/15" /><div><h1 className="text-3xl font-black tracking-[-.04em]">{pet.name}</h1><p className="mt-1 text-slate-300">{pet.breed} · {pet.species} · {formatPetAge(pet.birthDate)}</p><p className="mt-2 text-sm text-[#a7ded2]">Passport owner: {user.name}</p></div></div>
              <div className="mt-6 flex flex-wrap gap-3"><button type="button" className="btn-secondary" onClick={sharePassport}><Share2 size={16} /> Share local link</button><button type="button" className="btn-secondary" onClick={copyLink}><Copy size={16} /> Copy link</button><button type="button" className="btn-secondary" onClick={() => window.print()}><Printer size={16} /> Print card</button></div>
            </div>
            <div className="flex justify-center"><PassportMarker token={token} /></div>
          </div>
        </section>

        {pets.length > 1 ? <section className="surface p-5"><label className="field-label" htmlFor="passport-pet">Passport for</label><select className="field mt-2 max-w-md" id="passport-pet" value={petId} onChange={(event) => setPetId(event.target.value)}>{pets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}</select></section> : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <article className="surface p-5"><Syringe className="text-moss" size={20} /><p className="mt-4 text-sm font-bold text-slate-500">Vaccinations</p><p className="mt-1 text-2xl font-black text-ink">{petVaccinations.length}</p><p className="mt-1 text-sm text-slate-600">recorded on passport</p></article>
          <article className="surface p-5"><Pill className="text-moss" size={20} /><p className="mt-4 text-sm font-bold text-slate-500">Medication</p><p className="mt-1 text-2xl font-black text-ink">{petMedications.length}</p><p className="mt-1 text-sm text-slate-600">history entries</p></article>
          <article className="surface p-5"><CalendarDays className="text-moss" size={20} /><p className="mt-4 text-sm font-bold text-slate-500">Next care</p><p className="mt-1 truncate text-lg font-black text-ink">{petReminders[0]?.title ?? "All caught up"}</p><p className="mt-1 text-sm text-slate-600">{petReminders[0] ? formatDate(petReminders[0].date) : "No open task"}</p></article>
          <article className="surface p-5"><CheckCircle2 className="text-moss" size={20} /><p className="mt-4 text-sm font-bold text-slate-500">Latest weight</p><p className="mt-1 text-2xl font-black text-ink">{latestWeight?.weight ?? pet.weight} kg</p><p className="mt-1 text-sm text-slate-600">{latestWeight ? formatDate(latestWeight.date) : "Profile value"}</p></article>
          <article className="surface p-5"><FileText className="text-moss" size={20} /><p className="mt-4 text-sm font-bold text-slate-500">Documents</p><p className="mt-1 text-2xl font-black text-ink">{petDocuments.length}</p><p className="mt-1 text-sm text-slate-600">{petDocuments.filter((item) => item.status === "PENDING_REVIEW").length ? "awaiting review" : "reviewed metadata"}</p></article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
          <div className="surface p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black tracking-[-.03em] text-ink">Health timeline</h2><p className="mt-1 text-sm text-slate-600">The recent facts a veterinarian or caregiver may need quickly.</p></div><Link href="/health" className="btn-ghost"><FileText size={16} /> Manage records</Link></div><div className="mt-5 space-y-3">{[...petRecords.map((item) => ({ id: item.id, date: item.date, title: item.reason, detail: item.veterinarian })), ...petVaccinations.map((item) => ({ id: item.id, date: item.administered, title: `${item.name} vaccination`, detail: `Next due ${formatDate(item.nextDue)}` }))].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 7).map((item) => <div key={item.id} className="flex gap-4 rounded-2xl bg-slate-50 p-4"><span className="mt-1 h-3 w-3 shrink-0 rounded-full bg-moss ring-4 ring-mint" /><div><p className="font-bold text-ink">{item.title}</p><p className="mt-1 text-sm text-slate-600">{formatDate(item.date)} · {item.detail}</p></div></div>)}{!petRecords.length && !petVaccinations.length ? <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">No health entries yet. Add a vaccination, medical record or weight in Health to start the timeline.</p> : null}</div></div>
          <aside className="space-y-6"><section className="surface p-6"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-orange-600" /><div><h2 className="font-black text-ink">Emergency handoff</h2><p className="mt-2 text-sm leading-6 text-slate-600">Show the verified facts below while arranging veterinary care. The passport never provides a diagnosis.</p></div></div><dl className="mt-5 space-y-3 text-sm"><div><dt className="font-bold text-slate-500">Known allergies</dt><dd className="mt-1 text-ink">{pet.allergies.length ? pet.allergies.join(", ") : "None recorded"}</dd></div><div><dt className="font-bold text-slate-500">Microchip</dt><dd className="mt-1 text-ink">{pet.microchipId ?? "Not recorded"}</dd></div><div><dt className="font-bold text-slate-500">Current medication history</dt><dd className="mt-1 text-ink">{petMedications.length ? petMedications.map((item) => item.name).join(", ") : "None recorded"}</dd></div></dl><Link href="/emergency" className="btn-primary mt-6 w-full">Open emergency mode</Link></section><section className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><p className="flex gap-2 font-bold text-ink"><LockKeyhole size={17} className="text-moss" /> Privacy note</p><p className="mt-2 text-sm leading-6 text-slate-600">This local build keeps passport details in the signed-in browser workspace. The share action copies the local link; deploy the server-backed API before sharing records outside your trusted care team.</p></section></aside>
        </section>
      </div>
    </WorkspaceShell>
  );
}
