"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Activity, AlertCircle, Bluetooth, CalendarDays, CheckCircle2, ChevronDown, Clock3, Footprints, HeartPulse, Plus, Radio, ShieldCheck, Smartphone, Watch, X } from "lucide-react";
import {
  type HealthBandAlert as HealthBandAlertCard,
  type HealthBandDay,
  type HealthBandHabit as HealthBandHabitCard,
  type HealthBandMetric as HealthBandMetricCard,
  PetHealthBandOverview,
  PetRouteMap,
} from "@/components";
import {
  BrowserWearableError,
  connectBrowserWearable,
  disconnectBrowserWearable,
  getBrowserWearableSupport,
  isBrowserWearableSessionActive,
  refreshBrowserWearable,
  type BrowserWearableReading,
} from "@/lib/browser-wearable";
import type { HabitKind } from "@/features/demo-data";
import { usePetcare } from "@/features/petcare-store";
import { WorkspaceShell } from "@/features/workspace-shell";

const habitOptions: Array<{ value: HabitKind; label: string; needsDuration?: boolean }> = [
  { value: "WALK", label: "Walk", needsDuration: true },
  { value: "PLAY", label: "Play", needsDuration: true },
  { value: "MEAL", label: "Meal" },
  { value: "WATER", label: "Water refresh" },
  { value: "REST", label: "Quiet rest", needsDuration: true },
  { value: "POTTY", label: "Potty break" },
  { value: "MEDICATION", label: "Medication" },
];

function formatDuration(minutes?: number) {
  if (!minutes) return "No estimate";
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

function compactDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function liveReadingText(value?: string) {
  if (!value) return "No live reading yet";
  return `Live reading ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(value))}`;
}

function readableError(error: unknown) {
  if (error instanceof BrowserWearableError) return error.message;
  if (error instanceof Error) return error.message;
  return "That connection could not be completed. Check the browser permission and band pairing, then try again.";
}

export default function HealthBandPage() {
  const search = useSearchParams();
  const {
    pets, bands, bandMetrics, habits, bandAlerts, locationPoints, saveBluetoothBand, updateBluetoothBandReading, disconnectBand,
    addHabit, markBandAlertRead, addLocationPoint, clearLocationPoints,
  } = usePetcare();
  const [selectedPetId, setSelectedPetId] = useState(search.get("pet") ?? "bruno");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [connectionNotice, setConnectionNotice] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [gpsTracking, setGpsTracking] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const [browserReady, setBrowserReady] = useState(false);
  const gpsWatchId = useRef<number | null>(null);

  useEffect(() => { setBrowserReady(true); }, []);

  useEffect(() => {
    const requestedPet = search.get("pet");
    if (requestedPet && pets.some((pet) => pet.id === requestedPet)) setSelectedPetId(requestedPet);
  }, [search, pets]);

  const selectedPet = pets.find((pet) => pet.id === selectedPetId) ?? pets[0];
  const band = selectedPet ? bands.find((item) => item.petId === selectedPet.id) : undefined;
  const petMetrics = useMemo(
    () => bandMetrics.filter((metric) => metric.petId === selectedPet?.id).sort((a, b) => a.date.localeCompare(b.date)),
    [bandMetrics, selectedPet?.id],
  );
  const selectedMetric = petMetrics.find((metric) => metric.date === selectedDayId) ?? petMetrics.at(-1);
  const routePoints = useMemo(
    () => locationPoints.filter((point) => point.petId === selectedPet?.id).sort((left, right) => left.timestamp.localeCompare(right.timestamp)),
    [locationPoints, selectedPet?.id],
  );
  const support = browserReady ? getBrowserWearableSupport() : { supported: false, message: "Checking this browser's Bluetooth support…" };
  const isRealBand = band?.connectionType === "BLUETOOTH_LE";
  const hasLiveBluetoothSession = Boolean(browserReady && isRealBand && band?.bluetoothDeviceId && isBrowserWearableSessionActive(band.bluetoothDeviceId));

  useEffect(() => {
    if (selectedMetric && selectedMetric.date !== selectedDayId) setSelectedDayId(selectedMetric.date);
  }, [selectedDayId, selectedMetric]);

  useEffect(() => {
    if (!selectedPet || !band || band.connectionType !== "BLUETOOTH_LE" || !band.bluetoothDeviceId) return;
    if (!isBrowserWearableSessionActive(band.bluetoothDeviceId) && band.status !== "DISCONNECTED") disconnectBand(selectedPet.id);
  }, [band, disconnectBand, selectedPet]);

  useEffect(() => () => {
    if (gpsWatchId.current !== null && typeof navigator !== "undefined") navigator.geolocation.clearWatch(gpsWatchId.current);
  }, []);

  useEffect(() => {
    if (gpsWatchId.current === null) return;
    navigator.geolocation.clearWatch(gpsWatchId.current);
    gpsWatchId.current = null;
    setGpsTracking(false);
    setGpsMessage("GPS tracking stopped because you switched the pet profile.");
  }, [selectedPetId]);

  const applyLiveReading = useCallback((petId: string, reading: BrowserWearableReading, firstConnection = false) => {
    if (firstConnection) {
      saveBluetoothBand({
        petId,
        deviceId: reading.deviceId,
        name: reading.name,
        batteryLevel: reading.batteryLevel,
        supportsBattery: reading.supportsBattery,
        supportsHeartRate: reading.supportsHeartRate,
        heartRate: reading.heartRate,
        readAt: reading.readAt,
      });
      return;
    }
    updateBluetoothBandReading({ petId, batteryLevel: reading.batteryLevel, heartRate: reading.heartRate, readAt: reading.readAt });
  }, [saveBluetoothBand, updateBluetoothBandReading]);

  const connectRealBand = useCallback(async () => {
    if (!selectedPet || isConnecting) return;
    const petId = selectedPet.id;
    setConnectionNotice("");
    setIsConnecting(true);
    try {
      const session = await connectBrowserWearable((reading) => applyLiveReading(petId, reading));
      applyLiveReading(petId, session, true);
      const capabilityLine = session.supportsHeartRate ? "Live heart-rate notifications are enabled when the band sends them." : "This band did not expose the standard Heart Rate service.";
      setConnectionNotice(`${session.name} is connected in this browser. ${capabilityLine}`);
    } catch (error) {
      setConnectionNotice(readableError(error));
    } finally {
      setIsConnecting(false);
    }
  }, [applyLiveReading, isConnecting, selectedPet]);

  const refreshRealBand = useCallback(async () => {
    if (!selectedPet || isRefreshing) return;
    if (!band?.bluetoothDeviceId || !isRealBand) {
      await connectRealBand();
      return;
    }
    setConnectionNotice("");
    setIsRefreshing(true);
    try {
      const reading = await refreshBrowserWearable(band.bluetoothDeviceId);
      applyLiveReading(selectedPet.id, reading);
      setConnectionNotice(`${reading.name} was refreshed from this active browser session.`);
    } catch (error) {
      disconnectBand(selectedPet.id);
      setConnectionNotice(readableError(error));
    } finally {
      setIsRefreshing(false);
    }
  }, [applyLiveReading, band?.bluetoothDeviceId, connectRealBand, disconnectBand, isRealBand, isRefreshing, selectedPet]);

  const disconnectRealBand = useCallback(() => {
    if (!selectedPet) return;
    if (band?.connectionType === "BLUETOOTH_LE" && band.bluetoothDeviceId) disconnectBrowserWearable(band.bluetoothDeviceId);
    disconnectBand(selectedPet.id);
    setConnectionNotice("The Bluetooth session was disconnected. The saved historical summary remains in this private workspace.");
  }, [band, disconnectBand, selectedPet]);

  const stopGpsTracking = useCallback(() => {
    if (gpsWatchId.current !== null && typeof navigator !== "undefined") navigator.geolocation.clearWatch(gpsWatchId.current);
    gpsWatchId.current = null;
    setGpsTracking(false);
    setGpsMessage("GPS tracking is stopped. The route already recorded stays in this browser workspace until you clear it.");
  }, []);

  const startGpsTracking = useCallback(() => {
    if (!selectedPet) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsMessage("This device does not provide browser geolocation. Use a GPS-capable phone or a supported tracker provider.");
      return;
    }
    if (typeof window !== "undefined" && !window.isSecureContext) {
      setGpsMessage("GPS requires HTTPS. localhost works during desktop development; use HTTPS when testing from a phone or LAN address.");
      return;
    }
    if (gpsWatchId.current !== null) return;
    const petId = selectedPet.id;
    setGpsMessage("Requesting location permission for this phone…");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const timestamp = new Date(position.timestamp).toISOString();
        addLocationPoint({
          petId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: position.coords.accuracy,
          speedMps: position.coords.speed ?? undefined,
          heading: position.coords.heading ?? undefined,
          timestamp,
          source: "PHONE_GPS",
        });
        setGpsTracking(true);
        setGpsMessage(`GPS tracking is live. Last point recorded at ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(timestamp))}.`);
      },
      (error) => {
        if (gpsWatchId.current !== null) navigator.geolocation.clearWatch(gpsWatchId.current);
        gpsWatchId.current = null;
        setGpsTracking(false);
        const reason = error.code === error.PERMISSION_DENIED ? "Location permission was denied." : error.code === error.POSITION_UNAVAILABLE ? "Your location is currently unavailable." : "Location request timed out.";
        setGpsMessage(`${reason} Allow precise location and keep the phone with the pet, then try again.`);
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    );
    gpsWatchId.current = watchId;
    setGpsTracking(true);
  }, [addLocationPoint, selectedPet]);

  if (!selectedPet) {
    return <WorkspaceShell title="Health Band"><div className="surface p-10 text-center"><Watch className="mx-auto text-moss" size={28}/><h2 className="mt-4 text-xl font-black text-ink">Add a pet before connecting a band.</h2><Link href="/pets" className="mt-5 btn-primary">Open pet profiles</Link></div></WorkspaceShell>;
  }

  const days: HealthBandDay[] = petMetrics.map((metric, index) => ({
    id: metric.date,
    day: new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(new Date(`${metric.date}T12:00:00`)),
    date: new Intl.DateTimeFormat("en-IN", { day: "numeric" }).format(new Date(`${metric.date}T12:00:00`)),
    isToday: index === petMetrics.length - 1,
  }));
  const deviceStatus = isConnecting || isRefreshing ? "syncing" : hasLiveBluetoothSession ? (band?.supportsBattery && (band.battery ?? 100) <= 20 ? "low-battery" : "connected") : "disconnected";
  const hasLiveHeartRate = hasLiveBluetoothSession && typeof band?.liveHeartRate === "number";
  const metrics: HealthBandMetricCard[] = selectedMetric ? [
    { id: "activity", label: "Active time", value: selectedMetric.activeMinutes, unit: "min", detail: "Daily movement summary", progress: Math.min(100, Math.round(selectedMetric.activeMinutes / 60 * 100)), icon: Activity, tone: "teal" },
    { id: "steps", label: "Movement", value: selectedMetric.steps.toLocaleString("en-IN"), unit: "steps", detail: `${selectedMetric.distanceKm} km estimated`, progress: Math.min(100, Math.round(selectedMetric.steps / 6500 * 100)), icon: Footprints, tone: "sky" },
    hasLiveHeartRate
      ? { id: "live-pulse", label: "Live heart rate", value: band!.liveHeartRate!, unit: "bpm", detail: "Standard BLE reading", icon: HeartPulse, tone: "rose" }
      : { id: "pulse", label: "Resting pulse", value: selectedMetric.averageRestingPulse ?? "—", unit: selectedMetric.averageRestingPulse ? "bpm" : undefined, detail: "Historical summary only", icon: HeartPulse, tone: "rose" },
    { id: "rest", label: "Rest time", value: formatDuration(selectedMetric.restMinutes), detail: selectedMetric.temperatureTrend === "Baseline" ? "Temperature trend: baseline" : selectedMetric.temperatureTrend, icon: Clock3, tone: "violet" },
  ] : [];
  const selectedDate = selectedMetric?.date;
  const dayHabits = habits.filter((habit) => habit.petId === selectedPet.id && habit.timestamp.slice(0, 10) === selectedDate);
  const habitCards: HealthBandHabitCard[] = dayHabits.map((habit) => {
    const target = habit.kind === "WALK" || habit.kind === "PLAY" || habit.kind === "REST" ? 30 : 1;
    return { id: habit.id, label: habit.label, detail: `${habit.source === "BAND" ? "Band" : "Logged by you"} · ${new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(new Date(habit.timestamp))}`, completed: habit.durationMinutes ?? 1, target, tone: habit.kind === "MEAL" || habit.kind === "WATER" ? "amber" : habit.kind === "REST" ? "violet" : "teal", icon: habit.kind === "MEAL" ? Smartphone : habit.kind === "WALK" || habit.kind === "PLAY" ? Footprints : Clock3 };
  });
  const alerts: HealthBandAlertCard[] = bandAlerts.filter((alert) => alert.petId === selectedPet.id && alert.status === "OPEN").map((alert) => ({ id: alert.id, severity: alert.priority === "ATTENTION" ? "attention" : "info", title: alert.title, description: alert.description, time: new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(new Date(alert.createdAt)), actionLabel: "Mark reviewed" }));
  const activity = petMetrics.slice(-7).map((metric) => ({ label: compactDate(metric.date), steps: metric.steps, activeMinutes: metric.activeMinutes }));
  const sleep = selectedMetric ? {
    duration: formatDuration(selectedMetric.sleepMinutes), score: selectedMetric.sleepQuality,
    bedtime: "Overnight estimate", wakeTime: "Band summary",
    stages: [
      { id: "restful", label: "Restful", minutes: Math.round(selectedMetric.sleepMinutes * 0.33), color: "#0f766e" },
      { id: "light", label: "Light", minutes: Math.round(selectedMetric.sleepMinutes * 0.47), color: "#5eead4" },
      { id: "wake", label: "Awake", minutes: Math.max(0, 720 - selectedMetric.sleepMinutes), color: "#a5b4fc" },
    ],
  } : { duration: "No data", stages: [] };

  return <WorkspaceShell title="Health Band" subtitle="Connect compatible devices and record consented routes with clear limits." actions={<button className="btn-primary" onClick={() => setShowHabitForm(true)}><Plus size={16}/> Log habit</button>}>
    <div className="space-y-6">
      <section className="surface overflow-hidden"><div className="grid gap-5 bg-gradient-to-br from-mint via-white to-sky p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-center"><div><span className="eyebrow bg-white"><Watch size={14}/> Connected wellness</span><h1 className="mt-4 text-3xl font-black tracking-[-.04em] text-ink">A more real view of {selectedPet.name}&apos;s day.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Connect a compatible Bluetooth Low Energy band from this browser, then start GPS tracking only when this phone is travelling with {selectedPet.name}. Readings are wellbeing context, never a diagnosis.</p></div><div className="min-w-[13rem]"><label className="field-label" htmlFor="band-pet">Viewing companion</label><div className="relative"><select id="band-pet" className="field appearance-none pr-10 font-bold" value={selectedPet.id} onChange={(event) => { setSelectedPetId(event.target.value); setSelectedDayId(""); }}><>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} · {pet.species}</option>)}</></select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={18}/></div></div></div></section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]"><div className="surface border-teal-100 bg-teal-50/55 p-5 sm:p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-teal-700 shadow-sm"><Bluetooth size={20}/></span><div><p className="eyebrow bg-white">Real Bluetooth pairing</p><h2 className="mt-3 text-xl font-black text-ink">Browser-authorized BLE only</h2><p className="mt-2 text-sm leading-6 text-slate-600">{support.message} The browser can read the standard Battery and Heart Rate services only when the chosen band exposes them. It cannot unlock private activity, sleep or GPS data from a vendor-locked watch.</p></div></div></div><aside className="surface p-5 sm:p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky text-sky-800"><Radio size={19}/></span><div><h2 className="font-black text-ink">Using an Apple Watch or branded watch?</h2><p className="mt-2 text-sm leading-6 text-slate-600">Apple Watch, Fitbit, Garmin, Wear OS and similar devices usually require that manufacturer&apos;s approved app, OAuth API, or a native mobile companion. A generic website cannot bypass those protections.</p></div></div></aside></section>

      <PetHealthBandOverview
        petName={selectedPet.name}
        description={isRealBand ? "Live browser pairing is active only while this tab has an authorized BLE session. Historical charts are retained separately so you can distinguish them from current readings." : "The existing dashboard summary is historical local data. Use Connect a real BLE band to replace the mock pairing with a browser-authorized device."}
        device={{ name: isRealBand ? (band?.name ?? "Bluetooth health band") : "Connect a real Bluetooth band", model: isRealBand ? `${band?.model ?? "Bluetooth Low Energy"} · ${hasLiveBluetoothSession ? "active browser session" : "session required"}` : "Standard BLE Battery / Heart Rate services", status: deviceStatus, batteryLevel: isRealBand && band?.supportsBattery ? band.battery : undefined, lastSynced: hasLiveBluetoothSession ? liveReadingText(band?.lastLiveReading) : "No active browser session", firmwareVersion: isRealBand ? `Capabilities: ${band?.supportsBattery ? "Battery" : "No battery"}${band?.supportsHeartRate ? " · Heart rate" : ""}` : "Your browser chooses the device" }}
        days={days}
        selectedDayId={selectedMetric?.date}
        onDayChange={(day) => setSelectedDayId(day.id)}
        metrics={metrics}
        activity={activity}
        stepGoal={selectedPet.species === "Dog" ? 6500 : 2600}
        sleep={sleep}
        habits={habitCards}
        alerts={alerts}
        onConnect={() => void connectRealBand()}
        onSync={() => void refreshRealBand()}
        connectLabel={isConnecting ? "Connecting…" : "Connect a real BLE band"}
        syncLabel={isRefreshing ? "Refreshing…" : "Refresh live data"}
        onHabitClick={() => setShowHabitForm(true)}
        onAlertAction={(alert) => markBandAlertRead(alert.id)}
        onViewAllAlerts={() => setShowHistory(true)}
      />

      {connectionNotice ? <p className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm leading-6 text-teal-950" role="status">{connectionNotice}</p> : null}

      {isRealBand ? <section className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-700"><Bluetooth size={19}/></span><div><h2 className="font-black text-ink">Bluetooth session control</h2><p className="mt-1 text-sm leading-6 text-slate-600">A browser Bluetooth connection is intentionally limited to this browser session. Reconnect after closing or refreshing the page.</p></div></div><button className="btn-ghost shrink-0 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={disconnectRealBand}>Disconnect band</button></section> : null}

      <PetRouteMap petName={selectedPet.name} points={routePoints} tracking={gpsTracking} message={gpsMessage} onStartTracking={startGpsTracking} onStopTracking={stopGpsTracking} onClearRoute={() => { clearLocationPoints(selectedPet.id); setGpsMessage("Saved GPS route cleared from this browser workspace."); }} />

      <section className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        <div className="surface p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="eyebrow"><CalendarDays size={14}/> Recent summaries</p><h2 className="mt-3 text-xl font-black tracking-[-.03em] text-ink">Seven-day wellness history</h2></div><button className="btn-ghost" onClick={() => setShowHistory((value) => !value)}>{showHistory ? "Hide history" : "View history"}</button></div>{showHistory && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[38rem] text-left text-sm"><thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3 font-bold">Day</th><th className="pb-3 font-bold">Movement</th><th className="pb-3 font-bold">Active</th><th className="pb-3 font-bold">Sleep</th><th className="pb-3 font-bold">Trend</th></tr></thead><tbody>{petMetrics.slice(-7).reverse().map((metric) => <tr key={metric.id} className="border-b border-slate-50 last:border-0"><td className="py-3 font-bold text-ink">{compactDate(metric.date)}</td><td className="py-3 text-slate-600">{metric.steps.toLocaleString("en-IN")} steps</td><td className="py-3 text-slate-600">{metric.activeMinutes} min</td><td className="py-3 text-slate-600">{formatDuration(metric.sleepMinutes)}</td><td className="py-3"><span className="status-pill bg-mint text-moss">{metric.temperatureTrend}</span></td></tr>)}</tbody></table></div>}{!showHistory && <p className="mt-4 text-sm leading-6 text-slate-600">These are lightweight summaries for context. Compare patterns with {selectedPet.name}&apos;s usual routine and discuss sudden changes with a veterinarian.</p>}</div>
        <aside className="surface bg-[#fcfaf4] p-5 sm:p-6"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-[#fff1cf] text-[#9a6700]"><ShieldCheck size={19}/></span><div><h2 className="font-black text-ink">Useful, not clinical</h2><p className="mt-2 text-sm leading-6 text-slate-600">Fit a band comfortably, charge it regularly, and compare factual changes with {selectedPet.name}&apos;s normal routine. If you notice illness, distress, sudden changes, or are worried, contact a veterinarian.</p><Link href="/veterinarians" className="mt-4 btn-secondary"><AlertCircle size={16}/> Find a veterinarian</Link></div></div></aside>
      </section>
    </div>
    {showHabitForm && <HabitModal petName={selectedPet.name} onClose={() => setShowHabitForm(false)} onSave={(value) => { addHabit({ petId: selectedPet.id, ...value }); setShowHabitForm(false); }} />}
  </WorkspaceShell>;
}

function HabitModal({ petName, onClose, onSave }: { petName: string; onClose: () => void; onSave: (value: { kind: HabitKind; label: string; durationMinutes?: number }) => void }) {
  const [kind, setKind] = useState<HabitKind>("WALK");
  const [error, setError] = useState("");
  const selected = habitOptions.find((option) => option.value === kind);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const label = String(form.get("label") ?? "").trim();
    const duration = Number(form.get("duration"));
    if (!label) { setError("Add a short description for this habit."); return; }
    if (selected?.needsDuration && (!Number.isFinite(duration) || duration < 1)) { setError("Add a duration of at least one minute."); return; }
    onSave({ kind, label, durationMinutes: selected?.needsDuration ? duration : undefined });
  }
  return <div className="fixed inset-0 z-[70] flex items-end bg-slate-950/45 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-labelledby="habit-title"><button className="absolute inset-0" onClick={onClose} aria-label="Close habit form"/><form className="relative w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onSubmit={submit}><div className="flex items-start justify-between gap-4"><div><h2 id="habit-title" className="text-xl font-black text-ink">Log a habit for {petName}</h2><p className="mt-1 text-sm text-slate-600">Small, factual notes make the timeline more useful.</p></div><button type="button" className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close"><X size={19}/></button></div><div className="mt-6 grid gap-4"><div><label className="field-label" htmlFor="habit-kind">Habit</label><select id="habit-kind" className="field" value={kind} onChange={(event) => setKind(event.target.value as HabitKind)}>{habitOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div><div><label className="field-label" htmlFor="habit-label">What happened?</label><input id="habit-label" name="label" className="field" defaultValue={selected?.label} placeholder="e.g. Evening neighbourhood walk" required/></div>{selected?.needsDuration && <div><label className="field-label" htmlFor="habit-duration">Duration (minutes)</label><input id="habit-duration" name="duration" className="field" type="number" min="1" step="1" defaultValue="20" required/></div>}<p className="rounded-xl bg-mint/60 p-3 text-xs leading-5 text-slate-600"><CheckCircle2 className="mr-1.5 inline text-moss" size={15}/>This entry stays in the local timeline. It is an observation, not medical advice.</p>{error && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button className="btn-secondary" type="button" onClick={onClose}>Cancel</button><button className="btn-primary" type="submit">Save habit</button></div></div></form></div>;
}
