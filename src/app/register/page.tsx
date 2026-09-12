"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, PawPrint, ShieldCheck, Sparkles, Stethoscope, UserRound } from "lucide-react";
import type { Role } from "@/features/demo-data";
import { LanguageSelector, useLanguage } from "@/features/language";

type PublicRole = Exclude<Role, "ADMIN">;
const publicRoles: PublicRole[] = ["PET_OWNER", "VETERINARIAN", "SERVICE_PROVIDER"];

function isPublicRole(value: string | null): value is PublicRole {
  return value === "PET_OWNER" || value === "VETERINARIAN" || value === "SERVICE_PROVIDER";
}

export default function RegisterPage() {
  const search = useSearchParams();
  const { t } = useLanguage();
  const [role, setRole] = useState<PublicRole>("PET_OWNER");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requestedRole = search.get("role");
    if (isPublicRole(requestedRole)) setRole(requestedRole);
  }, [search]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name")).trim();
    const phone = String(form.get("phone")).trim();
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    if (name.length < 2 || !email.includes("@") || password.length < 8) {
      setError("Add your name, a valid email, and a password with at least 8 characters.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, email, password, role }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "We could not create your account.");
      // A full navigation lets the client workspace load the just-created role
      // from its server session instead of falling back to demo data.
      window.location.assign(role === "PET_OWNER" ? "/onboarding" : "/professional-onboarding");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not create your account.");
      setSubmitting(false);
    }
  }

  const roleCards = publicRoles.map((item) => ({
    role: item,
    icon: item === "PET_OWNER" ? UserRound : item === "VETERINARIAN" ? Stethoscope : BriefcaseBusiness,
    label: t(item === "PET_OWNER" ? "role.petOwner" : item === "VETERINARIAN" ? "role.veterinarian" : "role.serviceProvider"),
    description: t(item === "PET_OWNER" ? "role.petOwner.description" : item === "VETERINARIAN" ? "role.veterinarian.description" : "role.serviceProvider.description"),
  }));

  return (
    <main className="min-h-screen bg-cream px-4 py-8 sm:px-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4"><Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-ink"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white"><PawPrint size={21} /></span>PetCare Hub</Link><div className="flex items-center gap-3"><LanguageSelector compact /><p className="hidden text-sm text-slate-600 sm:block">{t("auth.alreadyMember")} <Link href="/login" className="font-bold text-moss">{t("auth.signIn")}</Link></p></div></header>
      <div className="mx-auto mt-10 grid max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lift lg:grid-cols-[.85fr_1.15fr]">
        <aside className="hidden bg-ink p-10 text-white lg:block">
          <span className="eyebrow bg-white/10 text-[#a7ded2]"><Sparkles size={14} /> Connected pet care</span>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-[-.045em]">One platform, tailored to the people who keep pets well.</h1>
          <p className="mt-5 leading-7 text-slate-300">Choose your account type first. You will land in a private workspace that fits the care you provide or coordinate.</p>
          <ul className="mt-10 space-y-5 text-sm text-slate-200">{["Pet owners build passports and care routines", "Veterinarians manage authorized clinical context", "Service providers manage bookings and availability"].map((item) => <li className="flex gap-3" key={item}><CheckCircle2 className="shrink-0 text-[#a7ded2]" size={19} />{item}</li>)}</ul>
        </aside>
        <section className="p-6 sm:p-10">
          <span className="eyebrow">{t("auth.createYourSpace")}</span>
          <h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink">Pick the workspace you need.</h1>
          <p className="mt-2 text-slate-600">Your account is saved on this local server. You can complete the relevant profile after you sign up.</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3" role="group" aria-label="Account type">
            {roleCards.map(({ role: optionRole, icon: Icon, label, description }) => <button key={optionRole} type="button" onClick={() => setRole(optionRole)} aria-pressed={role === optionRole} className={`rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${role === optionRole ? "border-teal-300 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${role === optionRole ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}><Icon size={18}/></span><p className="mt-3 text-sm font-black text-ink">{label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></button>)}
          </div>

          <form className="mt-7 grid gap-5 sm:grid-cols-2" onSubmit={submit} noValidate>
            <div><label className="field-label" htmlFor="name">Name</label><input className="field" id="name" name="name" autoComplete="name" placeholder="Akhilesh Sharma" required /></div>
            <div><label className="field-label" htmlFor="phone">Phone</label><input className="field" id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+91 98765 43210" required /></div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="register-email">Email</label><input className="field" id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required /></div>
            <div className="sm:col-span-2"><label className="field-label" htmlFor="register-password">Password</label><input className="field" id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} placeholder="At least 8 characters" required /></div>
            {role !== "PET_OWNER" ? <div className="sm:col-span-2 rounded-xl bg-amber-50 p-3 text-sm leading-5 text-amber-950"><span className="flex gap-2 font-bold"><ShieldCheck className="mt-0.5 shrink-0" size={17}/> Professional workspace notice</span><p className="mt-1">This local project enables the selected professional workspace for testing. Before production use, verify veterinarian licences and service-business details before enabling care access or public listings.</p></div> : null}
            {error ? <p role="alert" className="sm:col-span-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
            <div className="sm:col-span-2"><button className="btn-primary w-full" disabled={submitting}>{submitting ? "Creating account…" : <>{t("auth.createAccount")} <ArrowRight size={17} /></>}</button><p className="mt-3 text-center text-xs leading-5 text-slate-500">By creating an account, you agree to use PetCare Hub responsibly. AI guidance is general information, not veterinary advice.</p></div>
          </form>
        </section>
      </div>
      <p className="mt-5 text-center text-sm text-slate-600 sm:hidden">{t("auth.alreadyMember")} <Link href="/login" className="font-bold text-moss">{t("auth.signIn")}</Link></p>
    </main>
  );
}
