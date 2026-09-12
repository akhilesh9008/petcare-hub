import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { POST as loginRoute } from "@/app/api/auth/login/route";
import { GET as petsRoute } from "@/app/api/pets/route";
import { AppointmentService } from "@/lib/appointments";
import { AuthService, AuthenticationError } from "@/lib/auth";
import { canReadPet, canWritePet, hasPermission } from "@/lib/authorization";
import { calculateCartTotals, CartService } from "@/lib/cart";
import {
  createDemoRepository,
  createMemoryStorage,
  DEMO_OWNER_ID,
  getCurrentDemoUser,
  getRepository,
  resetRepositoryForTests,
} from "@/lib/repository";
import { syncAutomaticReminders } from "@/lib/reminders";
import { getHealthBandSummary, recordOwnerHabitEvent, syncMockHealthBand, updateHealthBandAlertStatus } from "@/lib/health-band";

function repo() {
  return createDemoRepository({ storage: createMemoryStorage() });
}

const owner = getCurrentDemoUser("PET_OWNER");

describe("authentication and access control", () => {
  it("authenticates a valid owner and rejects a bad password", async () => {
    const service = new AuthService(repo());
    const result = await service.login({ email: "akhilesh@petcare.demo", password: "PetCare@123" });

    expect(result.user.id).toBe(DEMO_OWNER_ID);
    await expect(service.login({ email: "akhilesh@petcare.demo", password: "wrong" })).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("limits pet writes to the pet owner and read access to an authorized veterinarian", () => {
    const repository = repo();
    const state = repository.snapshot();
    const bruno = state.pets.find((pet) => pet.id === "pet-bruno")!;
    const unrelatedOwner = state.users.find((user) => user.id === "user-owner-meera")!;
    const unrelatedVet = { id: "user-vet-kavya", role: "VETERINARIAN" as const, isActive: true };

    expect(canWritePet(owner, bruno)).toBe(true);
    expect(canWritePet(unrelatedOwner, bruno)).toBe(false);
    expect(canReadPet(unrelatedVet, bruno, state)).toBe(false);
    expect(hasPermission(owner, "product:manage")).toBe(false);
  });
});

describe("appointments and automated reminders", () => {
  it("creates then lets the owner cancel a future appointment", () => {
    const repository = repo();
    const service = new AppointmentService(repository, { now: () => new Date("2026-08-01T09:00:00.000Z") });
    const appointment = service.create(owner, {
      petId: "pet-bruno",
      veterinarianId: "vet-aarav",
      date: "2026-09-04",
      time: "10:00",
      type: "IN_PERSON",
      reason: "Follow-up wellness review",
    });

    expect(appointment.status).toBe("PENDING");
    expect(repository.listReminders(DEMO_OWNER_ID).some((reminder) => reminder.sourceId === appointment.id)).toBe(true);

    const cancelled = service.cancel(owner, appointment.id, "Scheduling conflict");
    expect(cancelled.status).toBe("CANCELLED");
    expect(cancelled.cancellationReason).toBe("Scheduling conflict");
  });

  it("generates vaccination and medication reminders without duplicates", () => {
    const repository = repo();
    repository.transaction((state) => {
      state.vaccinations.push({
        id: "vaccination-test", petId: "pet-bruno", vaccineName: "Demo booster",
        dateAdministered: "2026-08-01", nextDueDate: "2026-10-01",
        createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-01T00:00:00.000Z",
      });
      state.medications.push({
        id: "medication-test", petId: "pet-bruno", medicineName: "Demo supplement",
        startDate: "2026-08-01", endDate: "2026-08-20", isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z", updatedAt: "2026-08-01T00:00:00.000Z",
      });
    });

    const first = syncAutomaticReminders(repository, new Date("2026-08-10T09:00:00.000Z"));
    const second = syncAutomaticReminders(repository, new Date("2026-08-10T09:00:00.000Z"));
    const reminders = repository.listReminders(DEMO_OWNER_ID);

    expect(first.created).toBeGreaterThanOrEqual(2);
    expect(second.created).toBe(0);
    expect(reminders.filter((item) => item.sourceKey === "vaccination:vaccination-test")).toHaveLength(1);
    expect(reminders.filter((item) => item.sourceKey === "medication:medication-test")).toHaveLength(1);
  });
});

describe("cart and checkout", () => {
  it("calculates product discount and free delivery correctly", () => {
    const repository = repo();
    const totals = calculateCartTotals({
      id: "test-cart", ownerId: DEMO_OWNER_ID, updatedAt: "2026-08-01T00:00:00.000Z",
      items: [{ id: "cart-item", productId: "product-dog-adult-kibble", quantity: 2, addedAt: "2026-08-01T00:00:00.000Z" }],
    }, repository.listProducts());

    expect(totals.subtotal).toBe(2598);
    expect(totals.discount).toBe(259.8);
    expect(totals.deliveryFee).toBe(0);
    expect(totals.total).toBe(2338.2);
  });

  it("creates an order, decrements stock and clears the cart", () => {
    const repository = repo();
    const service = new CartService(repository, { now: () => new Date("2026-08-01T09:00:00.000Z") });
    const before = repository.getProduct("product-dog-adult-kibble")!.stock;
    service.addItem(owner, { productId: "product-dog-adult-kibble", quantity: 1 });
    const order = service.checkout(owner, {
      name: "Akhilesh Sharma", phone: "9876543210", addressLine1: "12 Demo Street",
      city: "Pune", state: "Maharashtra", pinCode: "411001",
    });

    expect(order.status).toBe("PLACED");
    expect(repository.getCart(DEMO_OWNER_ID)?.items).toHaveLength(0);
    expect(repository.getProduct("product-dog-adult-kibble")!.stock).toBe(before - 1);
  });
});

describe("pet health-band wellness tracking", () => {
  it("creates a deterministic band summary and non-diagnostic activity observation", () => {
    const repository = repo();
    const result = syncMockHealthBand(repository, "pet-bruno", {
      date: "2026-09-02",
      scenario: "LOW_ACTIVITY",
      now: new Date("2026-09-02T09:00:00.000Z"),
    });
    const summary = getHealthBandSummary(repository, "pet-bruno", { days: 7, endDate: "2026-09-02" });

    expect(result.device.status).toBe("PAIRED");
    expect(result.metric.activityMinutes).toBe(12);
    expect(summary.latestMetric?.date).toBe("2026-09-02");
    expect(summary.alerts.some((alert) => alert.type === "LOW_ACTIVITY")).toBe(true);
  });

  it("keeps owner habit entries private and allows an owner to acknowledge a signal", () => {
    const repository = repo();
    const result = syncMockHealthBand(repository, "pet-bruno", {
      date: "2026-09-03", scenario: "SHORT_SLEEP", now: new Date("2026-09-03T09:00:00.000Z"),
    });
    const habit = recordOwnerHabitEvent(repository, "pet-bruno", {
      type: "FEEDING", occurredAt: "2026-09-03T18:00:00.000Z", quantity: 280, unit: "g", note: "Dinner logged by owner.",
    });
    const alert = result.alerts.find((item) => item.type === "LOW_SLEEP")!;
    const acknowledged = updateHealthBandAlertStatus(repository, "pet-bruno", alert.id, "ACKNOWLEDGED");

    expect(habit.source).toBe("OWNER");
    expect(repository.listHabitEvents("pet-bruno").some((item) => item.id === habit.id)).toBe(true);
    expect(acknowledged.status).toBe("ACKNOWLEDGED");
  });
});

describe("important API endpoints", () => {
  it("creates a server session at login and uses it to read private pets", async () => {
    resetRepositoryForTests();
    const login = await loginRoute(new NextRequest("http://localhost/api/auth/login", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "akhilesh@petcare.demo", password: "PetCare@123" }),
    }));
    expect(login.status).toBe(200);

    const token = login.cookies.get("petcare_session")?.value;
    const role = login.cookies.get("petcare_role")?.value;
    const pets = await petsRoute(new NextRequest("http://localhost/api/pets", {
      headers: { cookie: `petcare_session=${token}; petcare_role=${role}` },
    }));
    const payload = await pets.json() as { data: Array<{ ownerId: string }> };

    expect(pets.status).toBe(200);
    expect(payload.data).toHaveLength(2);
    expect(payload.data.every((pet) => pet.ownerId === DEMO_OWNER_ID)).toBe(true);
  });

  it("rejects a private API request with no server session", async () => {
    resetRepositoryForTests();
    const response = await petsRoute(new NextRequest("http://localhost/api/pets"));
    expect(response.status).toBe(401);
  });
});
