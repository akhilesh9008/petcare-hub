"use client";

import { useState } from "react";
import { CalendarCheck2, CircleDollarSign, Settings2, Sparkles, UsersRound } from "lucide-react";
import { DashboardCard, SectionHeading } from "@/components";
import type { ServiceProvider } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { useProfessionalProfile } from "@/features/professional-profile";
import { formatInr, WorkspaceShell } from "@/features/workspace-shell";

const defaultProviderImage = "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=85";

export default function ProviderDashboard() {
  const store = usePetcare();
  const { profile } = useProfessionalProfile(store.user.id, store.user.role);
  const [notice, setNotice] = useState("");
  const matchingProvider = store.providers.find((item) => item.name.trim().toLowerCase() === store.user.name.trim().toLowerCase());
  const provider: ServiceProvider = matchingProvider ?? {
    id: `local-provider-${store.user.id}`,
    name: store.user.name,
    businessName: profile?.businessName || "Your service workspace",
    category: profile?.focus || "Service profile in progress",
    location: profile?.location || store.user.city || "Add your service area",
    rating: 0,
    reviews: 0,
    price: 0,
    image: defaultProviderImage,
    description: profile?.bio || "Complete your local profile to introduce the service you provide and the care preferences you support.",
    availability: profile?.availability ?? [],
  };
  const bookings = store.bookings.filter((item) => item.providerId === provider.id);

  return <WorkspaceShell role="SERVICE_PROVIDER" title="Service provider dashboard" subtitle={`${provider.businessName} · ${provider.location}`} actions={<a className="btn-secondary" href="/professional-onboarding"><Settings2 size={16}/> Edit workspace profile</a>}>
    <div className="space-y-6">
      {notice ? <p className="rounded-xl bg-mint px-4 py-3 text-sm font-semibold text-moss">{notice}</p> : null}
      {!matchingProvider ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Local professional workspace:</strong> complete profile details are private to this browser until a verified business-directory flow is connected.</div> : null}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><DashboardCard label="Today’s bookings" value={bookings.filter((item) => item.date === "2026-08-25").length} description="Scheduled today" icon={CalendarCheck2} accent="teal"/><DashboardCard label="Upcoming" value={bookings.filter((item) => ["PENDING", "CONFIRMED"].includes(item.status)).length} description="Needs review" icon={Sparkles} accent="sky"/><DashboardCard label="Customers" value={new Set(bookings.map((item) => item.petId)).size} description="Pet families served" icon={UsersRound} accent="violet"/><DashboardCard label="Booked revenue" value={provider.price ? formatInr(bookings.filter((item) => item.status !== "CANCELLED").length * provider.price) : "—"} description="Demo booking total" icon={CircleDollarSign} accent="orange"/></section>
      <section><SectionHeading title="Booking requests" description="Accept, reject or complete requests for your offered service."/><div className="mt-4 space-y-3">{bookings.length ? bookings.map((booking) => { const pet = store.pets.find((item) => item.id === booking.petId); return <article className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center" key={booking.id}><img src={pet?.image || defaultProviderImage} alt={pet?.name || "Pet"} className="h-14 w-14 rounded-2xl object-cover"/><div className="min-w-0 flex-1"><p className="font-black text-ink">{pet?.name} · {provider.category}</p><p className="mt-1 text-sm text-slate-600">{booking.date} at {booking.time} · {booking.notes || "No additional notes"}</p></div><span className="status-pill bg-slate-100 text-slate-700">{booking.status}</span>{booking.status === "PENDING" ? <div className="flex gap-2"><button className="btn-primary" onClick={() => { store.updateServiceBookingStatus(booking.id, "CONFIRMED"); setNotice("Booking confirmed."); }}>Accept</button><button className="btn-secondary text-red-600" onClick={() => { store.updateServiceBookingStatus(booking.id, "CANCELLED"); setNotice("Booking declined."); }}>Decline</button></div> : null}{booking.status === "CONFIRMED" ? <button className="btn-primary" onClick={() => { store.updateServiceBookingStatus(booking.id, "COMPLETED"); setNotice("Service marked complete."); }}>Complete</button> : null}</article>; }) : <div className="surface p-10 text-center"><p className="font-black text-ink">No booking requests yet.</p><p className="mt-2 text-sm text-slate-600">Requests assigned to your verified service profile will appear here.</p></div>}</div></section>
      <section className="grid gap-6 lg:grid-cols-2"><div className="surface p-6"><h2 className="text-xl font-black text-ink">Your service listing</h2><p className="mt-2 text-sm leading-6 text-slate-600">{provider.description}</p><div className="mt-5 rounded-2xl bg-mint p-4"><p className="font-bold text-ink">{provider.category}</p><p className="mt-1 text-sm text-slate-600">{provider.price ? `Starting from ${formatInr(provider.price)} · ` : "Price to be added · "}{provider.rating ? `rating ${provider.rating}` : "local setup profile"}</p></div></div><div className="surface p-6"><h2 className="text-xl font-black text-ink">Availability</h2><p className="mt-1 text-sm text-slate-600">Representative open times in this local demo.</p><div className="mt-5 grid grid-cols-3 gap-2">{provider.availability.length ? provider.availability.map((slot) => <button key={slot} className="rounded-xl bg-mint px-3 py-3 text-sm font-bold text-moss">{slot}</button>) : <a href="/professional-onboarding" className="col-span-3 rounded-xl border border-dashed border-teal-300 bg-teal-50 px-3 py-4 text-center text-sm font-bold text-teal-800">Add profile details and availability</a>}</div></div></section>
    </div>
  </WorkspaceShell>;
}
