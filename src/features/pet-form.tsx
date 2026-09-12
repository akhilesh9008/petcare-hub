"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";
import { PetPhotoUpload } from "@/features/pet-photo-upload";
import type { Pet, Species } from "@/features/demo-data";

const defaultImages: Record<Species, string> = {
  Dog: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=900&q=85",
  Cat: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=85",
  Bird: "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=900&q=85",
  Rabbit: "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?auto=format&fit=crop&w=900&q=85",
  Other: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=900&q=85",
};

interface PetFormModalProps {
  pet?: Pet;
  onClose: () => void;
  onSave: (pet: Omit<Pet, "id">) => void;
}

export function PetFormModal({ pet, onClose, onSave }: PetFormModalProps) {
  const [error, setError] = useState("");
  const [species, setSpecies] = useState<Species>(pet?.species ?? "Dog");
  const [image, setImage] = useState<string | undefined>(pet?.image);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    if (!name || !data.get("birthDate")) {
      setError("Pet name and date of birth are required.");
      return;
    }
    onSave({
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
      vaccinationStatus: pet?.vaccinationStatus ?? "Up to date",
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="pet-form-title">
      <button onClick={onClose} className="absolute inset-0" aria-label="Close form" />
      <form className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl" onSubmit={submit}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 sm:px-8"><div><h2 id="pet-form-title" className="text-xl font-black tracking-[-.03em] text-ink">{pet ? `Edit ${pet.name}` : "Add a pet"}</h2><p className="mt-1 text-sm text-slate-600">The profile becomes the home for every care detail.</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={19} /></button></div>
        <div className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
          <PetPhotoUpload value={image} onChange={setImage} petName={pet?.name ?? "your pet"} className="sm:col-span-2" />
          <div><label className="field-label" htmlFor="pet-form-name">Pet name</label><input className="field" id="pet-form-name" name="name" defaultValue={pet?.name} required /></div>
          <div><label className="field-label" htmlFor="pet-form-species">Species</label><select className="field" id="pet-form-species" name="species" value={species} onChange={(event) => setSpecies(event.target.value as Species)}><option>Dog</option><option>Cat</option><option>Bird</option><option>Rabbit</option><option>Other</option></select></div>
          <div><label className="field-label" htmlFor="pet-form-breed">Breed</label><input className="field" id="pet-form-breed" name="breed" defaultValue={pet?.breed} /></div>
          <div><label className="field-label" htmlFor="pet-form-birth">Date of birth / estimate</label><input className="field" id="pet-form-birth" name="birthDate" type="date" defaultValue={pet?.birthDate} required /></div>
          <div><label className="field-label" htmlFor="pet-form-gender">Gender</label><select className="field" id="pet-form-gender" name="gender" defaultValue={pet?.gender ?? "Male"}><option>Male</option><option>Female</option></select></div>
          <div><label className="field-label" htmlFor="pet-form-weight">Weight (kg)</label><input className="field" id="pet-form-weight" name="weight" type="number" min="0" step="0.1" defaultValue={pet?.weight} /></div>
          <div><label className="field-label" htmlFor="pet-form-color">Color</label><input className="field" id="pet-form-color" name="color" defaultValue={pet?.color} /></div>
          <div><label className="field-label" htmlFor="pet-form-chip">Microchip ID <span className="font-normal text-slate-400">(optional)</span></label><input className="field" id="pet-form-chip" name="microchipId" defaultValue={pet?.microchipId} /></div>
          <div className="sm:col-span-2"><label className="field-label" htmlFor="pet-form-allergy">Allergies <span className="font-normal text-slate-400">(comma separated)</span></label><input className="field" id="pet-form-allergy" name="allergies" defaultValue={pet?.allergies.join(", ")} /></div>
          <div className="sm:col-span-2"><label className="field-label" htmlFor="pet-form-conditions">Medical conditions <span className="font-normal text-slate-400">(comma separated)</span></label><input className="field" id="pet-form-conditions" name="conditions" defaultValue={pet?.conditions.join(", ")} /></div>
          <div><label className="field-label" htmlFor="pet-form-diet">Dietary preferences</label><input className="field" id="pet-form-diet" name="diet" defaultValue={pet?.dietaryPreferences.join(", ")} /></div>
          <div><label className="field-label" htmlFor="pet-form-activity">Activity level</label><select className="field" id="pet-form-activity" name="activity" defaultValue={pet?.activityLevel ?? "Moderate"}><option>Low</option><option>Moderate</option><option>High</option></select></div>
          {error ? <p className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p> : null}
          <div className="sm:col-span-2 flex justify-end gap-3 border-t border-slate-100 pt-5"><button className="btn-secondary" type="button" onClick={onClose}>Cancel</button><button className="btn-primary" type="submit">{pet ? "Save changes" : "Create pet profile"}</button></div>
        </div>
      </form>
    </div>
  );
}
