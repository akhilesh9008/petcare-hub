"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, Loader2, PawPrint, ShieldCheck, Stethoscope } from "lucide-react";
import { usePetcare } from "@/features/petcare-store";
import { useProfessionalProfile } from "@/features/professional-profile";

export default function ProfessionalOnboardingPage() {
  const router = useRouter();
  const { user, hydrated } = usePetcare();
  const isVet = user.role === "VETERINARIAN";
  const isProvider = user.role === "SERVICE_PROVIDER";
  const { profile, loaded, saveProfile } = useProfessionalProfile(user.id, user.role);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hydrated) return;
    if (user.role === "PET_OWNER") router.replace("/onboarding");
    if (user.role === "ADMIN") router.replace("/admin");
  }, [hydrated, router, user.role]);

  if (!hydrated || !loaded) {
    return <main className="grid min-h-screen place-items-center bg-cream p-6"><div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><Loader2 className="animate-spin text-moss" size={20}/> Loading your workspace…</div></main>;
  }

  if (!isVet && !isProvider) return null;
  const Icon = isVet ? Stethoscope : BriefcaseBusiness;
  const title = isVet ? "Set up your veterinarian workspace" : "Set up your service workspace";
  const fieldLabel = isVet ? "Clinic or practice name" : "Business name";
  const focusLabel = isVet ? "Specialization or focus" : "Primary service category";
  const credentialLabel = isVet ? "Licence / qualification reference" : "Business or verification reference";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const businessName = String(data.get("businessName")).trim();
    const focus = String(data.get("focus")).trim();
    const location = String(data.get("location")).trim();
    if (!businessName || !focus || !location) {
      setError("Add the name, focus and location to continue.");
      return;
    }
    saveProfile({
      role: isVet ? "VETERINARIAN" : "SERVICE_PROVIDER",
      businessName,
      focus,
      location,
      credential: String(data.get("credential")).trim(),
      bio: String(data.get("bio")).trim(),
      availability: String(data.get("availability")).split(",").map((value) => value.trim()).filter(Boolean),
    });
    router.push(isVet ? "/veterinarian" : "/provider");
  }

  return <main className="min-h-screen bg-gradient-to-br from-mint via-cream to-sky px-4 py-8 sm:px-8"><div className="mx-auto max-w-3xl"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-white shadow-soft"><PawPrint size={22}/></span><div><p className="text-sm font-bold text-moss">PetCare Hub</p><p className="text-xs text-slate-500">Professional workspace setup</p></div></div><section className="surface mt-8 overflow-hidden"><div className="border-b border-slate-100 px-6 py-7 sm:px-10"><span className="eyebrow"><Icon size={14}/> {isVet ? "Veterinarian" : "Service provider"}</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">{title}</h1><p className="mt-2 max-w-2xl text-slate-600">These details personalize your local demo workspace. They are kept in this browser and do not publish a public directory listing.</p></div><form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10" noValidate><div><label className="field-label" htmlFor="professional-name">Your name</label><input className="field bg-slate-100" id="professional-name" value={user.name} readOnly/></div><div><label className="field-label" htmlFor="businessName">{fieldLabel}</label><input className="field" id="businessName" name="businessName" defaultValue={profile?.businessName} placeholder={isVet ? "e.g. Northside Animal Clinic" : "e.g. Happy Tails Grooming"} required/></div><div><label className="field-label" htmlFor="focus">{focusLabel}</label><input className="field" id="focus" name="focus" defaultValue={profile?.focus} placeholder={isVet ? "e.g. Small animal medicine" : "e.g. Grooming"} required/></div><div><label className="field-label" htmlFor="location">City / service area</label><input className="field" id="location" name="location" defaultValue={profile?.location} placeholder="e.g. Pune" required/></div><div className="sm:col-span-2"><label className="field-label" htmlFor="availability">Representative availability <span className="font-normal text-slate-400">(comma separated)</span></label><input className="field" id="availability" name="availability" defaultValue={profile?.availability.join(", ")} placeholder="e.g. 09:00, 13:00, 17:30"/></div><div className="sm:col-span-2"><label className="field-label" htmlFor="credential">{credentialLabel} <span className="font-normal text-slate-400">(local demo only)</span></label><input className="field" id="credential" name="credential" defaultValue={profile?.credential} placeholder={isVet ? "e.g. registration reference" : "e.g. local business reference"}/></div><div className="sm:col-span-2"><label className="field-label" htmlFor="bio">About your work <span className="font-normal text-slate-400">(optional)</span></label><textarea className="field min-h-28 py-3" id="bio" name="bio" defaultValue={profile?.bio} placeholder="Describe the care or service you provide."/></div><div className="sm:col-span-2 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950"><p className="flex gap-2 font-bold"><ShieldCheck className="mt-0.5 shrink-0" size={18}/> Verification is still essential</p><p className="mt-1">This demo lets you explore the professional flow. A real deployment must verify professional licences and business details before enabling medical records, patient access or public listings.</p></div>{error ? <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}<div className="sm:col-span-2 flex justify-end"><button className="btn-primary">Open {isVet ? "veterinarian" : "provider"} workspace <ArrowRight size={17}/></button></div></form></section></div></main>;
}
