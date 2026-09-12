"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PawPrint, ShoppingCart, SlidersHorizontal, Sparkles } from "lucide-react";
import { FilterChip, ProductCard, SearchBar } from "@/components";
import type { Pet, Product } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { formatInr, WorkspaceShell } from "@/features/workspace-shell";

function hasPossibleAllergen(product: Product, pet?: Pet) {
  if (!pet?.allergies.length) return false;
  const text = `${product.name} ${product.description} ${product.tags.join(" ")}`.toLowerCase();
  return pet.allergies.some((allergy) => {
    const normalized = allergy.trim().toLowerCase();
    if (!normalized || !text.includes(normalized)) return false;
    return !text.includes(`${normalized}-free`) && !text.includes(`no ${normalized}`);
  });
}

function matchScore(product: Product, pet?: Pet) {
  if (!pet) return product.reason ? 1 : 0;
  if (!product.species.includes(pet.species) || hasPossibleAllergen(product, pet)) return -100;
  const tags = product.tags.map((tag) => tag.toLowerCase());
  const preferences = pet.dietaryPreferences.map((item) => item.toLowerCase());
  let score = 10 + (product.reason ? 1 : 0);
  score += preferences.reduce((total, preference) => total + (tags.some((tag) => tag.includes(preference) || preference.includes(tag)) ? 4 : 0), 0);
  if (pet.activityLevel === "High" && tags.some((tag) => tag.includes("active") || tag.includes("activity") || tag.includes("outdoor"))) score += 3;
  if (pet.activityLevel === "Low" && tags.some((tag) => tag.includes("indoor") || tag.includes("support"))) score += 2;
  return score;
}

function recommendationReason(product: Product, pet?: Pet) {
  if (!pet) return product.reason;
  const reasons = [`Matches ${pet.name}’s ${pet.species.toLowerCase()} profile`];
  const preference = pet.dietaryPreferences.find((item) => product.tags.some((tag) => tag.toLowerCase().includes(item.toLowerCase())));
  if (preference) reasons.push(`supports ${preference.toLowerCase()} preference`);
  if (pet.activityLevel === "High" && product.tags.some((tag) => /active|activity|outdoor/i.test(tag))) reasons.push("fits an active routine");
  return reasons.join(" · ");
}

export default function MarketplacePage() {
  const { products, pets, cart, addToCart } = usePetcare();
  const search = useSearchParams();
  const [petId, setPetId] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [maxPrice, setMaxPrice] = useState(5000);

  useEffect(() => {
    const requestedPet = search.get("pet");
    if (requestedPet && pets.some((pet) => pet.id === requestedPet)) setPetId(requestedPet);
    else if (!pets.some((pet) => pet.id === petId)) setPetId(pets[0]?.id ?? "");
  }, [petId, pets, search]);

  const selectedPet = pets.find((pet) => pet.id === petId);
  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];
  const shown = useMemo(() => products
    .filter((product) => `${product.name} ${product.brand} ${product.category} ${product.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
    .filter((product) => category === "All" || product.category === category)
    .filter((product) => product.price <= maxPrice)
    .filter((product) => !hasPossibleAllergen(product, selectedPet))
    .sort((left, right) => {
      if (sort === "Price: low to high") return left.price - right.price;
      if (sort === "Price: high to low") return right.price - left.price;
      if (sort === "Rating") return right.rating - left.rating;
      return matchScore(right, selectedPet) - matchScore(left, selectedPet) || right.rating - left.rating;
    }), [products, query, category, maxPrice, sort, selectedPet]);
  const recommended = shown.filter((product) => matchScore(product, selectedPet) > 10);
  const items = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <WorkspaceShell title="Marketplace" subtitle="Practical essentials, connected to each pet’s profile." actions={<Link href="/cart" className="btn-primary"><ShoppingCart size={16} /> Cart {items ? `(${items})` : ""}</Link>}>
      <div className="space-y-6">
        <section className="rounded-3xl bg-gradient-to-br from-mint via-white to-sky p-6 sm:p-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end"><div><span className="eyebrow bg-white"><Sparkles size={14} /> Passport-aware essentials</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink">Shop with a little more context.</h1><p className="mt-2 max-w-2xl text-slate-600">Recommendations use the selected pet’s species, activity, dietary preferences and recorded allergies. We never automatically recommend prescription medication.</p><SearchBar className="mt-6 max-w-2xl" value={query} onChange={setQuery} placeholder="Search food, toys, grooming, and more" /></div><div className="min-w-[15rem]"><label className="field-label" htmlFor="marketplace-pet">Shopping for</label><select className="field mt-2 font-bold" id="marketplace-pet" value={petId} onChange={(event) => setPetId(event.target.value)}><option value="">All pets / general catalog</option>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}</select></div></div>
        </section>

        {selectedPet ? <section className="surface flex flex-wrap items-center gap-4 p-4"><img src={selectedPet.image} alt={selectedPet.name} className="h-12 w-12 rounded-2xl object-cover" /><div className="min-w-0 flex-1"><p className="font-black text-ink">Recommendations for {selectedPet.name}</p><p className="mt-1 text-sm text-slate-600">{selectedPet.species} · {selectedPet.activityLevel} activity · {selectedPet.allergies.length ? `allergy-aware: ${selectedPet.allergies.join(", ")}` : "no allergies recorded"}</p></div><Link href={`/pets/${selectedPet.id}`} className="btn-ghost"><PawPrint size={16} /> Open passport</Link></section> : null}

        <div className="surface p-4"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex h-9 items-center gap-1.5 pr-1 text-sm font-bold text-slate-600"><SlidersHorizontal size={16} /> Categories</span>{categories.map((item) => <FilterChip key={item} label={item} active={category === item} onClick={() => setCategory(item)} />)}</div><div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4"><label className="text-sm font-semibold text-slate-600">Price up to <select className="field ml-2 inline h-9 w-auto py-0" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))}><option value={1000}>{formatInr(1000)}</option><option value={2500}>{formatInr(2500)}</option><option value={5000}>Any price</option></select></label><label className="text-sm font-semibold text-slate-600">Sort <select className="field ml-2 inline h-9 w-auto py-0" value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Rating</option><option>Price: low to high</option><option>Price: high to low</option></select></label><p className="ml-auto text-sm text-slate-500">{shown.length} suitable products</p></div></div>

        <section>{selectedPet && recommended.length ? <div className="mb-4 flex items-center gap-2 text-sm font-bold text-moss"><Sparkles size={16} /> Recommended for {selectedPet.name}, based on this pet’s passport</div> : null}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shown.map((product) => <ProductCard key={product.id} product={{ id: product.id, name: product.name, brand: product.brand, imageUrl: product.image, price: product.price, originalPrice: product.originalPrice, rating: product.rating, reviewCount: product.reviews, category: product.category, stock: product.stock, recommendationReason: recommendationReason(product, selectedPet) }} href={`/marketplace/${product.id}`} onAddToCart={() => addToCart(product.id)} />)}</div>{!shown.length ? <div className="surface p-12 text-center"><h2 className="font-black text-ink">No suitable products match those filters.</h2><p className="mt-2 text-sm text-slate-600">Try a different category or price range. Products with a possible recorded allergen are excluded while a pet is selected.</p><button className="btn-secondary mt-4" type="button" onClick={() => { setQuery(""); setCategory("All"); setMaxPrice(5000); }}>Reset marketplace filters</button></div> : null}</section>
      </div>
    </WorkspaceShell>
  );
}
