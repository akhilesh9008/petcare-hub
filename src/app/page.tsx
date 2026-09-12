import Link from "next/link";
import { ArrowRight, BadgeCheck, Bot, CalendarDays, CheckCircle2, ChevronRight, HeartPulse, Menu, Package, PawPrint, ShieldCheck, ShoppingBag, Sparkles, Stethoscope } from "lucide-react";
import { LanguageSelector } from "@/features/language";

const features = [
  { icon: HeartPulse, title: "Health, in one clear story", text: "Records, vaccinations, medications and weight history stay connected to each pet." },
  { icon: Stethoscope, title: "Veterinary care that fits", text: "Find a veterinarian, choose a time, and keep consultation context close at hand." },
  { icon: CalendarDays, title: "Gentle, timely reminders", text: "Keep routine care moving with medication, vaccination and everyday care reminders." },
  { icon: ShoppingBag, title: "A considered marketplace", text: "Shop practical essentials and see why a product may suit your pet’s profile." },
  { icon: PawPrint, title: "Trusted care services", text: "Discover grooming, walking, boarding and training around your routine." },
  { icon: Bot, title: "A safer AI care companion", text: "Get general education and help preparing for vet visits—never diagnosis or prescriptions." },
];

const steps = ["Create a rich pet profile", "Track health and care", "Book vets and services", "Shop with context"];

const testimonials = [
  { quote: "I finally have Bruno’s vaccine history, appointments and food routine in the same calm place.", name: "Aditi Malhotra", detail: "Pet parent · Pune", initials: "AM" },
  { quote: "The timeline makes every vet visit easier. I can arrive with the right context instead of searching through messages.", name: "Karan Sethi", detail: "Pet parent · Bengaluru", initials: "KS" },
  { quote: "It feels like a thoughtful care desk for my cat, not another shopping app with pet photos on it.", name: "Mira Fernandes", detail: "Pet parent · Mumbai", initials: "MF" },
];

export default function LandingPage() {
  return (
    <main className="overflow-hidden bg-cream">
      <header className="page-wrap relative z-10 flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight text-ink" aria-label="PetCare Hub home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white shadow-soft"><PawPrint size={21} /></span>
          <span>PetCare <span className="text-moss">Hub</span></span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex" aria-label="Main navigation">
          <a href="#features" className="hover:text-moss">Features</a>
          <a href="#how-it-works" className="hover:text-moss">How it works</a>
          <a href="#care" className="hover:text-moss">Care network</a>
          <a href="#ai" className="hover:text-moss">PetCare AI</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <Link href="/login" className="hidden sm:inline-flex btn-ghost">Sign in</Link>
          <Link href="/register" className="btn-primary">Get started <ArrowRight size={16} /></Link>
          <a href="#features" className="ml-1 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-ink transition hover:bg-mint lg:hidden" aria-label="Explore PetCare Hub features"><Menu size={19} /></a>
        </div>
      </header>

      <section className="page-wrap relative pb-20 pt-12 sm:pb-28 sm:pt-20">
        <div className="pointer-events-none absolute -left-32 top-16 h-80 w-80 rounded-full bg-mint/90 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-sky/80 blur-3xl" />
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
          <div className="max-w-2xl animate-fade-up">
            <span className="eyebrow"><Sparkles size={14} /> The pet ownership operating system</span>
            <h1 className="mt-5 text-5xl font-black leading-[1.03] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">Everything your pet needs, <span className="text-moss">in one place.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">Manage your pet’s health, find veterinarians, book services, shop for essentials, and get personalized care recommendations.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-5">Start caring smarter <ArrowRight size={17} /></Link>
              <a href="#features" className="btn-secondary px-5">Explore features <ChevronRight size={17} /></a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-moss" /> Built around each pet</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-moss" /> Private by design</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-moss" /> Useful from day one</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-xl animate-fade-up [animation-delay:120ms]">
            <div className="absolute -left-6 top-12 hidden rounded-2xl border border-white/90 bg-white/90 p-3 shadow-lift backdrop-blur sm:block">
              <p className="text-xs font-bold text-slate-500">NEXT UP</p><p className="mt-1 text-sm font-bold text-ink">Rabies vaccination</p><p className="text-xs text-moss">15 September · Bruno</p>
            </div>
            <div className="relative overflow-hidden rounded-[2rem] bg-ink p-3 shadow-[0_30px_60px_-28px_rgba(14,67,65,.65)]">
              <div className="rounded-[1.55rem] bg-[#f8faf8] p-4 sm:p-6">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-mint text-moss"><PawPrint size={16} /></span><span className="text-sm font-extrabold text-ink">Good evening, Akhilesh</span></div><span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-moss">2 pets</span></div>
                <div className="mt-5 grid gap-3 sm:grid-cols-[1.05fr_.95fr]">
                  <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-sm"><div className="flex gap-3"><img className="h-20 w-20 rounded-xl object-cover" src="https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=300&q=80" alt="Bruno, a Golden Retriever" /><div><p className="font-extrabold text-ink">Bruno</p><p className="mt-0.5 text-xs text-slate-500">Golden Retriever · 5 yrs</p><p className="mt-2 text-xs font-bold text-moss">28.4 kg · Doing well</p></div></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-mint"><div className="h-full w-[83%] rounded-full bg-moss" /></div></div>
                  <div className="rounded-2xl bg-moss p-4 text-white"><p className="text-xs font-bold text-white/70">HEALTH SNAPSHOT</p><p className="mt-2 text-2xl font-black">8 / 9</p><p className="text-xs text-white/80">vaccinations current</p><div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 p-2"><CalendarDays size={14}/><span className="text-xs font-semibold">1 upcoming reminder</span></div></div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3"><div className="rounded-xl bg-sky p-3"><p className="text-[10px] font-bold text-slate-500">CARE</p><p className="mt-1 text-sm font-extrabold text-ink">2 visits</p></div><div className="rounded-xl bg-[#fff1ed] p-3"><p className="text-[10px] font-bold text-slate-500">ORDERS</p><p className="mt-1 text-sm font-extrabold text-ink">On track</p></div><div className="rounded-xl bg-mint p-3"><p className="text-[10px] font-bold text-slate-500">WEIGHT</p><p className="mt-1 text-sm font-extrabold text-ink">Stable</p></div></div>
              </div>
            </div>
            <div className="absolute -bottom-6 -right-3 hidden max-w-48 rounded-2xl border border-white bg-white p-3 shadow-lift sm:block"><div className="flex gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#fff1ed] text-coral"><HeartPulse size={16} /></span><p className="text-xs font-bold leading-5 text-ink">One calm home for every care detail.</p></div></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-white py-5"><div className="page-wrap flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-bold text-slate-500"><span className="inline-flex items-center gap-2"><ShieldCheck className="text-moss" size={18}/> Privacy-aware records</span><span className="inline-flex items-center gap-2"><BadgeCheck className="text-moss" size={18}/> Trusted care network</span><span className="inline-flex items-center gap-2"><Sparkles className="text-moss" size={18}/> Human-centred guidance</span></div></section>

      <section id="features" className="page-wrap py-20 sm:py-28"><div className="max-w-2xl"><span className="eyebrow">One connected experience</span><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">The pieces of pet care finally talk to each other.</h2><p className="mt-4 text-lg leading-8 text-slate-600">From a vet note to a food refill, each task starts with the pet—not with another spreadsheet or chat thread.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(({ icon: Icon, title, text }, index) => <article key={title} className="surface group p-6 transition hover:-translate-y-1 hover:shadow-lift"><span className={`grid h-12 w-12 place-items-center rounded-2xl ${index % 3 === 0 ? "bg-mint text-moss" : index % 3 === 1 ? "bg-sky text-sky-700" : "bg-[#fff0ec] text-coral"}`}><Icon size={22}/></span><h3 className="mt-5 text-lg font-extrabold text-ink">{title}</h3><p className="mt-2 leading-6 text-slate-600">{text}</p><Link href="/register" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-moss">Explore <ArrowRight size={14}/></Link></article>)}</div></section>

      <section id="how-it-works" className="bg-ink py-20 text-white sm:py-28"><div className="page-wrap"><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]"><div><span className="eyebrow bg-white/10 text-[#b7e6d8]">A calmer care rhythm</span><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] sm:text-5xl">A simple system for every stage of life.</h2><p className="mt-5 max-w-md text-lg leading-8 text-slate-300">Start with the details you know today. PetCare Hub makes the next helpful action obvious.</p></div><ol className="grid gap-3 sm:grid-cols-2">{steps.map((step, index) => <li key={step} className="rounded-2xl border border-white/10 bg-white/5 p-5"><span className="text-sm font-black text-[#9bddcb]">0{index + 1}</span><p className="mt-6 text-lg font-bold">{step}</p><p className="mt-2 text-sm leading-6 text-slate-300">{index === 0 ? "Add personality, preferences and care details." : index === 1 ? "Build a useful history without the paper trail." : index === 2 ? "Keep bookings and context in one place." : "Choose practical products with clear reasons."}</p></li>)}</ol></div></div></section>

      <section id="care" className="page-wrap py-20 sm:py-28"><div className="grid items-center gap-10 lg:grid-cols-2"><div className="relative rounded-[2rem] bg-sky p-7 sm:p-10"><div className="surface p-5"><div className="flex items-center justify-between"><span className="text-sm font-extrabold text-ink">Care, at a glance</span><span className="rounded-full bg-mint px-2 py-1 text-[10px] font-bold text-moss">BRUNO</span></div><div className="mt-5 space-y-3"><div className="flex items-center gap-3 rounded-xl bg-cream p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff0ec] text-coral"><CalendarDays size={17}/></span><div><p className="text-sm font-bold text-ink">Rabies vaccination</p><p className="text-xs text-slate-500">Due in 21 days</p></div><span className="ml-auto text-xs font-bold text-moss">Book now</span></div><div className="flex items-center gap-3 rounded-xl bg-cream p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-moss"><Stethoscope size={17}/></span><div><p className="text-sm font-bold text-ink">Dr. Anaya Mehta</p><p className="text-xs text-slate-500">Appointment confirmed</p></div><span className="ml-auto text-xs font-bold text-moss">15 Sep</span></div><div className="flex items-center gap-3 rounded-xl bg-cream p-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-sky text-sky-700"><Package size={17}/></span><div><p className="text-sm font-bold text-ink">Food refill</p><p className="text-xs text-slate-500">Recommended for your profile</p></div><span className="ml-auto text-xs font-bold text-moss">View</span></div></div></div></div><div><span className="eyebrow">Made for the whole care network</span><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">Less chasing context. More time with your pet.</h2><p className="mt-5 text-lg leading-8 text-slate-600">Owners get a clear command centre. Veterinarians, trusted providers and administrators get role-aware workflows designed around the same core profile.</p><div className="mt-7 space-y-3"><p className="flex gap-3 font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-moss" size={20}/> Authorized vet access linked to appointments</p><p className="flex gap-3 font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-moss" size={20}/> Digital history, reminders and documents in context</p><p className="flex gap-3 font-semibold text-slate-700"><CheckCircle2 className="mt-0.5 shrink-0 text-moss" size={20}/> Practical marketplace and services, not generic clutter</p></div></div></div></section>

      <section id="ai" className="page-wrap pb-20 sm:pb-28"><div className="overflow-hidden rounded-[2rem] bg-[#e7f5f1] p-7 sm:p-12"><div className="grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><span className="eyebrow bg-white">PetCare AI</span><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">Helpful context, careful boundaries.</h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">PetCare AI can explain records, surface your pet’s next vaccination and help you prepare better questions for your veterinarian. It gives general information, never diagnoses or prescriptions.</p><Link href="/register" className="btn-primary mt-7">Meet PetCare AI <ArrowRight size={17}/></Link></div><div className="rounded-3xl bg-white p-4 shadow-lift"><div className="flex items-center gap-3 border-b border-slate-100 pb-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-moss text-white"><Bot size={20}/></span><div><p className="font-extrabold text-ink">PetCare AI</p><p className="text-xs text-moss">General care companion</p></div></div><div className="mt-4 space-y-3 text-sm"><div className="max-w-[86%] rounded-2xl rounded-tl-md bg-mint p-3 text-slate-700">When is Bruno’s next vaccination?</div><div className="ml-auto max-w-[88%] rounded-2xl rounded-tr-md bg-ink p-3 text-white">Bruno’s recorded rabies vaccination is due on 15 September. I can help you prepare for the visit, but your veterinarian should confirm the schedule.</div></div><p className="mt-4 rounded-xl bg-[#fff7e9] px-3 py-2 text-xs leading-5 text-slate-600">PetCare AI provides general information and is not a substitute for professional veterinary care.</p></div></div></div></section>

      <section className="page-wrap pb-20 sm:pb-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl"><span className="eyebrow">A quieter kind of confidence</span><h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-ink sm:text-5xl">Built to feel reassuring on an ordinary Tuesday.</h2></div>
          <p className="max-w-sm text-sm leading-6 text-slate-600">Illustrative feedback from fictional demo pet families. The product is designed around the calm, useful details they describe.</p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => <figure key={testimonial.name} className={`surface relative overflow-hidden p-6 ${index === 1 ? "bg-ink text-white" : ""}`}>
            <span className={`text-5xl font-black leading-none ${index === 1 ? "text-[#9bddcb]" : "text-moss/25"}`} aria-hidden="true">“</span>
            <blockquote className={`mt-2 text-lg font-bold leading-7 ${index === 1 ? "text-white" : "text-ink"}`}>{testimonial.quote}</blockquote>
            <figcaption className="mt-6 flex items-center gap-3"><span className={`grid h-10 w-10 place-items-center rounded-2xl text-xs font-black ${index === 1 ? "bg-white/10 text-[#b7e6d8]" : "bg-mint text-moss"}`}>{testimonial.initials}</span><span><span className={`block text-sm font-bold ${index === 1 ? "text-white" : "text-ink"}`}>{testimonial.name}</span><span className={`block text-xs ${index === 1 ? "text-slate-300" : "text-slate-500"}`}>{testimonial.detail}</span></span></figcaption>
          </figure>)}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white"><div className="page-wrap flex flex-col items-start justify-between gap-6 py-12 sm:flex-row sm:items-center"><div><h2 className="text-2xl font-black tracking-[-0.035em] text-ink">Your pet’s care deserves a calmer home.</h2><p className="mt-2 text-slate-600">Set up your first profile in minutes.</p></div><Link href="/register" className="btn-primary">Create your free account <ArrowRight size={17}/></Link></div></section>
      <footer className="bg-ink py-10 text-slate-300"><div className="page-wrap flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-center gap-2 font-extrabold text-white"><span className="grid h-8 w-8 place-items-center rounded-xl bg-moss"><PawPrint size={16}/></span>PetCare Hub</div><p className="text-sm">Everything your pet needs, in one place.</p><p className="text-xs text-slate-400">© 2026 PetCare Hub · Demonstration product</p></div></footer>
    </main>
  );
}
