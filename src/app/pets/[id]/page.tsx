"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarDays, ClipboardList, Edit3, HeartPulse, Package, Pill, QrCode, ShieldCheck, ShoppingBag, Watch } from "lucide-react";
import { Badge, CareStatusDonut, HealthTimeline, WeightTrendChart } from "@/components";
import { PetFormModal } from "@/features/pet-form";
import { usePetcare } from "@/features/petcare-store";
import { formatDate, formatPetAge, WorkspaceShell } from "@/features/workspace-shell";

export default function PetProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { pets, records, vaccinations, medications, weights, reminders, appointments, orders, bands, updatePet } = usePetcare();
  const [editing, setEditing] = useState(false);
  const pet = pets.find((item) => item.id === id);

  if (!pet) {
    return <WorkspaceShell title="Pet not found"><div className="surface p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-2xl">🐾</span><h2 className="mt-4 text-xl font-black text-ink">This pet profile is unavailable.</h2><Link href="/pets" className="btn-primary mt-5">Back to my pets</Link></div></WorkspaceShell>;
  }

  const petRecords = records.filter((item) => item.petId === pet.id).sort((left, right) => right.date.localeCompare(left.date));
  const petVaccinations = vaccinations.filter((item) => item.petId === pet.id).sort((left, right) => right.administered.localeCompare(left.administered));
  const petMeds = medications.filter((item) => item.petId === pet.id).sort((left, right) => right.startDate.localeCompare(left.startDate));
  const petWeights = weights.filter((item) => item.petId === pet.id).sort((left, right) => left.date.localeCompare(right.date));
  const petReminders = reminders.filter((item) => item.petId === pet.id && item.status !== "DONE").sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const petAppointments = appointments.filter((item) => item.petId === pet.id);
  const petBand = bands.find((item) => item.petId === pet.id);
  const latestWeight = petWeights.at(-1)?.weight ?? pet.weight;
  const trend = petWeights.length > 1 ? latestWeight > petWeights[0].weight ? "Increasing" : latestWeight < petWeights[0].weight ? "Decreasing" : "Stable" : "No trend yet";
  const timeline = [
    ...petRecords.map((item) => ({ id: `record-${item.id}`, date: item.date, title: item.reason, description: item.diagnosis, type: item.type === "Consultation" ? "visit" as const : "record" as const, meta: item.veterinarian })),
    ...petVaccinations.map((item) => ({ id: `vaccination-${item.id}`, date: item.administered, title: item.name, description: `Next due ${formatDate(item.nextDue)}`, type: "vaccination" as const, meta: item.veterinarian })),
    ...petWeights.map((item) => ({ id: `weight-${item.id}`, date: item.date, title: "Weight recorded", description: `${item.weight} kg`, type: "weight" as const })),
  ].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <WorkspaceShell
      title={pet.name}
      subtitle={`${pet.breed} · ${formatPetAge(pet.birthDate)} · ${pet.species}`}
      actions={<div className="flex gap-2"><Link href={`/passport?pet=${pet.id}`} className="btn-secondary"><QrCode size={16} /> Passport</Link><button type="button" onClick={() => setEditing(true)} className="btn-primary"><Edit3 size={16} /> Edit profile</button></div>}
    >
      <div className="space-y-6">
        <Link href="/pets" className="btn-ghost -ml-2"><ArrowLeft size={16} /> All pets</Link>
        <section className="overflow-hidden rounded-3xl bg-ink text-white shadow-lift"><div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[auto_1fr_auto] lg:items-center"><img className="h-28 w-28 rounded-3xl object-cover ring-4 ring-white/15" src={pet.image} alt={pet.name} /><div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-black tracking-[-.04em]">{pet.name}</h1><Badge tone={pet.vaccinationStatus === "Up to date" ? "green" : "orange"}>{pet.vaccinationStatus}</Badge></div><p className="mt-2 text-slate-300">{pet.breed} · {pet.gender} · {formatPetAge(pet.birthDate)} · {pet.color}</p><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm"><span><strong className="text-[#a7ded2]">Weight</strong> {latestWeight} kg</span><span><strong className="text-[#a7ded2]">Activity</strong> {pet.activityLevel}</span>{pet.microchipId ? <span><strong className="text-[#a7ded2]">Microchip</strong> {pet.microchipId}</span> : null}</div></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-white/65">NEXT CARE</p><p className="mt-2 font-bold">{petReminders[0]?.title ?? "Nothing due soon"}</p><p className="mt-1 text-sm text-[#a7ded2]">{petReminders[0] ? formatDate(petReminders[0].date) : "You’re all caught up"}</p></div></div></section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{[
          { icon: ShieldCheck, label: "Vaccinations", value: `${petVaccinations.length} logged`, href: "/health" },
          { icon: Pill, label: "Medication", value: petMeds.length ? `${petMeds.length} history entries` : "None recorded", href: "/health" },
          { icon: Watch, label: "Health Band", value: petBand?.status === "CONNECTED" ? `${petBand.battery}% battery` : "Set up tracker", href: `/health-band?pet=${pet.id}` },
          { icon: CalendarDays, label: "Appointments", value: `${petAppointments.length} visits`, href: "/appointments" },
          { icon: Package, label: "Orders", value: `${orders.filter((item) => item.petId === pet.id).length} purchases`, href: "/orders" },
        ].map(({ icon: Icon, label, value, href }) => <Link href={href} key={label} className="surface flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-lift"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-mint text-moss"><Icon size={19} /></span><span><span className="block text-sm font-bold text-ink">{label}</span><span className="block text-sm text-slate-600">{value}</span></span></Link>)}</section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><WeightTrendChart data={petWeights.map((item) => ({ date: item.date, weight: item.weight }))} trendLabel={trend} action={<Link href="/health" className="btn-ghost">Add weight</Link>} /><CareStatusDonut title="Health at a glance" description="A simple snapshot, not a medical assessment." centerValue={petVaccinations.length + petRecords.length} centerLabel="care records" data={[{ name: "Vaccinations", value: petVaccinations.length, color: "#0d9488" }, { name: "Visits", value: petRecords.length, color: "#38bdf8" }, { name: "Reminders", value: petReminders.length, color: "#f59e0b" }]} /></section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><HealthTimeline events={timeline} title="Health timeline" description="Appointments, records, vaccinations and weight in one chronological history." action={<Link href="/health" className="btn-ghost">Manage health</Link>} /><div className="surface p-6"><h2 className="font-black text-ink">Passport notes</h2><dl className="mt-4 space-y-4 text-sm"><div><dt className="font-bold text-slate-500">Known allergies</dt><dd className="mt-1 text-ink">{pet.allergies.length ? pet.allergies.join(", ") : "None recorded"}</dd></div><div><dt className="font-bold text-slate-500">Medical conditions</dt><dd className="mt-1 text-ink">{pet.conditions.length ? pet.conditions.join(", ") : "None recorded"}</dd></div><div><dt className="font-bold text-slate-500">Dietary preferences</dt><dd className="mt-1 text-ink">{pet.dietaryPreferences.length ? pet.dietaryPreferences.join(", ") : "No preference recorded"}</dd></div></dl><div className="mt-6 grid gap-2"><Link href={`/marketplace?pet=${pet.id}`} className="btn-secondary"><ShoppingBag size={16} /> View recommendations</Link><Link href="/ai-assistant" className="btn-secondary"><HeartPulse size={16} /> Ask about {pet.name}</Link></div></div></section>

        <section className="surface p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black tracking-[-.03em] text-ink">Care details</h2><p className="mt-1 text-sm text-slate-600">The Passport connects this profile with health history, services, reminders and care decisions.</p></div><Link href="/health" className="btn-primary"><ClipboardList size={16} /> Open health records</Link></div><div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-mint/55 p-4"><p className="font-bold text-ink">Upcoming reminders</p><ul className="mt-3 space-y-2 text-sm text-slate-700">{petReminders.length ? petReminders.slice(0, 3).map((item) => <li key={item.id} className="flex justify-between gap-3"><span>{item.title}</span><span className="shrink-0 font-semibold text-moss">{formatDate(item.date, { day: "numeric", month: "short" })}</span></li>) : <li>Nothing scheduled.</li>}</ul></div><div className="rounded-2xl bg-sky p-4"><p className="font-bold text-ink">Recent vet visit</p>{petRecords[0] ? <><p className="mt-3 text-sm font-semibold text-ink">{petRecords[0].reason}</p><p className="mt-1 text-sm text-slate-600">{formatDate(petRecords[0].date)} · {petRecords[0].veterinarian}</p></> : <p className="mt-3 text-sm text-slate-600">No records yet.</p>}</div></div></section>
      </div>
      {editing ? <PetFormModal pet={pet} onClose={() => setEditing(false)} onSave={(patch) => { updatePet(pet.id, patch); setEditing(false); }} /> : null}
    </WorkspaceShell>
  );
}
