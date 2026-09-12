"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, BadgeCheck, CheckCircle2, ChevronDown, FileHeart, HeartHandshake,
  MapPin, MessageCircle, PawPrint, Send, ShieldCheck, SlidersHorizontal, Sparkles, X,
} from "lucide-react";
import { FilterChip } from "@/components";
import type { Pet } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";

type MatchProfile = {
  id: string;
  name: string;
  species: Pet["species"];
  breed: string;
  gender: Pet["gender"];
  age: string;
  city: string;
  distance: number;
  image: string;
  temperament: string[];
  activity: Pet["activityLevel"];
  parents: string;
  healthSummary: string;
  sharedRecords: string[];
  ownerNote: string;
  status: "Open to introductions" | "Reviewing requests";
};

const matchProfiles: MatchProfile[] = [
  {
    id: "match-maple", name: "Maple", species: "Dog", breed: "Golden Retriever", gender: "Female", age: "3 years", city: "Koregaon Park, Pune", distance: 4,
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
    temperament: ["Gentle", "People-friendly", "Confident"], activity: "High", parents: "Parent details available after owner consent.",
    healthSummary: "Owner has chosen to share a compact vaccination and wellness-record summary for review.",
    sharedRecords: ["Vaccination record shared", "Recent wellness visit noted", "Pedigree discussion available"],
    ownerNote: "Looking for an informed, welfare-first conversation with another Golden Retriever family.", status: "Open to introductions",
  },
  {
    id: "match-jasper", name: "Jasper", species: "Dog", breed: "Labrador Retriever", gender: "Male", age: "4 years", city: "Kalyani Nagar, Pune", distance: 8,
    image: "https://images.unsplash.com/photo-1591769225440-811ad7d6eab4?auto=format&fit=crop&w=900&q=85",
    temperament: ["Steady", "Social", "Trainable"], activity: "High", parents: "Family history can be discussed privately with supporting records.",
    healthSummary: "Owner requests mutual health-history review before arranging an introduction.",
    sharedRecords: ["Vaccination record shared", "Owner health questionnaire", "Parent-history discussion"],
    ownerNote: "Open to a careful conversation after both owners confirm veterinary guidance.", status: "Open to introductions",
  },
  {
    id: "match-nori", name: "Nori", species: "Cat", breed: "Indie Cat", gender: "Male", age: "3 years", city: "Baner, Pune", distance: 12,
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85",
    temperament: ["Calm", "Indoor", "Affectionate"], activity: "Moderate", parents: "Rescue background; known history is described transparently by the owner.",
    healthSummary: "Owner is prepared to exchange vet-record summaries only after mutual agreement.",
    sharedRecords: ["Vaccination record shared", "Indoor-lifestyle notes", "Owner care notes"],
    ownerNote: "Seeking an ethical, veterinary-guided conversation; no commercial arrangements.", status: "Reviewing requests",
  },
  {
    id: "match-poppy", name: "Poppy", species: "Dog", breed: "Golden Retriever", gender: "Female", age: "4 years", city: "Viman Nagar, Pune", distance: 15,
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=85",
    temperament: ["Playful", "Family-oriented", "Responsive"], activity: "High", parents: "Owner can discuss lineage and traits once both families opt in.",
    healthSummary: "No clinical guarantees are made in this directory; records must be independently verified.",
    sharedRecords: ["Vaccination record shared", "Owner questionnaire", "Temperament notes"],
    ownerNote: "Interested in a breed-appropriate, health-first match with plenty of time for questions.", status: "Open to introductions",
  },
];

type SavedPreference = {
  petId: string;
  breed: string;
  radius: number;
  traits: string[];
  sharePassport: boolean;
};

const preferenceKey = "petcare-hub-breeding-preference-v1";
const traitOptions = ["Gentle", "Confident", "Social", "Trainable", "Calm", "Family-oriented"];

function getAge(birthDate: string) {
  const birth = new Date(`${birthDate}T12:00:00`);
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const monthOffset = today.getMonth() - birth.getMonth();
  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birth.getDate())) years -= 1;
  return Math.max(0, years);
}

function readinessLabel(pet: Pet, recordCount: number) {
  if (pet.vaccinationStatus !== "Up to date") return "Review vaccination status first";
  if (!recordCount) return "Add a health-record summary first";
  return "Ready to begin a guided introduction";
}

export default function BreedingPage() {
  const { pets, records, vaccinations, user } = usePetcare();
  const [selectedPetId, setSelectedPetId] = useState("");
  const [preferredBreed, setPreferredBreed] = useState("");
  const [radius, setRadius] = useState(25);
  const [traits, setTraits] = useState<string[]>([]);
  const [sharePassport, setSharePassport] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [requests, setRequests] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!pets.length) return;
    setSelectedPetId((current) => pets.some((pet) => pet.id === current) ? current : pets[0].id);
  }, [pets]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`${preferenceKey}:${user.id}`);
      if (!saved) return;
      const preference = JSON.parse(saved) as Partial<SavedPreference>;
      if (typeof preference.petId === "string") setSelectedPetId(preference.petId);
      if (typeof preference.breed === "string") setPreferredBreed(preference.breed);
      if (typeof preference.radius === "number") setRadius(preference.radius);
      if (Array.isArray(preference.traits)) setTraits(preference.traits.filter((value): value is string => typeof value === "string"));
      if (typeof preference.sharePassport === "boolean") setSharePassport(preference.sharePassport);
    } catch {
      // A fresh preference form is safer than interrupting the page for invalid browser data.
    }
  }, [user.id]);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId);
  const selectedPetRecordCount = records.filter((record) => record.petId === selectedPet?.id).length;
  const selectedPetVaccinations = vaccinations.filter((item) => item.petId === selectedPet?.id).length;
  const effectiveBreed = preferredBreed.trim() || selectedPet?.breed || "";
  const matches = useMemo(() => matchProfiles
    .filter((profile) => !selectedPet || profile.species === selectedPet.species)
    .filter((profile) => !effectiveBreed || profile.breed.toLowerCase().includes(effectiveBreed.toLowerCase()))
    .filter((profile) => profile.distance <= radius)
    .filter((profile) => !traits.length || traits.every((trait) => profile.temperament.includes(trait)))
    .map((profile) => ({
      ...profile,
      score: Math.min(96, 62 + (profile.breed === effectiveBreed ? 14 : 0) + (profile.activity === selectedPet?.activityLevel ? 8 : 0) + traits.filter((trait) => profile.temperament.includes(trait)).length * 4),
    })), [effectiveBreed, radius, selectedPet?.activityLevel, selectedPet?.species, traits]);

  const savePreferences = () => {
    if (!selectedPet) return;
    window.localStorage.setItem(`${preferenceKey}:${user.id}`, JSON.stringify({ petId: selectedPet.id, breed: preferredBreed, radius, traits, sharePassport } satisfies SavedPreference));
    setNotice("Your matching preferences are saved privately in this browser.");
  };

  const sendInterest = (profile: MatchProfile) => {
    if (!selectedPet) return;
    setRequests((current) => current.includes(profile.id) ? current : [...current, profile.id]);
    setSelectedMatch(null);
    setNotice(`Interest request sent for ${selectedPet.name} and ${profile.name}. No contact details or medical documents were shared automatically.`);
  };

  const toggleTrait = (trait: string) => setTraits((current) => current.includes(trait) ? current.filter((value) => value !== trait) : [...current, trait]);

  if (!selectedPet) {
    return <WorkspaceShell title="Responsible breeding match" subtitle="Owner-to-owner introductions informed by each pet's profile.">
      <div className="surface mx-auto max-w-2xl p-10 text-center"><PawPrint className="mx-auto text-moss" size={30}/><h1 className="mt-4 text-2xl font-black text-ink">Add a pet profile first.</h1><p className="mt-2 text-slate-600">A complete pet profile helps you review responsible matching preferences and decide what information to share.</p><Link className="btn-primary mt-6" href="/pets">Create a pet profile</Link></div>
    </WorkspaceShell>;
  }

  return <WorkspaceShell title="Responsible breeding match" subtitle="Private, welfare-first owner introductions - never a health or genetics guarantee.">
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-white to-mint p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-end"><div><span className="eyebrow bg-white"><HeartHandshake size={14}/> Health-first matching</span><h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">Find an informed introduction, not a shortcut.</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">Start with your pet's passport, traits and care context. You decide whether to share a compact record summary; both owners should confirm fitness, genetic considerations and local requirements with qualified professionals before making any decision.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-sm text-amber-950"><div className="flex gap-2 font-black"><AlertTriangle className="mt-0.5 shrink-0" size={18}/> Before you connect</div><p className="mt-2 leading-6">This is not a marketplace, a veterinary clearance, or a pedigree verification service. Do not exchange payment or sensitive documents through this demo.</p></div></div>
      </section>

      {notice ? <div className="flex items-start justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-900"><span className="flex gap-2"><CheckCircle2 className="shrink-0" size={18}/>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={17}/></button></div> : null}

      <section className="surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="eyebrow"><SlidersHorizontal size={14}/> Your matching brief</span><h2 className="mt-3 text-xl font-black text-ink">Choose preferences for a careful first look.</h2></div><button type="button" onClick={savePreferences} className="btn-secondary">Save preferences</button></div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><label><span className="field-label">Your pet</span><div className="relative mt-1"><select className="field appearance-none pr-10 font-bold" value={selectedPetId} onChange={(event) => setSelectedPetId(event.target.value)}>{pets.map((pet) => <option value={pet.id} key={pet.id}>{pet.name} - {pet.breed}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={18}/></div></label><label><span className="field-label">Preferred breed</span><input className="field mt-1" value={preferredBreed} onChange={(event) => setPreferredBreed(event.target.value)} placeholder={selectedPet.breed}/></label><label><span className="field-label">Search radius</span><select className="field mt-1" value={radius} onChange={(event) => setRadius(Number(event.target.value))}><option value={10}>Within 10 km</option><option value={25}>Within 25 km</option><option value={50}>Within 50 km</option></select></label><label className="rounded-xl border border-slate-200 bg-slate-50 p-3"><span className="flex items-start gap-3"><input className="mt-1 h-4 w-4 accent-teal-700" checked={sharePassport} type="checkbox" onChange={(event) => setSharePassport(event.target.checked)}/><span><span className="block text-sm font-bold text-ink">Offer compact passport summary</span><span className="mt-1 block text-xs leading-5 text-slate-500">Only records chosen for the request - no full documents or contact details.</span></span></span></label></div><div className="mt-5 border-t border-slate-100 pt-4"><p className="field-label">Qualities important to your household</p><div className="mt-2 flex flex-wrap gap-2">{traitOptions.map((trait) => <FilterChip key={trait} label={trait} active={traits.includes(trait)} onClick={() => toggleTrait(trait)}/>)}</div></div></section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]"><div className="surface p-5"><div className="flex items-center gap-3"><img src={selectedPet.image} alt={selectedPet.name} className="h-14 w-14 rounded-2xl object-cover"/><div><p className="font-black text-ink">{selectedPet.name}'s introduction readiness</p><p className="mt-1 text-sm text-slate-600">{selectedPet.breed} - {getAge(selectedPet.birthDate)} years - {selectedPet.gender}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Passport context</p><p className="mt-1 text-sm font-black text-ink">{selectedPetRecordCount} health entr{selectedPetRecordCount === 1 ? "y" : "ies"}</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Vaccination entries</p><p className="mt-1 text-sm font-black text-ink">{selectedPetVaccinations} recorded</p></div><div className="rounded-2xl bg-slate-50 p-3"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Next step</p><p className="mt-1 text-sm font-black text-ink">{readinessLabel(selectedPet, selectedPetRecordCount)}</p></div></div></div><aside className="rounded-3xl border border-teal-100 bg-teal-50/70 p-5"><div className="flex gap-2"><ShieldCheck className="shrink-0 text-teal-700" size={20}/><div><h2 className="font-black text-ink">What gets shared?</h2><p className="mt-2 text-sm leading-6 text-slate-600">{sharePassport ? "Your request says a compact passport summary is available. The other owner must accept before any owner-selected context is visible." : "No passport summary is offered with this request. You can choose to discuss it later."}</p></div></div><Link href={`/passport?pet=${selectedPet.id}`} className="btn-ghost mt-4 w-full justify-center"><FileHeart size={16}/> Review passport</Link></aside></section>

      <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><span className="eyebrow"><Sparkles size={14}/> Private sample directory</span><h2 className="mt-2 text-2xl font-black text-ink">Potential introductions</h2><p className="mt-1 text-sm text-slate-600">{matches.length} profile{matches.length === 1 ? "" : "s"} fit these display filters. Profile details are owner-submitted demo content and must be independently checked.</p></div>{requests.length ? <span className="status-pill bg-mint text-moss">{requests.length} request{requests.length === 1 ? "" : "s"} sent</span> : null}</div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{matches.map((profile) => <article className="surface overflow-hidden" key={profile.id}><img className="h-52 w-full object-cover" src={profile.image} alt={profile.name}/><div className="p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="text-xl font-black text-ink">{profile.name}</h3><BadgeCheck className="text-teal-600" size={17} aria-label="Profile details supplied"/></div><p className="mt-1 text-sm text-slate-600">{profile.breed} - {profile.gender} - {profile.age}</p></div><span className="rounded-xl bg-mint px-2.5 py-1 text-xs font-black text-moss">{profile.score}% display fit</span></div><p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15}/>{profile.city} - {profile.distance} km away</p><div className="mt-4 flex flex-wrap gap-2">{profile.temperament.map((trait) => <span key={trait} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{trait}</span>)}</div><p className="mt-4 text-sm leading-6 text-slate-600">{profile.ownerNote}</p><div className="mt-5 flex gap-2"><button className="btn-secondary flex-1 justify-center" type="button" onClick={() => setSelectedMatch(profile)}><FileHeart size={16}/> Review context</button><button className="btn-primary flex-1 justify-center" type="button" disabled={requests.includes(profile.id)} onClick={() => sendInterest(profile)}>{requests.includes(profile.id) ? <><CheckCircle2 size={16}/> Requested</> : <><MessageCircle size={16}/> Introduce</>}</button></div></div></article>)}</div>{!matches.length ? <div className="surface mt-5 p-10 text-center"><HeartHandshake className="mx-auto text-moss" size={30}/><h3 className="mt-3 font-black text-ink">No profiles fit all of those filters.</h3><p className="mt-2 text-sm text-slate-600">Try a broader radius, fewer trait filters, or clear the preferred breed.</p><button className="btn-secondary mt-5" type="button" onClick={() => { setPreferredBreed(""); setTraits([]); setRadius(25); }}>Reset matching filters</button></div> : null}</section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-700"><HeartHandshake size={20}/></div><div><h2 className="font-black text-ink">A responsible conversation has more than one step.</h2><ol className="mt-3 grid gap-2 text-sm leading-6 text-slate-600 sm:grid-cols-3"><li><strong className="text-ink">1. Compare context:</strong> discuss care practices, parent history and goals openly.</li><li><strong className="text-ink">2. Verify independently:</strong> ask a veterinarian and relevant breed-health expert about appropriate screening.</li><li><strong className="text-ink">3. Protect welfare:</strong> proceed only with mutual consent, local compliance and a written welfare plan.</li></ol></div></div></section>
    </div>

    {selectedMatch ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4" role="dialog" aria-modal="true" aria-labelledby="match-context-title"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><span className="eyebrow"><FileHeart size={14}/> Owner-supplied context</span><h2 id="match-context-title" className="mt-3 text-2xl font-black text-ink">{selectedMatch.name}'s shared summary</h2></div><button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setSelectedMatch(null)} aria-label="Close"><X size={20}/></button></div><div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm leading-6 text-slate-700">{selectedMatch.healthSummary}</p><ul className="mt-4 space-y-2">{selectedMatch.sharedRecords.map((item) => <li key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700"><CheckCircle2 className="text-teal-600" size={16}/>{item}</li>)}</ul></div><div className="mt-4 rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Parents and background</p><p className="mt-2 text-sm leading-6 text-slate-700">{selectedMatch.parents}</p></div><p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">This summary is not a medical, genetic, behavioural or pedigree certification. Verify information with the relevant professionals before arranging an in-person meeting.</p><div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button className="btn-ghost justify-center" type="button" onClick={() => setSelectedMatch(null)}>Continue browsing</button><button className="btn-primary justify-center" type="button" onClick={() => sendInterest(selectedMatch)} disabled={requests.includes(selectedMatch.id)}>{requests.includes(selectedMatch.id) ? <><CheckCircle2 size={16}/> Request sent</> : <><Send size={16}/> Send interest request</>}</button></div></div></div> : null}
  </WorkspaceShell>;
}
