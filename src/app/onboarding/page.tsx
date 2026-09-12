"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ArrowRight, Loader2, PawPrint, Plus } from "lucide-react";
import { PetPhotoUpload } from "@/features/pet-photo-upload";
import type { Pet, Species } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";

const defaultImages: Record<Species, string> = {
  Dog: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
  Cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85",
  Bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=85",
  Rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=85",
  Other: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=85",
};

export default function OnboardingPage() {
  const router = useRouter();
  const { addPet, hydrated } = usePetcare();
  const [error, setError] = useState("");
  const [species, setSpecies] = useState<Species>("Dog");
  const [image, setImage] = useState<string | undefined>();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name || !data.get("birthDate")) {
      setError("Please enter your pet’s name and date of birth (or an estimated date).");
      return;
    }
    const pet: Omit<Pet, "id"> = {
      name,
      species,
      breed: String(data.get("breed")).trim() || "Mixed breed",
      birthDate: String(data.get("birthDate")),
      gender: data.get("gender") as Pet["gender"],
      weight: Number(data.get("weight")) || 0,
      color: String(data.get("color")).trim() || "Not specified",
      image: image ?? defaultImages[species],
      microchipId: String(data.get("microchipId")).trim() || undefined,
      allergies: String(data.get("allergies")).split(",").map((value) => value.trim()).filter(Boolean),
      conditions: String(data.get("conditions")).split(",").map((value) => value.trim()).filter(Boolean),
      dietaryPreferences: String(data.get("diet")).split(",").map((value) => value.trim()).filter(Boolean),
      activityLevel: data.get("activity") as Pet["activityLevel"],
      vaccinationStatus: "Up to date",
    };
    addPet(pet);
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-mint via-cream to-sky px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-white shadow-soft"><PawPrint size={22} /></span><div><p className="text-sm font-bold text-moss">PetCare Hub</p><p className="text-xs text-slate-500">Step 1 of your care journey</p></div></div>
        <div className="surface mt-8 overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-7 sm:px-10"><span className="eyebrow"><Plus size={14} /> First pet passport</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink sm:text-4xl">Let’s set up your pet.</h1><p className="mt-2 text-slate-600">A few helpful details now make health tracking, the care calendar and recommendations more useful later.</p></div>
          {!hydrated ? <div className="flex items-center justify-center gap-3 p-12 text-sm font-semibold text-slate-600"><Loader2 className="animate-spin text-moss" size={20} /> Loading your private workspace…</div> : (
            <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2 sm:p-10" noValidate>
              <PetPhotoUpload value={image} onChange={setImage} petName="your pet" className="sm:col-span-2" />
              <div><label className="field-label" htmlFor="pet-name">Pet name</label><input className="field" id="pet-name" name="name" placeholder="e.g. Bruno" required /></div>
              <div><label className="field-label" htmlFor="species">Species</label><select className="field" id="species" name="species" value={species} onChange={(event) => setSpecies(event.target.value as Species)}><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
              <div><label className="field-label" htmlFor="breed">Breed</label><input className="field" id="breed" name="breed" placeholder="e.g. Golden Retriever" /></div>
              <div><label className="field-label" htmlFor="birthDate">Date of birth / estimate</label><input className="field" id="birthDate" name="birthDate" type="date" required /></div>
              <div><label className="field-label" htmlFor="gender">Gender</label><select className="field" id="gender" name="gender"><option>Male</option><option>Female</option></select></div>
              <div><label className="field-label" htmlFor="weight">Weight (kg)</label><input className="field" id="weight" name="weight" type="number" step="0.1" min="0" placeholder="e.g. 28.4" /></div>
              <div><label className="field-label" htmlFor="color">Color</label><input className="field" id="color" name="color" placeholder="e.g. Golden" /></div>
              <div><label className="field-label" htmlFor="microchipId">Microchip ID <span className="font-normal text-slate-400">(optional)</span></label><input className="field" id="microchipId" name="microchipId" placeholder="e.g. IN-PN-490271" /></div>
              <div className="sm:col-span-2"><label className="field-label" htmlFor="allergies">Allergies <span className="font-normal text-slate-400">(comma separated)</span></label><input className="field" id="allergies" name="allergies" placeholder="e.g. Chicken, pollen" /></div>
              <div className="sm:col-span-2"><label className="field-label" htmlFor="conditions">Medical conditions <span className="font-normal text-slate-400">(comma separated)</span></label><input className="field" id="conditions" name="conditions" placeholder="Leave blank if none known" /></div>
              <div><label className="field-label" htmlFor="diet">Dietary preferences</label><input className="field" id="diet" name="diet" placeholder="e.g. Grain-free" /></div>
              <div><label className="field-label" htmlFor="activity">Activity level</label><select className="field" id="activity" name="activity"><option>Moderate</option><option>Low</option><option>High</option></select></div>
              {error ? <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
              <div className="sm:col-span-2 mt-2 flex justify-end"><button className="btn-primary">Create pet passport <ArrowRight size={17} /></button></div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
