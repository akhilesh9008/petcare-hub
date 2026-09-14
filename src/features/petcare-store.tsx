"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BandAlert, BandDailyMetric, ChatMessage, demoUser, HealthBand, HealthRecord, HabitKind, HabitSource, initialAppointments, initialBandAlerts, initialBandMetrics, initialBands, initialBookings, initialHabits, initialMedications, initialOrders, initialPets, initialProducts, initialProviders, initialRecords, initialReminders, initialVaccinations, initialVets, initialWeights, Medication, Order, Pet, PetHabit, PetInsightState, PetLocationPoint, Reminder, Role, ServiceBooking, Vaccination, WeightRecord, Appointment, CartItem, Product,
} from "@/features/demo-data";
import { buildPetAssistantResponse, buildPetContext } from "@/lib/pet-digital-twin";

export interface PetcareState {
  pets: Pet[];
  records: HealthRecord[];
  vaccinations: Vaccination[];
  medications: Medication[];
  weights: WeightRecord[];
  reminders: Reminder[];
  appointments: Appointment[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  bookings: ServiceBooking[];
  conversations: Record<string, ChatMessage[]>;
  bands: HealthBand[];
  bandMetrics: BandDailyMetric[];
  habits: PetHabit[];
  bandAlerts: BandAlert[];
  locationPoints: PetLocationPoint[];
  insightStates: PetInsightState[];
}

export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: Role;
}

interface Store extends PetcareState {
  hydrated: boolean;
  user: WorkspaceUser;
  products: Product[];
  vets: typeof initialVets;
  providers: typeof initialProviders;
  addPet: (pet: Omit<Pet, "id">) => string;
  updatePet: (id: string, patch: Partial<Pet>) => void;
  addRecord: (record: Omit<HealthRecord, "id">) => void;
  updateRecord: (id: string, patch: Partial<HealthRecord>) => void;
  deleteRecord: (id: string) => void;
  addVaccination: (vaccination: Omit<Vaccination, "id">) => void;
  updateVaccination: (id: string, patch: Partial<Vaccination>) => void;
  deleteVaccination: (id: string) => void;
  addMedication: (medication: Omit<Medication, "id">) => void;
  updateMedication: (id: string, patch: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  addWeight: (record: Omit<WeightRecord, "id">) => void;
  deleteWeight: (id: string) => void;
  addReminder: (reminder: Omit<Reminder, "id" | "status">) => void;
  toggleReminder: (id: string) => void;
  bookAppointment: (appointment: Omit<Appointment, "id" | "status">) => void;
  updateAppointmentStatus: (id: string, status: Appointment["status"]) => void;
  setConsultationNotes: (id: string, notes: string) => void;
  addToCart: (productId: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (address: string, petId?: string) => Order;
  bookService: (booking: Omit<ServiceBooking, "id" | "status">) => void;
  updateServiceBookingStatus: (id: string, status: ServiceBooking["status"]) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  saveBluetoothBand: (input: { petId: string; deviceId: string; name: string; batteryLevel?: number; supportsBattery: boolean; supportsHeartRate: boolean; heartRate?: number; readAt?: string }) => void;
  updateBluetoothBandReading: (input: { petId: string; batteryLevel?: number; heartRate?: number; readAt?: string }) => void;
  pairBand: (petId: string) => void;
  syncBand: (petId: string) => Promise<void>;
  disconnectBand: (petId: string) => void;
  addHabit: (habit: { petId: string; kind: HabitKind; label: string; durationMinutes?: number; timestamp?: string; source?: HabitSource }) => void;
  markBandAlertRead: (id: string) => void;
  addLocationPoint: (point: Omit<PetLocationPoint, "id">) => void;
  clearLocationPoints: (petId: string) => void;
  dismissInsight: (petId: string, insightId: string) => void;
  snoozeInsight: (petId: string, insightId: string, until?: string) => void;
  sendMessage: (petId: string, text: string) => void;
  clearConversation: (petId: string) => void;
}

const StoreContext = createContext<Store | null>(null);
const legacyDemoStorageKey = "petcare-hub-demo-state-v2";
const roles: Role[] = ["PET_OWNER", "VETERINARIAN", "SERVICE_PROVIDER", "ADMIN"];

const initialState: PetcareState = {
  pets: initialPets,
  records: initialRecords,
  vaccinations: initialVaccinations,
  medications: initialMedications,
  weights: initialWeights,
  reminders: initialReminders,
  appointments: initialAppointments,
  products: initialProducts,
  cart: [{ productId: "prod-1", quantity: 1 }],
  orders: initialOrders,
  bookings: initialBookings,
  conversations: {},
  bands: initialBands,
  bandMetrics: initialBandMetrics,
  habits: initialHabits,
  bandAlerts: initialBandAlerts,
  locationPoints: [],
  insightStates: [],
};

function createEmptyState(): PetcareState {
  return {
    pets: [], records: [], vaccinations: [], medications: [], weights: [], reminders: [], appointments: [],
    products: initialProducts, cart: [], orders: [], bookings: [], conversations: {}, bands: [], bandMetrics: [], habits: [], bandAlerts: [], locationPoints: [], insightStates: [],
  };
}

function workspaceStorageKey(userId: string) {
  return `petcare-hub-workspace-v3:${userId}`;
}

function isDemoWorkspace(user: WorkspaceUser) {
  return [
    demoUser.email,
    "meera@petcare.demo",
    "aarav@petcare.demo",
    "kavya@petcare.demo",
    "paws@petcare.demo",
    "admin@petcare.demo",
  ].some((email) => user.email.toLowerCase() === email.toLowerCase());
}

function normalizeUser(value: unknown): WorkspaceUser | undefined {
  if (!value || typeof value !== "object") return undefined;
  const candidate = value as Record<string, unknown>;
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string" || typeof candidate.email !== "string" || typeof candidate.role !== "string" || !roles.includes(candidate.role as Role)) return undefined;
  return {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    phone: typeof candidate.phone === "string" ? candidate.phone : undefined,
    city: typeof candidate.city === "string" ? candidate.city : undefined,
    role: candidate.role as Role,
  };
}

function restoreState(fallback: PetcareState, value: unknown): PetcareState {
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<PetcareState>;
  return {
    ...fallback,
    ...candidate,
    pets: Array.isArray(candidate.pets) ? candidate.pets : fallback.pets,
    records: Array.isArray(candidate.records) ? candidate.records : fallback.records,
    vaccinations: Array.isArray(candidate.vaccinations) ? candidate.vaccinations : fallback.vaccinations,
    medications: Array.isArray(candidate.medications) ? candidate.medications : fallback.medications,
    weights: Array.isArray(candidate.weights) ? candidate.weights : fallback.weights,
    reminders: Array.isArray(candidate.reminders) ? candidate.reminders : fallback.reminders,
    appointments: Array.isArray(candidate.appointments) ? candidate.appointments : fallback.appointments,
    products: Array.isArray(candidate.products) ? candidate.products : fallback.products,
    cart: Array.isArray(candidate.cart) ? candidate.cart : fallback.cart,
    orders: Array.isArray(candidate.orders) ? candidate.orders : fallback.orders,
    bookings: Array.isArray(candidate.bookings) ? candidate.bookings : fallback.bookings,
    conversations: candidate.conversations && typeof candidate.conversations === "object" ? candidate.conversations : fallback.conversations,
    bands: Array.isArray(candidate.bands) ? candidate.bands : fallback.bands,
    bandMetrics: Array.isArray(candidate.bandMetrics) ? candidate.bandMetrics : fallback.bandMetrics,
    habits: Array.isArray(candidate.habits) ? candidate.habits : fallback.habits,
    bandAlerts: Array.isArray(candidate.bandAlerts) ? candidate.bandAlerts : fallback.bandAlerts,
    locationPoints: Array.isArray(candidate.locationPoints) ? candidate.locationPoints : fallback.locationPoints,
    insightStates: Array.isArray(candidate.insightStates) ? candidate.insightStates : fallback.insightStates,
  };
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function assistantReply(text: string, pet: Pet | undefined, state: PetcareState): string {
  const lower = text.toLowerCase();
  const name = pet?.name ?? "your pet";
  const petId = pet?.id;
  const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const records = state.records.filter((item) => item.petId === petId).sort((left, right) => right.date.localeCompare(left.date));
  const medicationsForPet = state.medications.filter((item) => item.petId === petId).sort((left, right) => right.startDate.localeCompare(left.startDate));
  const reminders = state.reminders.filter((item) => item.petId === petId && item.status !== "DONE").sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const appointments = state.appointments.filter((item) => item.petId === petId && ["PENDING", "CONFIRMED"].includes(item.status)).sort((left, right) => `${left.date}${left.time}`.localeCompare(`${right.date}${right.time}`));
  const metrics = state.bandMetrics.filter((item) => item.petId === petId).sort((left, right) => left.date.localeCompare(right.date));

  if (/collapse|seizure|poison|unable to urinate|repeated vomiting|trouble breathing|breath/.test(lower) || lower.includes("emergency")) {
    return `I’m sorry ${name} may be unwell. I cannot diagnose the cause. Please contact a veterinarian or emergency veterinary service now for severe, sudden, or worsening symptoms—especially breathing trouble, collapse, repeated vomiting, seizures, toxin exposure, or inability to urinate. While you arrange care, open Emergency mode to keep ${name}’s allergies, medications, microchip and timeline ready to share.`;
  }
  if (lower.includes("band") || lower.includes("sleep") || lower.includes("activity") || lower.includes("habit") || lower.includes("trend")) {
    const latest = metrics.at(-1);
    const previous = metrics.at(-2);
    if (!latest) return `${name} does not have health-band data recorded yet. Pair a Care Band from Health Band, then use its activity, rest and habit history as wellbeing context—not a diagnosis.`;
    const shift = previous ? latest.activeMinutes - previous.activeMinutes : 0;
    const activity = previous ? `${Math.abs(shift)} minutes ${shift >= 0 ? "more" : "less"} active than the previous recorded day` : `${latest.activeMinutes} active minutes recorded`;
    return `${name}'s latest wearable summary for ${formatDate(latest.date)} shows ${activity}, ${latest.sleepMinutes} minutes of tracked sleep, and a ${latest.temperatureTrend.toLowerCase()} temperature pattern. This is a trend to notice, not a diagnosis. If it continues alongside behavioural or appetite changes, note it for a veterinarian.`;
  }
  if (lower.includes("vet") || lower.includes("appointment") || lower.includes("prepare") || lower.includes("visit")) {
    const nextAppointment = appointments[0];
    const latestRecord = records[0];
    const appointmentLine = nextAppointment ? `Your next recorded appointment is ${formatDate(nextAppointment.date)} at ${nextAppointment.time} for ${nextAppointment.reason}.` : "There is no upcoming appointment recorded.";
    const historyLine = latestRecord ? `Bring up the latest record: ${latestRecord.reason} on ${formatDate(latestRecord.date)}.` : "Bring any recent observations you have logged.";
    const allergyLine = pet?.allergies.length ? `Mention recorded allergies: ${pet.allergies.join(", ")}.` : "Confirm whether there are any new allergies or reactions.";
    const medicationLine = medicationsForPet.length ? `Confirm the current medication list: ${medicationsForPet.map((item) => item.name).join(", ")}.` : "Ask whether any medicines or supplements should be reviewed.";
    return `${appointmentLine} ${historyLine} ${allergyLine} ${medicationLine} Useful questions: what changes should I watch for, when is follow-up needed, and which passport records should be updated after the visit?`;
  }
  if (lower.includes("remind") || lower.includes("calendar") || lower.includes("care plan")) {
    const next = reminders[0];
    return next ? `${name}'s next open care task is “${next.title}” on ${formatDate(next.date)}${next.time ? ` at ${next.time}` : ""}. The care calendar combines vaccinations, medication, grooming and appointments so nothing is tracked in separate places.` : `${name} has no open reminders right now. Add a care task or update records to create automatic medication, vaccination and appointment reminders.`;
  }
  if (lower.includes("passport")) {
    const latestRecord = records[0];
    return `${name}'s health passport has ${records.length} health record${records.length === 1 ? "" : "s"}, ${state.vaccinations.filter((item) => item.petId === petId).length} vaccination record${state.vaccinations.filter((item) => item.petId === petId).length === 1 ? "" : "s"}, and ${reminders.length} open care task${reminders.length === 1 ? "" : "s"}. ${latestRecord ? `The latest entry is ${latestRecord.reason} on ${formatDate(latestRecord.date)}.` : "Add the first health entry in the Health workspace."} This is a record-based summary, not a clinical assessment.`;
  }
  if (lower.includes("food") || lower.includes("eat") || lower.includes("product") || lower.includes("recommend")) {
    const allergies = new Set((pet?.allergies ?? []).map((item) => item.toLowerCase()));
    const recommendations = state.products
      .filter((product) => pet && product.species.includes(pet.species))
      .filter((product) => !product.tags.some((tag) => allergies.has(tag.toLowerCase())))
      .slice(0, 3)
      .map((product) => product.name);
    return recommendations.length
      ? `For ${name}, profile-aware non-prescription options include ${recommendations.join(", ")}. I filtered by species and checked stored allergy tags, but always verify the full ingredient list. Ask a veterinarian before changing a diet for a medical reason.`
      : `I don't have a suitable profile-aware product match for ${name} yet. Add species, activity and dietary preferences to the passport, then check ingredients against known allergies.`;
  }
  if (lower.includes("vaccin")) {
    const next = state.vaccinations.filter((item) => item.petId === pet?.id).sort((a, b) => a.nextDue.localeCompare(b.nextDue))[0];
    return next ? `${name}'s next recorded vaccination is ${next.name}, due ${new Date(`${next.nextDue}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}. I can help you prepare questions for the appointment, but your veterinarian should confirm the schedule.` : `I couldn't find an upcoming vaccination record for ${name}. You can add one in Health, or ask your veterinarian to review the record.`;
  }
  if (lower.includes("record") || lower.includes("summary") || lower.includes("health")) {
    const latest = state.records.filter((item) => item.petId === pet?.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    return latest ? `${name}'s latest record is from ${new Date(`${latest.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: ${latest.reason}. The note says: “${latest.diagnosis}” I can explain it in plain language, but it is not a diagnosis.` : `I don't see a health record for ${name} yet. You can add one from the Health page.`;
  }
  if (lower.includes("scratch") || lower.includes("vomit") || lower.includes("pain") || lower.includes("emergency") || lower.includes("breath")) {
    return `I'm sorry ${name} is uncomfortable. I can't diagnose the cause. Please contact a veterinarian promptly—especially if symptoms are severe, sudden, worsening, or include breathing trouble, collapse, repeated vomiting, or inability to urinate. While you arrange care, note when it started, frequency, new foods/products, and any visible changes.`;
  }
  if (lower.includes("food") || lower.includes("eat")) {
    const recommendations = state.products.filter((product) => pet && product.species.includes(pet.species)).slice(0, 3).map((product) => product.name).join(", ");
    return `For ${name}, I can point you to non-prescription product categories based on the profile: ${recommendations}. Please check ingredients against known allergies and ask your veterinarian before making a diet change for a medical reason.`;
  }
  return `Thanks for sharing that about ${name}. I can provide general pet-care education and help prepare questions for a veterinarian. Could you tell me when you first noticed this, whether it is changing, and how ${name}'s appetite, energy, and bathroom habits are? PetCare AI is not a substitute for professional veterinary care.`;
}

export function PetcareProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PetcareState>(initialState);
  const [user, setUser] = useState<WorkspaceUser>(demoUser);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function hydrateWorkspace() {
      let nextUser: WorkspaceUser = demoUser;
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json() as { data?: { user?: unknown } };
          nextUser = normalizeUser(payload.data?.user) ?? demoUser;
        }
      } catch {
        // Public pages and offline local work can still render the demo shell.
      }

      let nextState = isDemoWorkspace(nextUser) ? initialState : createEmptyState();
      try {
        const saved = window.localStorage.getItem(workspaceStorageKey(nextUser.id))
          ?? (isDemoWorkspace(nextUser) ? window.localStorage.getItem(legacyDemoStorageKey) : null);
        if (saved) nextState = restoreState(nextState, JSON.parse(saved));
      } catch {
        // A fresh workspace is safer than failing the application when local storage is unavailable.
      }

      if (!cancelled) {
        setUser(nextUser);
        setState(nextState);
        setHydrated(true);
      }
    }
    void hydrateWorkspace();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(workspaceStorageKey(user.id), JSON.stringify(state));
    } catch {
      // Photos and records remain usable in memory if browser storage is full.
    }
  }, [hydrated, state, user.id]);

  const addPet = useCallback((pet: Omit<Pet, "id">) => {
    const id = createId("pet");
    setState((previous) => ({ ...previous, pets: [...previous.pets, { ...pet, id }] }));
    return id;
  }, []);
  const updatePet = useCallback((id: string, patch: Partial<Pet>) => setState((previous) => ({ ...previous, pets: previous.pets.map((pet) => pet.id === id ? { ...pet, ...patch } : pet) })), []);
  const addRecord = useCallback((record: Omit<HealthRecord, "id">) => setState((previous) => ({ ...previous, records: [{ ...record, id: createId("record") }, ...previous.records] })), []);
  const updateRecord = useCallback((id: string, patch: Partial<HealthRecord>) => setState((previous) => ({ ...previous, records: previous.records.map((record) => record.id === id ? { ...record, ...patch, id } : record) })), []);
  const deleteRecord = useCallback((id: string) => setState((previous) => ({ ...previous, records: previous.records.filter((record) => record.id !== id) })), []);
  const addVaccination = useCallback((vaccination: Omit<Vaccination, "id">) => setState((previous) => {
    const id = createId("vac");
    const item = { ...vaccination, id };
    const reminder: Reminder | undefined = vaccination.nextDue ? { id: createId("rem"), petId: vaccination.petId, title: `${vaccination.name} vaccination`, description: `Automatically created from ${vaccination.name}'s next due date.`, date: vaccination.nextDue, time: "10:00", type: "Vaccination", recurring: false, status: "PENDING" } : undefined;
    return { ...previous, vaccinations: [item, ...previous.vaccinations], reminders: reminder ? [reminder, ...previous.reminders] : previous.reminders };
  }), []);
  const updateVaccination = useCallback((id: string, patch: Partial<Vaccination>) => setState((previous) => ({ ...previous, vaccinations: previous.vaccinations.map((item) => item.id === id ? { ...item, ...patch, id } : item) })), []);
  const deleteVaccination = useCallback((id: string) => setState((previous) => ({ ...previous, vaccinations: previous.vaccinations.filter((item) => item.id !== id) })), []);
  const addMedication = useCallback((medication: Omit<Medication, "id">) => setState((previous) => {
    const id = createId("med");
    const item = { ...medication, id };
    const reminder: Reminder | undefined = medication.endDate ? { id: createId("rem"), petId: medication.petId, title: `${medication.name} course ends`, description: "Automatically created from the medication end date. Confirm next steps with the prescribing veterinarian.", date: medication.endDate, time: "09:00", type: "Medication", recurring: false, status: "PENDING" } : undefined;
    return { ...previous, medications: [item, ...previous.medications], reminders: reminder ? [reminder, ...previous.reminders] : previous.reminders };
  }), []);
  const updateMedication = useCallback((id: string, patch: Partial<Medication>) => setState((previous) => ({ ...previous, medications: previous.medications.map((item) => item.id === id ? { ...item, ...patch, id } : item) })), []);
  const deleteMedication = useCallback((id: string) => setState((previous) => ({ ...previous, medications: previous.medications.filter((item) => item.id !== id) })), []);
  const addWeight = useCallback((record: Omit<WeightRecord, "id">) => setState((previous) => ({ ...previous, weights: [...previous.weights, { ...record, id: createId("weight") }] })), []);
  const deleteWeight = useCallback((id: string) => setState((previous) => ({ ...previous, weights: previous.weights.filter((item) => item.id !== id) })), []);
  const addReminder = useCallback((reminder: Omit<Reminder, "id" | "status">) => setState((previous) => ({ ...previous, reminders: [...previous.reminders, { ...reminder, id: createId("rem"), status: "PENDING" }] })), []);
  const toggleReminder = useCallback((id: string) => setState((previous) => ({ ...previous, reminders: previous.reminders.map((reminder) => reminder.id === id ? { ...reminder, status: reminder.status === "DONE" ? "PENDING" : "DONE" } : reminder) })), []);
  const bookAppointment = useCallback((appointment: Omit<Appointment, "id" | "status">) => setState((previous) => {
    const id = createId("appt");
    const date = new Date(`${appointment.date}T12:00:00`); date.setDate(date.getDate() - 1);
    const reminder: Reminder = { id: createId("rem"), petId: appointment.petId, title: "Veterinary appointment tomorrow", description: `${appointment.reason} at ${appointment.time}.`, date: date.toISOString().slice(0, 10), time: appointment.time, type: "Appointment", recurring: false, status: "PENDING" };
    return { ...previous, appointments: [{ ...appointment, id, status: "PENDING" }, ...previous.appointments], reminders: [reminder, ...previous.reminders] };
  }), []);
  const updateAppointmentStatus = useCallback((id: string, status: Appointment["status"]) => setState((previous) => ({ ...previous, appointments: previous.appointments.map((appointment) => appointment.id === id ? { ...appointment, status } : appointment) })), []);
  const setConsultationNotes = useCallback((id: string, notes: string) => setState((previous) => ({ ...previous, appointments: previous.appointments.map((appointment) => appointment.id === id ? { ...appointment, consultationNotes: notes } : appointment) })), []);
  const addToCart = useCallback((productId: string) => setState((previous) => {
    const exists = previous.cart.find((item) => item.productId === productId);
    return { ...previous, cart: exists ? previous.cart.map((item) => item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item) : [...previous.cart, { productId, quantity: 1 }] };
  }), []);
  const setCartQuantity = useCallback((productId: string, quantity: number) => setState((previous) => ({ ...previous, cart: quantity <= 0 ? previous.cart.filter((item) => item.productId !== productId) : previous.cart.map((item) => item.productId === productId ? { ...item, quantity } : item) })), []);
  const clearCart = useCallback(() => setState((previous) => ({ ...previous, cart: [] })), []);
  const checkout = useCallback((address: string, petId?: string) => {
    let order: Order = { id: createId("order"), number: `PCH-${Math.floor(10000 + Math.random() * 89999)}`, date: new Date().toISOString().slice(0, 10), items: [], total: 0, status: "PLACED", address, petId };
    setState((previous) => {
      const subtotal = previous.cart.reduce((sum, item) => sum + (previous.products.find((product) => product.id === item.productId)?.price ?? 0) * item.quantity, 0);
      order = { ...order, items: previous.cart, total: subtotal + (subtotal >= 999 ? 0 : 99) };
      return { ...previous, orders: [order, ...previous.orders], cart: [] };
    });
    return order;
  }, []);
  const bookService = useCallback((booking: Omit<ServiceBooking, "id" | "status">) => setState((previous) => ({ ...previous, bookings: [{ ...booking, id: createId("booking"), status: "PENDING" }, ...previous.bookings] })), []);
  const updateServiceBookingStatus = useCallback((id: string, status: ServiceBooking["status"]) => setState((previous) => ({ ...previous, bookings: previous.bookings.map((booking) => booking.id === id ? { ...booking, status } : booking) })), []);
  const updateOrderStatus = useCallback((id: string, status: Order["status"]) => setState((previous) => ({ ...previous, orders: previous.orders.map((order) => order.id === id ? { ...order, status } : order) })), []);
  const updateProduct = useCallback((id: string, patch: Partial<Product>) => setState((previous) => ({ ...previous, products: previous.products.map((product) => product.id === id ? { ...product, ...patch, id } : product) })), []);
  const saveBluetoothBand = useCallback((input: { petId: string; deviceId: string; name: string; batteryLevel?: number; supportsBattery: boolean; supportsHeartRate: boolean; heartRate?: number; readAt?: string }) => setState((previous) => {
    const existing = previous.bands.find((band) => band.petId === input.petId);
    const now = input.readAt ?? new Date().toISOString();
    const band: HealthBand = {
      id: existing?.id ?? createId("band"),
      petId: input.petId,
      name: input.name,
      model: "Bluetooth Low Energy",
      serialNumber: "Browser-authorized BLE device",
      status: "CONNECTED",
      battery: input.batteryLevel ?? existing?.battery ?? 0,
      pairedAt: existing?.pairedAt ?? now,
      lastSynced: now,
      connectionType: "BLUETOOTH_LE",
      bluetoothDeviceId: input.deviceId,
      supportsBattery: input.supportsBattery,
      supportsHeartRate: input.supportsHeartRate,
      liveHeartRate: input.heartRate,
      lastLiveReading: now,
    };
    return { ...previous, bands: existing ? previous.bands.map((candidate) => candidate.petId === input.petId ? band : candidate) : [...previous.bands, band] };
  }), []);
  const updateBluetoothBandReading = useCallback((input: { petId: string; batteryLevel?: number; heartRate?: number; readAt?: string }) => setState((previous) => {
    const now = input.readAt ?? new Date().toISOString();
    return {
      ...previous,
      bands: previous.bands.map((band) => band.petId === input.petId && band.connectionType === "BLUETOOTH_LE" ? {
        ...band,
        status: "CONNECTED",
        battery: input.batteryLevel ?? band.battery,
        liveHeartRate: input.heartRate ?? band.liveHeartRate,
        lastLiveReading: now,
        lastSynced: now,
      } : band),
    };
  }), []);
  const pairBand = useCallback((petId: string) => setState((previous) => {
    const existing = previous.bands.find((band) => band.petId === petId);
    const now = new Date().toISOString();
    if (existing) {
      return { ...previous, bands: previous.bands.map((band) => band.petId === petId ? { ...band, status: "CONNECTED", battery: Math.max(band.battery, 65), pairedAt: band.pairedAt ?? now } : band) };
    }
    const pet = previous.pets.find((item) => item.id === petId);
    return {
      ...previous,
      bands: [...previous.bands, {
        id: createId("band"), petId, name: `${pet?.name ?? "Pet"}'s Care Band`, model: "PetCare Halo", serialNumber: `PCH-HL-${Math.floor(10000 + Math.random() * 89999)}`,
        status: "CONNECTED", battery: 100, pairedAt: now,
      }],
    };
  }), []);
  const syncBand = useCallback(async (petId: string) => {
    setState((previous) => ({ ...previous, bands: previous.bands.map((band) => band.petId === petId ? { ...band, status: "SYNCING" } : band) }));
    await new Promise<void>((resolve) => window.setTimeout(resolve, 650));
    setState((previous) => {
      const now = new Date();
      const timestamp = now.toISOString();
      const today = timestamp.slice(0, 10);
      const petMetrics = previous.bandMetrics.filter((metric) => metric.petId === petId).sort((a, b) => a.date.localeCompare(b.date));
      const latest = petMetrics.at(-1);
      const activityShift = Math.floor(Math.random() * 13) - 6;
      const fresh: BandDailyMetric = {
        id: latest?.date === today ? latest.id : createId("metric"),
        petId,
        date: today,
        activeMinutes: Math.max(0, (latest?.activeMinutes ?? 45) + activityShift),
        restMinutes: Math.max(0, (latest?.restMinutes ?? 720) - activityShift * 2),
        steps: Math.max(0, (latest?.steps ?? 3500) + activityShift * 110),
        distanceKm: Math.max(0, Number(((latest?.distanceKm ?? 2.4) + activityShift * 0.07).toFixed(1))),
        sleepMinutes: latest?.sleepMinutes ?? 0,
        sleepQuality: latest?.sleepQuality ?? 0,
        averageRestingPulse: latest?.averageRestingPulse,
        temperatureTrend: latest?.temperatureTrend ?? "Unavailable",
      };
      const metrics = latest?.date === today
        ? previous.bandMetrics.map((metric) => metric.id === latest?.id ? fresh : metric)
        : [...previous.bandMetrics, fresh];
      return {
        ...previous,
        bands: previous.bands.map((band) => band.petId === petId ? { ...band, status: "CONNECTED", lastSynced: timestamp, battery: Math.max(5, band.battery - 1) } : band),
        bandMetrics: metrics,
      };
    });
  }, []);
  const disconnectBand = useCallback((petId: string) => setState((previous) => ({ ...previous, bands: previous.bands.map((band) => band.petId === petId ? { ...band, status: "DISCONNECTED" } : band) })), []);
  const addHabit = useCallback((habit: { petId: string; kind: HabitKind; label: string; durationMinutes?: number; timestamp?: string; source?: HabitSource }) => setState((previous) => ({
    ...previous,
    habits: [{ id: createId("habit"), petId: habit.petId, kind: habit.kind, label: habit.label, durationMinutes: habit.durationMinutes, timestamp: habit.timestamp ?? new Date().toISOString(), source: habit.source ?? "MANUAL" }, ...previous.habits],
  })), []);
  const markBandAlertRead = useCallback((id: string) => setState((previous) => ({ ...previous, bandAlerts: previous.bandAlerts.map((alert) => alert.id === id ? { ...alert, status: "READ" } : alert) })), []);
  const addLocationPoint = useCallback((point: Omit<PetLocationPoint, "id">) => setState((previous) => {
    if (!Number.isFinite(point.latitude) || !Number.isFinite(point.longitude) || Math.abs(point.latitude) > 90 || Math.abs(point.longitude) > 180) return previous;
    const otherPoints = previous.locationPoints.filter((candidate) => candidate.petId !== point.petId);
    const petPoints = previous.locationPoints.filter((candidate) => candidate.petId === point.petId);
    const lastPoint = petPoints.at(-1);
    if (lastPoint && lastPoint.timestamp === point.timestamp) return previous;
    const nextPoints = [...petPoints, { ...point, id: createId("location") }].sort((left, right) => left.timestamp.localeCompare(right.timestamp)).slice(-600);
    return { ...previous, locationPoints: [...otherPoints, ...nextPoints] };
  }), []);
  const clearLocationPoints = useCallback((petId: string) => setState((previous) => ({ ...previous, locationPoints: previous.locationPoints.filter((point) => point.petId !== petId) })), []);
  const dismissInsight = useCallback((petId: string, insightId: string) => setState((previous) => {
    const next = { id: `insight-state:${petId}:${insightId}`, petId, insightId, status: "DISMISSED" as const, updatedAt: new Date().toISOString() };
    return { ...previous, insightStates: [...previous.insightStates.filter((item) => !(item.petId === petId && item.insightId === insightId)), next] };
  }), []);
  const snoozeInsight = useCallback((petId: string, insightId: string, until?: string) => setState((previous) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const next = { id: `insight-state:${petId}:${insightId}`, petId, insightId, status: "SNOOZED" as const, until: until ?? tomorrow.toISOString(), updatedAt: new Date().toISOString() };
    return { ...previous, insightStates: [...previous.insightStates.filter((item) => !(item.petId === petId && item.insightId === insightId)), next] };
  }), []);
  const sendMessage = useCallback((petId: string, text: string) => setState((previous) => {
    const pet = previous.pets.find((item) => item.id === petId);
    const userMessage: ChatMessage = { id: createId("msg"), role: "user", text, timestamp: new Date().toISOString() };
    const assistant = pet ? buildPetAssistantResponse(text, buildPetContext({
      pet,
      records: previous.records,
      vaccinations: previous.vaccinations,
      medications: previous.medications,
      weights: previous.weights,
      reminders: previous.reminders,
      appointments: previous.appointments,
      orders: previous.orders,
      bookings: previous.bookings,
      providers: initialProviders,
      vets: initialVets,
      bands: previous.bands,
      bandMetrics: previous.bandMetrics,
      habits: previous.habits,
      bandAlerts: previous.bandAlerts,
      locationPoints: previous.locationPoints,
      products: previous.products,
    })) : { text: "Select a pet profile first so I can safely use its recorded context.", sources: [] };
    const response: ChatMessage = { id: createId("msg"), role: "assistant", text: assistant.text, sources: assistant.sources, timestamp: new Date().toISOString() };
    return { ...previous, conversations: { ...previous.conversations, [petId]: [...(previous.conversations[petId] ?? []), userMessage, response] } };
  }), []);
  const clearConversation = useCallback((petId: string) => setState((previous) => ({ ...previous, conversations: { ...previous.conversations, [petId]: [] } })), []);

  const value = useMemo<Store>(() => ({ ...state, hydrated, user, vets: initialVets, providers: initialProviders, addPet, updatePet, addRecord, updateRecord, deleteRecord, addVaccination, updateVaccination, deleteVaccination, addMedication, updateMedication, deleteMedication, addWeight, deleteWeight, addReminder, toggleReminder, bookAppointment, updateAppointmentStatus, setConsultationNotes, addToCart, setCartQuantity, clearCart, checkout, bookService, updateServiceBookingStatus, updateOrderStatus, updateProduct, saveBluetoothBand, updateBluetoothBandReading, pairBand, syncBand, disconnectBand, addHabit, markBandAlertRead, addLocationPoint, clearLocationPoints, dismissInsight, snoozeInsight, sendMessage, clearConversation }), [state, hydrated, user, addPet, updatePet, addRecord, updateRecord, deleteRecord, addVaccination, updateVaccination, deleteVaccination, addMedication, updateMedication, deleteMedication, addWeight, deleteWeight, addReminder, toggleReminder, bookAppointment, updateAppointmentStatus, setConsultationNotes, addToCart, setCartQuantity, clearCart, checkout, bookService, updateServiceBookingStatus, updateOrderStatus, updateProduct, saveBluetoothBand, updateBluetoothBandReading, pairBand, syncBand, disconnectBand, addHabit, markBandAlertRead, addLocationPoint, clearLocationPoints, dismissInsight, snoozeInsight, sendMessage, clearConversation]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePetcare() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("usePetcare must be used inside PetcareProvider");
  return context;
}
