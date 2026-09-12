"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { AlertTriangle, Bot, Eraser, Send, Sparkles, Stethoscope } from "lucide-react";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";

const suggestions = [
  "Show my pet's health summary",
  "What vaccinations are coming up?",
  "Help me prepare for my vet visit",
  "What changes do you see in the health band data?",
  "What food categories might suit my pet?",
];

export default function AiAssistantPage() {
  const {
    pets,
    records,
    medications,
    weights,
    conversations,
    sendMessage,
    clearConversation,
  } = usePetcare();
  const [petId, setPetId] = useState("");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);
  const pendingReply = useRef<number | null>(null);

  const pet = pets.find((item) => item.id === petId);
  const messages = petId ? conversations[petId] ?? [] : [];
  const latestRecord = records
    .filter((item) => item.petId === petId)
    .sort((left, right) => right.date.localeCompare(left.date))[0];
  const currentWeight = weights
    .filter((item) => item.petId === petId)
    .sort((left, right) => right.date.localeCompare(left.date))[0];

  useEffect(() => {
    if (!pets.some((item) => item.id === petId)) {
      setPetId(pets[0]?.id ?? "");
    }
  }, [petId, pets]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, typing]);

  useEffect(() => {
    return () => {
      if (pendingReply.current) window.clearTimeout(pendingReply.current);
    };
  }, []);

  function send(text: string) {
    const value = text.trim();
    if (!value || !petId || typing) return;

    setInput("");
    setTyping(true);
    pendingReply.current = window.setTimeout(() => {
      sendMessage(petId, value);
      pendingReply.current = null;
      setTyping(false);
    }, 420);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  if (!pets.length) {
    return (
      <WorkspaceShell title="PetCare AI" subtitle="A context-aware companion for every pet profile.">
        <div className="surface mx-auto max-w-2xl p-8 text-center sm:p-12">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-mint text-moss">
            <Bot size={30} />
          </span>
          <h2 className="mt-5 text-2xl font-black tracking-[-.03em] text-ink">Create a pet profile first.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
            PetCare AI uses the health passport, reminders, appointments and wearable context you choose to record. It never diagnoses or replaces a veterinarian.
          </p>
          <Link href="/onboarding" className="btn-primary mt-6">Create a pet profile</Link>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="PetCare AI" subtitle="General information and better questions for veterinary care.">
      <div className="grid gap-6 xl:grid-cols-[.72fr_1.28fr]">
        <aside className="space-y-5">
          <section className="surface p-5">
            <p className="eyebrow"><Sparkles size={14} /> Current pet context</p>
            <label className="field-label mt-5" htmlFor="ai-pet">Talk about</label>
            <select className="field" id="ai-pet" value={petId} onChange={(event) => setPetId(event.target.value)}>
              {pets.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.species}</option>)}
            </select>
            {pet ? (
              <div className="mt-5 rounded-2xl bg-mint/55 p-4">
                <div className="flex items-center gap-3">
                  <img className="h-12 w-12 rounded-2xl object-cover" src={pet.image} alt={pet.name} />
                  <div>
                    <p className="font-black text-ink">{pet.name}</p>
                    <p className="text-sm text-slate-600">{pet.species} · {pet.breed}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Latest weight</dt><dd className="font-bold text-ink">{currentWeight?.weight ?? pet.weight} kg</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Allergies</dt><dd className="text-right font-bold text-ink">{pet.allergies.length ? pet.allergies.join(", ") : "None recorded"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-slate-500">Medications</dt><dd className="text-right font-bold text-ink">{medications.filter((item) => item.petId === petId).map((item) => item.name).join(", ") || "None active"}</dd></div>
                  {latestRecord ? <div className="border-t border-moss/10 pt-2"><dt className="text-slate-500">Latest record</dt><dd className="mt-1 font-bold text-ink">{latestRecord.reason}</dd></div> : null}
                </dl>
              </div>
            ) : null}
          </section>

          <section className="surface p-5">
            <h2 className="font-black text-ink">Try asking</h2>
            <div className="mt-4 flex flex-col items-start gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={typing} className="rounded-xl bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-mint hover:text-moss disabled:opacity-50">
                  {suggestion}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-orange-200 bg-[#fff7e9] p-5">
            <p className="flex gap-2 font-bold text-ink"><AlertTriangle className="shrink-0 text-orange-600" size={19} /> Safety first</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">PetCare AI provides general information and is not a substitute for professional veterinary care. It does not diagnose illness, prescribe medicine, or change dosage.</p>
            <p className="mt-3 flex gap-2 text-sm font-semibold text-orange-800"><Stethoscope className="shrink-0" size={17} /> For severe, sudden, or worsening symptoms, contact a veterinarian or emergency veterinary service.</p>
          </section>
        </aside>

        <section className="surface flex min-h-[680px] flex-col overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white"><Bot size={20} /></span>
              <div>
                <h1 className="font-black text-ink">PetCare AI</h1>
                <p className="text-xs text-moss">Passport-aware care companion · {pet?.name ?? "Select a pet"}</p>
              </div>
            </div>
            <button type="button" onClick={() => clearConversation(petId)} className="btn-ghost" disabled={!messages.length}><Eraser size={16} /> Clear</button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 p-5">
            {!messages.length ? (
              <div className="mx-auto mt-12 max-w-md text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-mint text-moss"><Bot size={26} /></span>
                <h2 className="mt-4 text-xl font-black text-ink">Hi, I’m here to help you think through {pet?.name ?? "your pet"}’s care.</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">I can turn the profile, records, reminders and health-band trends into a practical vet-prep or care summary.</p>
              </div>
            ) : null}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "rounded-br-md bg-ink text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm"}`}>{message.text}</div>
              </div>
            ))}
            {typing ? <div className="flex justify-start"><div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"><span className="h-2 w-2 animate-bounce rounded-full bg-moss" /><span className="h-2 w-2 animate-bounce rounded-full bg-moss [animation-delay:120ms]" /><span className="h-2 w-2 animate-bounce rounded-full bg-moss [animation-delay:240ms]" /></div></div> : null}
            <div ref={bottom} />
          </div>
          <form className="flex gap-3 border-t border-slate-100 bg-white p-4" onSubmit={submit}>
            <label className="sr-only" htmlFor="ai-message">Ask PetCare AI</label>
            <input className="field flex-1" id="ai-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Ask about ${pet?.name ?? "your pet"}…`} disabled={!petId || typing} />
            <button className="btn-primary" type="submit" disabled={!input.trim() || typing}><Send size={17} /><span className="hidden sm:inline">Send</span></button>
          </form>
        </section>
      </div>
    </WorkspaceShell>
  );
}
