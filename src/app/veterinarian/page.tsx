"use client";

import { useState } from "react";
import { CalendarCheck2, ClipboardPlus, Clock3, FileText, Settings2, UsersRound } from "lucide-react";
import { AppointmentCard, DashboardCard, SectionHeading } from "@/components";
import type { Vet } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { useProfessionalProfile } from "@/features/professional-profile";
import { WorkspaceShell } from "@/features/workspace-shell";

const defaultVetImage = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=700&q=85";

export default function VeterinarianDashboard() {
  const store = usePetcare();
  const { profile } = useProfessionalProfile(store.user.id, store.user.role);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const matchingVet = store.vets.find((item) => item.name.trim().toLowerCase() === store.user.name.trim().toLowerCase());
  const vet: Vet = matchingVet ?? {
    id: `local-vet-${store.user.id}`,
    name: store.user.name,
    specialization: profile?.focus || "Professional profile in progress",
    clinic: profile?.businessName || "Your veterinarian workspace",
    location: profile?.location || store.user.city || "Add your service area",
    rating: 0,
    reviews: 0,
    experience: 0,
    fee: 0,
    image: defaultVetImage,
    bio: profile?.bio || "Complete your local profile to add the care focus and practice details you want to see here.",
    languages: ["English"],
    slots: profile?.availability ?? [],
  };
  const appointments = store.appointments.filter((item) => item.vetId === vet.id).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const patientIds = Array.from(new Set(appointments.filter((item) => item.status !== "CANCELLED").map((item) => item.petId)));

  function complete(id: string) {
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) return;
    const note = notes[id]?.trim() || "Consultation completed; follow up as discussed.";
    store.setConsultationNotes(id, note);
    store.updateAppointmentStatus(id, "COMPLETED");
    store.addRecord({ petId: appointment.petId, date: appointment.date, type: "Consultation", veterinarian: vet.name, clinic: vet.clinic, reason: appointment.reason, symptoms: "See consultation notes", diagnosis: note, treatment: "Discussed during consultation." });
    setNotice("Consultation completed and a health record was added for the authorized pet.");
  }

  return <WorkspaceShell role="VETERINARIAN" title="Veterinarian dashboard" subtitle={`${vet.name} · authorized patient care`} actions={<a className="btn-secondary" href="/professional-onboarding"><Settings2 size={16}/> Edit workspace profile</a>}>
    <div className="space-y-6">
      {notice ? <p className="rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-moss">{notice}</p> : null}
      {!matchingVet ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Local professional workspace:</strong> this profile is visible only in your browser workspace until a production verification and directory-publishing flow is connected.</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DashboardCard label="Today’s appointments" value={appointments.filter((item) => item.date === "2026-08-25").length} description="Scheduled for today" icon={CalendarCheck2} accent="teal"/><DashboardCard label="Upcoming" value={appointments.filter((item) => ["PENDING", "CONFIRMED"].includes(item.status)).length} description="Needs attention" icon={Clock3} accent="sky"/><DashboardCard label="Total patients" value={patientIds.length} description="Authorized relationships" icon={UsersRound} accent="violet"/><DashboardCard label="Pending" value={appointments.filter((item) => item.status === "PENDING").length} description="Awaiting review" icon={FileText} accent="orange"/></section>
      <section><SectionHeading title="Appointments" description="Accept, decline, complete, and write consultation notes from one clinical queue."/><div className="mt-4 space-y-4">{appointments.length ? appointments.map((appointment) => { const pet = store.pets.find((item) => item.id === appointment.petId); return <article className="surface overflow-hidden" key={appointment.id}><AppointmentCard appointment={{ id: appointment.id, petName: pet?.name ?? "Pet", veterinarianName: vet.name, clinicName: vet.clinic, date: appointment.date, time: appointment.time, type: appointment.type === "In-person" ? "IN_PERSON" : "ONLINE", status: appointment.status, reason: appointment.reason, veterinarianImageUrl: vet.image }}/>{appointment.status === "PENDING" ? <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4"><button className="btn-primary" onClick={() => { store.updateAppointmentStatus(appointment.id, "CONFIRMED"); setNotice("Appointment confirmed. The owner’s workspace updates immediately."); }}>Accept appointment</button><button className="btn-secondary text-red-600" onClick={() => { store.updateAppointmentStatus(appointment.id, "CANCELLED"); setNotice("Appointment was declined."); }}>Decline</button></div> : null}{appointment.status === "CONFIRMED" ? <div className="border-t border-slate-100 p-5"><label className="field-label" htmlFor={`notes-${appointment.id}`}>Consultation notes</label><textarea className="field min-h-20 py-3" id={`notes-${appointment.id}`} value={notes[appointment.id] ?? appointment.consultationNotes ?? ""} onChange={(event) => setNotes({ ...notes, [appointment.id]: event.target.value })} placeholder="Record factual consultation notes for the owner’s health timeline."/><div className="mt-3 flex justify-end"><button className="btn-primary" onClick={() => complete(appointment.id)}><ClipboardPlus size={16}/> Complete & create record</button></div></div> : null}{appointment.status === "COMPLETED" ? <div className="border-t border-slate-100 bg-mint/40 px-5 py-4 text-sm text-slate-700"><strong className="text-ink">Consultation notes:</strong> {appointment.consultationNotes || "No note recorded."}</div> : null}</article>; }) : <div className="surface p-10 text-center"><CalendarCheck2 className="mx-auto text-moss" size={28}/><h2 className="mt-3 font-black text-ink">No authorized appointments yet.</h2><p className="mt-2 text-sm text-slate-600">When a pet owner requests a slot assigned to your verified profile, it will appear here.</p></div>}</div></section>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_.95fr]"><div className="surface p-6"><h2 className="text-xl font-black text-ink">Authorized patients</h2><p className="mt-1 text-sm text-slate-600">Only pets with a non-cancelled appointment relationship are listed.</p><div className="mt-5 space-y-3">{patientIds.length ? patientIds.map((id) => { const pet = store.pets.find((item) => item.id === id); return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3" key={id}><img className="h-11 w-11 rounded-2xl object-cover" src={pet?.image || defaultVetImage} alt={pet?.name || "Pet"}/><div><p className="font-bold text-ink">{pet?.name}</p><p className="text-sm text-slate-600">{pet?.breed} · Appointment relationship active</p></div></div>; }) : <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Authorized patient context will appear after an appointment relationship is created.</p>}</div></div><div className="surface p-6"><h2 className="text-xl font-black text-ink">Availability</h2><p className="mt-1 text-sm text-slate-600">Representative slots for this local workspace.</p><div className="mt-5 grid grid-cols-2 gap-2">{vet.slots.length ? vet.slots.map((slot) => <button className="rounded-xl bg-mint px-3 py-3 text-sm font-bold text-moss" key={slot}>{slot} · Available</button>) : <a href="/professional-onboarding" className="col-span-2 rounded-xl border border-dashed border-teal-300 bg-teal-50 px-3 py-4 text-center text-sm font-bold text-teal-800">Add profile details and representative availability</a>}</div><p className="mt-5 rounded-xl bg-[#fff7e9] p-3 text-sm leading-6 text-slate-700">Clinical data access remains dependent on server-side authorization in a production deployment.</p></div></section>
    </div>
  </WorkspaceShell>;
}
