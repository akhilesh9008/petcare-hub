"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark, CheckCircle2, Clock3, Coffee, Dog, Info, MapPin, MapPinned,
  PawPrint, PhoneCall, ShieldCheck, Sparkles, Star, Trees, UtensilsCrossed, X,
} from "lucide-react";
import { FilterChip, SearchBar } from "@/components";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";

type PlaceType = "Cafe" | "Restaurant" | "Park" | "Stay";

type Place = {
  id: string;
  name: string;
  type: PlaceType;
  locality: string;
  city: string;
  image: string;
  rating: number;
  reviewLabel: string;
  setting: string;
  petPolicy: string;
  highlights: string[];
  bestFor: string[];
  note: string;
  hours: string;
};

const places: Place[] = [
  {
    id: "place-paw-plate", name: "Paw & Plate Courtyard", type: "Cafe", locality: "Koregaon Park", city: "Pune", rating: 4.7, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=85", setting: "Open-air garden seating", petPolicy: "Outdoor seating only; leash requested.",
    highlights: ["Water bowls", "Shade", "Outdoor tables"], bestFor: ["Dog", "Morning", "Relaxed"], note: "A quiet coffee stop concept for a post-walk meet-up. Confirm current rules and table availability directly.", hours: "Example hours: 8:00 AM - 9:00 PM",
  },
  {
    id: "place-bowl-bark", name: "Bowl & Bark Brunch House", type: "Restaurant", locality: "Kalyani Nagar", city: "Pune", rating: 4.6, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85", setting: "Patio brunch tables", petPolicy: "Call ahead; pet access is limited to the patio.",
    highlights: ["Weekend brunch", "Water bowls", "Staff check-in"], bestFor: ["Dog", "Social", "Weekend"], note: "A sample brunch listing designed for pet families who prefer open seating and a short walk nearby.", hours: "Example hours: 9:00 AM - 4:00 PM",
  },
  {
    id: "place-tail-trail", name: "Tail Trail Green", type: "Park", locality: "Viman Nagar", city: "Pune", rating: 4.5, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85", setting: "Wide walking paths", petPolicy: "Keep pets leashed and clean up after them.",
    highlights: ["Morning shade", "Water point nearby", "Walking loop"], bestFor: ["Dog", "Active", "Morning"], note: "A planning-card example for a low-key walk. Always follow municipal signage and check access rules on arrival.", hours: "Example access: Sunrise - sunset",
  },
  {
    id: "place-wagtail", name: "The Wagtail Table", type: "Restaurant", locality: "Baner", city: "Pune", rating: 4.8, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85", setting: "Covered terrace dining", petPolicy: "Outdoor terrace may welcome calm, leashed pets; confirm before leaving home.",
    highlights: ["Covered terrace", "Parking", "Water on request"], bestFor: ["Dog", "Evening", "Calm"], note: "A fictional terrace-dining example for a more relaxed evening outing with a well-settled companion.", hours: "Example hours: 12:00 PM - 11:00 PM",
  },
  {
    id: "place-nest", name: "Nest & Nuzzle Stay", type: "Stay", locality: "Aundh", city: "Pune", rating: 4.4, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85", setting: "Pet-aware stay concept", petPolicy: "Advance booking and pet policy review required.",
    highlights: ["Ground-floor request", "Pet fee question", "Nearby walking route"], bestFor: ["Dog", "Travel", "Planning"], note: "A trip-planning card, not a booking confirmation. Ask about size limits, fees, current vaccination requirements and room access.", hours: "Example check-in: from 2:00 PM",
  },
  {
    id: "place-whisker-window", name: "Whisker Window Coffee", type: "Cafe", locality: "Shivaji Nagar", city: "Pune", rating: 4.5, reviewLabel: "Illustrative community card",
    image: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1200&q=85", setting: "Sunny outdoor corner", petPolicy: "Small, calm pets may be accommodated outdoors; contact venue first.",
    highlights: ["Quiet corner", "Outdoor tables", "Morning light"], bestFor: ["Cat carrier", "Calm", "Morning"], note: "A fictional coffee-stop guide card for a short, low-stimulation outing where local policy allows it.", hours: "Example hours: 7:30 AM - 7:30 PM",
  },
];

const savedPlacesKey = "petcare-hub-saved-places-v1";

export default function PlacesPage() {
  const { pets, user } = usePetcare();
  const [city, setCity] = useState(user.city || "Pune");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | PlaceType>("All");
  const [saved, setSaved] = useState<string[]>([]);
  const [loadedUserId, setLoadedUserId] = useState("");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  useEffect(() => {
    setCity((current) => current || user.city || "Pune");
  }, [user.city]);

  useEffect(() => {
    setLoadedUserId("");
    try {
      const raw = window.localStorage.getItem(`${savedPlacesKey}:${user.id}`);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setSaved(parsed.filter((value): value is string => typeof value === "string"));
    } catch {
      setSaved([]);
    } finally {
      setLoadedUserId(user.id);
    }
  }, [user.id]);

  useEffect(() => {
    if (loadedUserId !== user.id) return;
    try {
      window.localStorage.setItem(`${savedPlacesKey}:${user.id}`, JSON.stringify(saved));
    } catch {
      // Saving is a convenience in local mode; the guide remains usable without storage.
    }
  }, [loadedUserId, saved, user.id]);

  const selectedPet = pets[0];
  const normalizedCity = city.trim().toLowerCase();
  const shown = useMemo(() => places.filter((place) => {
    const matchesCity = !normalizedCity || place.city.toLowerCase().includes(normalizedCity);
    const matchesCategory = category === "All" || place.type === category;
    const text = `${place.name} ${place.locality} ${place.type} ${place.setting} ${place.highlights.join(" ")}`.toLowerCase();
    return matchesCity && matchesCategory && text.includes(query.toLowerCase());
  }), [category, normalizedCity, query]);

  const toggleSaved = (id: string) => setSaved((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);

  return <WorkspaceShell title="Pet-friendly places" subtitle="Plan an outing with space, manners and venue rules in mind.">
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 via-white to-mint p-6 sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-end"><div><span className="eyebrow bg-white"><MapPinned size={14}/> Local outing guide</span><h1 className="mt-4 max-w-3xl text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">Make more room for the whole family.</h1><p className="mt-3 max-w-3xl leading-7 text-slate-600">Discover cafe, restaurant, park and stay ideas with pet-access questions already in view. These are clearly marked illustrative Pune-area guide cards, not live recommendations or verified venue policies - call ahead before visiting.</p></div><div className="rounded-3xl border border-amber-200 bg-white/90 p-5"><div className="flex items-center gap-2 font-black text-ink"><Dog className="text-amber-700" size={20}/> Your outing lens</div><p className="mt-2 text-sm leading-6 text-slate-600">{selectedPet ? `${selectedPet.name}'s profile is handy for planning: ${selectedPet.activityLevel.toLowerCase()} activity and ${selectedPet.gender.toLowerCase()} ${selectedPet.species.toLowerCase()}.` : "Add a pet profile to keep care context close while you plan."}</p></div></div></section>

      <section className="surface p-4"><div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]"><SearchBar value={query} onChange={setQuery} placeholder="Search cafe, restaurant, park, or amenity" ariaLabel="Search places"/><label><span className="field-label">Guide city</span><input className="field mt-1" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Pune"/></label></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4"><div className="flex flex-wrap gap-2">{(["All", "Cafe", "Restaurant", "Park", "Stay"] as const).map((item) => <FilterChip key={item} label={item} active={category === item} onClick={() => setCategory(item)} icon={item === "Cafe" ? Coffee : item === "Restaurant" ? UtensilsCrossed : item === "Park" ? Trees : undefined}/>)}</div><span className="text-sm font-semibold text-slate-500">{shown.length} illustrative card{shown.length === 1 ? "" : "s"}</span></div></section>

      {normalizedCity && normalizedCity !== "pune" ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><span className="flex gap-2 font-black"><Info className="shrink-0" size={18}/> This local guide currently includes Pune-only illustrative cards.</span><p className="mt-1">It cannot verify live pet-friendly venues in {city}. Set the city back to Pune to explore the sample planning cards, or use the checklist below when searching locally.</p></div> : null}

      <section><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><span className="eyebrow"><Sparkles size={14}/> Plan with care</span><h2 className="mt-2 text-2xl font-black text-ink">Places to explore</h2><p className="mt-1 text-sm text-slate-600">Save cards to your local shortlist, then confirm the exact policy, timing and seating directly with each venue.</p></div>{saved.length ? <span className="status-pill bg-mint text-moss">{saved.length} saved locally</span> : null}</div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{shown.map((place) => <article className="surface overflow-hidden" key={place.id}><div className="relative"><img src={place.image} alt="" className="h-48 w-full object-cover"/><span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-black text-ink">{place.type}</span><button type="button" className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full transition ${saved.includes(place.id) ? "bg-amber-100 text-amber-800" : "bg-white/95 text-slate-600"}`} aria-label={saved.includes(place.id) ? "Remove from saved places" : "Save place"} aria-pressed={saved.includes(place.id)} onClick={() => toggleSaved(place.id)}><Bookmark size={17} fill={saved.includes(place.id) ? "currentColor" : "none"}/></button></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black text-ink">{place.name}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500"><MapPin size={15}/>{place.locality}, {place.city}</p></div><span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-black text-amber-800"><Star size={13} fill="currentColor"/>{place.rating}</span></div><p className="mt-4 text-sm leading-6 text-slate-600">{place.note}</p><div className="mt-4 flex flex-wrap gap-2">{place.highlights.map((highlight) => <span key={highlight} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{highlight}</span>)}</div><div className="mt-4 rounded-2xl bg-slate-50 p-3"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500"><PawPrint size={13}/> Pet-access prompt</p><p className="mt-1 text-sm font-semibold leading-5 text-slate-700">{place.petPolicy}</p></div><div className="mt-5 flex gap-2"><button className="btn-secondary flex-1 justify-center" type="button" onClick={() => setSelectedPlace(place)}><PhoneCall size={16}/> Check before you go</button><button className="btn-ghost px-3" type="button" aria-label={saved.includes(place.id) ? "Remove saved place" : "Save place"} onClick={() => toggleSaved(place.id)}><Bookmark size={17} fill={saved.includes(place.id) ? "currentColor" : "none"}/></button></div></div></article>)}</div>{!shown.length ? <div className="surface mt-5 p-10 text-center"><MapPin className="mx-auto text-moss" size={30}/><h3 className="mt-3 font-black text-ink">No illustrative cards match this search.</h3><p className="mt-2 text-sm text-slate-600">Clear a filter, search Pune, or use the outgoing checklist to assess a venue you find yourself.</p><button type="button" className="btn-secondary mt-5" onClick={() => { setCity("Pune"); setCategory("All"); setQuery(""); }}>Reset guide filters</button></div> : null}</section>

      <section className="grid gap-5 lg:grid-cols-2"><div className="surface p-5 sm:p-6"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-teal-700" size={21}/><div><h2 className="font-black text-ink">Quick call-ahead checklist</h2><ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600"><li><strong className="text-ink">Access:</strong> Are pets allowed today, and only in an outdoor area?</li><li><strong className="text-ink">Practical limits:</strong> Are there size, carrier, leash, vaccination or time restrictions?</li><li><strong className="text-ink">Comfort:</strong> Is there shade, water, quiet seating and a safe route in and out?</li><li><strong className="text-ink">Courtesy:</strong> Can you keep your pet settled and leave the space cleaner than you found it?</li></ul></div></div></div><div className="rounded-3xl bg-slate-900 p-5 text-white sm:p-6"><div className="flex gap-3"><Clock3 className="shrink-0 text-mint" size={21}/><div><h2 className="font-black">A calmer outing plan</h2><p className="mt-3 text-sm leading-6 text-slate-300">Bring water, a leash or carrier, waste bags, familiar treats and the right comfort item. Choose off-peak times for pets who prefer lower stimulation, and leave if your pet seems uncomfortable.</p>{selectedPet ? <p className="mt-4 rounded-xl bg-white/10 p-3 text-sm font-semibold text-mint">For {selectedPet.name}: use the Passport and Emergency mode for health context - not this guide - if urgent care information is needed.</p> : null}</div></div></div></section>
    </div>

    {selectedPlace ? <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="call-ahead-title"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><span className="eyebrow"><PhoneCall size={14}/> Before you go</span><h2 id="call-ahead-title" className="mt-3 text-2xl font-black text-ink">Check {selectedPlace.name}</h2></div><button type="button" className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" onClick={() => setSelectedPlace(null)} aria-label="Close"><X size={20}/></button></div><p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-950">{selectedPlace.reviewLabel}. Pet policy, hours and availability are examples only, so this page does not place a call or confirm access.</p><div className="mt-4 space-y-3 rounded-2xl border border-slate-200 p-4"><p className="flex items-center gap-2 font-black text-ink"><MapPin className="text-teal-700" size={17}/>{selectedPlace.locality}, {selectedPlace.city}</p><p className="flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 size={16}/>{selectedPlace.hours}</p><p className="flex items-start gap-2 text-sm leading-6 text-slate-600"><Dog className="mt-0.5 shrink-0" size={16}/>{selectedPlace.petPolicy}</p></div><div className="mt-5 flex justify-end"><button className="btn-primary" type="button" onClick={() => setSelectedPlace(null)}><CheckCircle2 size={16}/> I will confirm directly</button></div></div></div> : null}
  </WorkspaceShell>;
}
