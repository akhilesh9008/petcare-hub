import { describe, expect, it } from "vitest";
import {
  initialAppointments,
  initialBandAlerts,
  initialBandMetrics,
  initialBands,
  initialBookings,
  initialHabits,
  initialMedications,
  initialOrders,
  initialPets,
  initialProducts,
  initialProviders,
  initialRecords,
  initialReminders,
  initialVaccinations,
  initialVets,
  initialWeights,
} from "@/features/demo-data";
import { buildPetAssistantResponse, buildPetContext, calculatePetCareReadiness, generatePetInsights, getPetProductRecommendations } from "@/lib/pet-digital-twin";

const now = new Date("2026-09-12T10:00:00.000Z");

function brunoContext() {
  return buildPetContext({
    pet: initialPets.find((pet) => pet.id === "bruno")!,
    records: initialRecords,
    vaccinations: initialVaccinations,
    medications: initialMedications,
    weights: initialWeights,
    reminders: initialReminders,
    appointments: initialAppointments,
    orders: initialOrders,
    bookings: initialBookings,
    providers: initialProviders,
    vets: initialVets,
    bands: initialBands,
    bandMetrics: initialBandMetrics,
    habits: initialHabits,
    bandAlerts: initialBandAlerts,
    locationPoints: [],
    products: initialProducts,
    now,
  });
}

describe("Pet Digital Twin", () => {
  it("builds a pet-scoped timeline from existing authoritative workspace records", () => {
    const context = brunoContext();

    expect(context.pet.id).toBe("bruno");
    expect(context.events.length).toBeGreaterThan(0);
    expect(context.events.every((event) => event.petId === "bruno")).toBe(true);
    expect(context.events.some((event) => event.eventType === "VACCINATION_RECORDED")).toBe(true);
    expect(context.events.some((event) => event.sourceReference.href === "/health")).toBe(true);
  });

  it("creates explainable, non-diagnostic care insights and readiness", () => {
    const context = brunoContext();
    const insights = generatePetInsights(context, now);
    const readiness = calculatePetCareReadiness(context, now);

    expect(insights.some((insight) => insight.type === "VACCINATION_DUE")).toBe(true);
    expect(insights.every((insight) => insight.sources.length > 0)).toBe(true);
    expect(readiness.score).toBeGreaterThanOrEqual(0);
    expect(readiness.score).toBeLessThanOrEqual(100);
    expect(readiness.explanation.toLowerCase()).toContain("not a health score");
  });

  it("returns AI answers with direct record sources and allergy-aware product filtering", () => {
    const context = brunoContext();
    const answer = buildPetAssistantResponse("Show my pet's health summary", context, now);
    const recommended = getPetProductRecommendations(context, initialProducts, 5);

    expect(answer.text).toContain("record");
    expect(answer.sources.length).toBeGreaterThan(0);
    expect(answer.text.toLowerCase()).toContain("not a clinical assessment");
    expect(recommended.every((item) => !`${item.product.name} ${item.product.description} ${item.product.tags.join(" ")}`.toLowerCase().includes("chicken"))).toBe(true);
  });
});
