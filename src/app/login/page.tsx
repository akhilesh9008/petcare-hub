"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BriefcaseBusiness, LockKeyhole, PawPrint, ShieldCheck, Stethoscope, UserRound } from "lucide-react";
import type { Role } from "@/features/demo-data";
import { LanguageSelector, useLanguage } from "@/features/language";

const destinations: Record<Role, string> = {
  PET_OWNER: "/dashboard",
  VETERINARIAN: "/veterinarian",
  SERVICE_PROVIDER: "/provider",
  ADMIN: "/admin",
};

const demoCredentials: Record<Role, { email: string; password: string }> = {
  PET_OWNER: { email: "akhilesh@petcare.demo", password: "PetCare@123" },
  VETERINARIAN: { email: "aarav@petcare.demo", password: "PetCare@123" },
  SERVICE_PROVIDER: { email: "paws@petcare.demo", password: "PetCare@123" },
  ADMIN: { email: "admin@petcare.demo", password: "PetCare@123" },
};

const accountRoles: Role[] = ["PET_OWNER", "VETERINARIAN", "SERVICE_PROVIDER", "ADMIN"];

function isAccountRole(value: string | null): value is Role {
  return value === "PET_OWNER" || value === "VETERINARIAN" || value === "SERVICE_PROVIDER" || value === "ADMIN";
}

export default function LoginPage() {
  const search = useSearchParams();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<Role>("PET_OWNER");
  const [email, setEmail] = useState(demoCredentials.PET_OWNER.email);
  const [password, setPassword] = useState(demoCredentials.PET_OWNER.password);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const requestedRole = search.get("role");
    if (!isAccountRole(requestedRole)) return;
    setSelectedRole(requestedRole);
    setEmail(demoCredentials[requestedRole].email);
    setPassword(demoCredentials[requestedRole].password);
  }, [search]);

  const chooseRole = (role: Role) => {
    setSelectedRole(role);
    setEmail(demoCredentials[role].email);
    setPassword(demoCredentials[role].password);
    setError("");
  };

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim().includes("@") || password.length < 4) {
      setError("Enter a valid email and password to continue.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, expectedRole: selectedRole }),
      });
      const payload = await response.json() as { data?: { user?: { role?: Role } }; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "We could not sign you in.");

      const role = payload.data?.user?.role;
      window.location.assign(role ? destinations[role] : "/dashboard");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not sign you in.");
      setSubmitting(false);
    }
  }

  const roleCards = accountRoles.map((role) => ({
    role,
    icon: role === "PET_OWNER" ? UserRound : role === "VETERINARIAN" ? Stethoscope : role === "SERVICE_PROVIDER" ? BriefcaseBusiness : ShieldCheck,
    label: t(role === "PET_OWNER" ? "role.petOwner" : role === "VETERINARIAN" ? "role.veterinarian" : role === "SERVICE_PROVIDER" ? "role.serviceProvider" : "role.admin"),
    description: t(role === "PET_OWNER" ? "role.petOwner.description" : role === "VETERINARIAN" ? "role.veterinarian.description" : role === "SERVICE_PROVIDER" ? "role.serviceProvider.description" : "role.admin.description"),
  }));

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-moss/60 blur-3xl" />
        <Link href="/" className="relative flex items-center gap-2 text-lg font-extrabold text-white"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss"><PawPrint size={21} /></span>PetCare Hub</Link>
        <div className="relative max-w-md"><p className="text-sm font-bold uppercase tracking-[.18em] text-[#a7ded2]">{t("auth.welcomeBack")}</p><h1 className="mt-4 text-5xl font-black leading-tight tracking-[-.045em] text-white">Care gets easier when every role connects.</h1><p className="mt-5 text-lg leading-8 text-slate-300">Owners, veterinarians and service providers each see the tools relevant to their work.</p></div>
        <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"><ShieldCheck className="shrink-0 text-[#a7ded2]" /><p>Account type is checked by the server; selecting a role never grants extra access.</p></div>
      </section>
      <section className="flex items-center justify-center bg-cream px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center justify-between gap-4"><Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-ink lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white"><PawPrint size={21} /></span>PetCare Hub</Link><LanguageSelector className="ml-auto" /></div>
          <span className="eyebrow"><LockKeyhole size={14} /> {t("auth.signIn")}</span>
          <h1 className="mt-4 text-4xl font-black tracking-[-.04em] text-ink">{t("auth.welcomeBack")}</h1>
          <p className="mt-3 text-slate-600">{t("auth.chooseWorkspace")}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2" role="group" aria-label={t("auth.roleRequired")}>
            {roleCards.map(({ role, icon: Icon, label, description }) => <button key={role} type="button" onClick={() => chooseRole(role)} aria-pressed={selectedRole === role} className={`rounded-2xl border p-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${selectedRole === role ? "border-teal-300 bg-teal-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}><span className={`grid h-9 w-9 place-items-center rounded-xl ${selectedRole === role ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-600"}`}><Icon size={18}/></span><p className="mt-3 text-sm font-black text-ink">{label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></button>)}
          </div>

          <form className="mt-7 space-y-5" onSubmit={submit} noValidate>
            <div><label className="field-label" htmlFor="email">Email</label><input className="field" id="email" name="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
            <div><label className="field-label" htmlFor="password">Password</label><input className="field" id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
            {error ? <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p> : null}
            <button className="btn-primary w-full" disabled={submitting}>{submitting ? "Opening workspace…" : <>{t("auth.signIn")} <ArrowRight size={17} /></>}</button>
          </form>
          <div className="mt-6 rounded-xl bg-mint p-3 text-sm text-slate-600"><strong className="text-ink">Demo credentials:</strong> <code className="rounded bg-white px-1.5 py-0.5 font-semibold text-moss">{demoCredentials[selectedRole].email}</code> and <code className="rounded bg-white px-1.5 py-0.5 font-semibold text-moss">{demoCredentials[selectedRole].password}</code>.</div>
          <p className="mt-4 rounded-xl bg-slate-100 px-3 py-3 text-xs leading-5 text-slate-600">{t("auth.roleNotice")}</p>
          {selectedRole === "ADMIN" ? <p className="mt-7 text-center text-sm text-slate-600">Administrator accounts are provisioned separately.</p> : <p className="mt-7 text-center text-sm text-slate-600">{t("auth.newHere")} <Link href={`/register?role=${selectedRole}`} className="font-bold text-moss hover:underline">{t("auth.createAccount")}</Link></p>}
        </div>
      </section>
    </main>
  );
}
