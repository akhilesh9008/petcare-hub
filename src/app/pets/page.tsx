"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { EmptyState, PetCard, SearchBar } from "@/components";
import { Pet } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { PetFormModal } from "@/features/pet-form";
import { formatPetAge, WorkspaceShell } from "@/features/workspace-shell";

export default function PetsPage() {
  const { pets, reminders, addPet } = usePetcare(); const [query, setQuery] = useState(""); const [showForm, setShowForm] = useState(false);
  const shown = pets.filter((pet) => `${pet.name} ${pet.breed} ${pet.species}`.toLowerCase().includes(query.toLowerCase()));
  return <WorkspaceShell title="My pets" subtitle="Every profile keeps their health, care, and preferences together." actions={<button onClick={() => setShowForm(true)} className="btn-primary"><Plus size={16}/> Add pet</button>}><div className="space-y-6"><div className="flex flex-col gap-3 sm:flex-row"><SearchBar value={query} onChange={setQuery} placeholder="Search pets by name, breed, or species" className="max-w-xl flex-1"/><button className="btn-secondary" onClick={() => setQuery("")}><SlidersHorizontal size={16}/> Reset filters</button></div>{shown.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shown.map((pet) => <PetCard key={pet.id} href={`/pets/${pet.id}`} pet={{ id: pet.id, name: pet.name, species: pet.species, breed: pet.breed, age: formatPetAge(pet.birthDate), weight: pet.weight, imageUrl: pet.image, healthStatus: pet.vaccinationStatus === "Due soon" ? "attention" : pet.vaccinationStatus === "Overdue" ? "overdue" : "good", nextCare: reminders.find((item) => item.petId === pet.id && item.status !== "DONE")?.title }} />)}<button onClick={() => setShowForm(true)} className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-moss/35 bg-mint/35 p-6 transition hover:bg-mint"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-moss shadow-sm"><Plus size={22}/></span><span className="mt-4 font-extrabold text-ink">Add another companion</span><span className="mt-1 text-sm text-slate-600">Create a connected profile.</span></button></div> : <EmptyState title="No pets match that search" description="Try a different name or add a new pet profile." actionLabel="Add pet" onAction={() => setShowForm(true)} />}</div>{showForm && <PetFormModal onClose={() => setShowForm(false)} onSave={(pet: Omit<Pet, "id">) => { addPet(pet); setShowForm(false); }} />}</WorkspaceShell>;
}
