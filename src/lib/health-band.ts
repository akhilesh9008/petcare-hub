import type {
  HealthBandAlert,
  HealthBandAlertStatus,
  HealthBandAlertType,
  HealthBandDailyMetric,
  HealthBandSummary,
  Id,
  PetHabitEvent,
  PetHabitType,
  PetWearableDevice,
  RepositoryState,
} from "../types/petcare";
import { createId, nowIso, PetCareRepository } from "./repository";

/**
 * These are intentionally conservative wellness-observation thresholds. They
 * are not clinical ranges and must never be presented as a diagnosis.
 */
export const HEALTH_BAND_THRESHOLDS = {
  elevatedRestingHeartRateBpm: 120,
  lowActivityMinutes: 20,
  lowSleepMinutes: 420,
} as const;

export const MOCK_BAND_SCENARIOS = [
  "BASELINE",
  "LOW_ACTIVITY",
  "ELEVATED_HEART_RATE",
  "SHORT_SLEEP",
] as const;
export type MockBandScenario = (typeof MOCK_BAND_SCENARIOS)[number];

export class HealthBandError extends Error {
  public constructor(
    message: string,
    public readonly statusCode = 400,
  ) {
    super(message);
    this.name = "HealthBandError";
  }
}

export interface HealthBandSummaryOptions {
  /** Defaults to seven calendar days, capped at 90 to keep mock responses small. */
  days?: number;
  /** A YYYY-MM-DD range end. When omitted, the most recent metric anchors demo data. */
  endDate?: string;
}

export interface MockBandSyncOptions {
  deviceId?: Id;
  date?: string;
  scenario?: MockBandScenario;
  now?: Date;
}

export interface OwnerHabitInput {
  deviceId?: Id;
  type: PetHabitType;
  occurredAt: string;
  durationMinutes?: number;
  quantity?: number;
  unit?: string;
  note?: string;
}

export interface HealthBandSyncResult {
  device: PetWearableDevice;
  metric: HealthBandDailyMetric;
  habits: PetHabitEvent[];
  alerts: HealthBandAlert[];
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value + "T00:00:00.000Z"));
}

function toDate(value: string): Date {
  if (!validDate(value)) {
    throw new HealthBandError("Use a date in YYYY-MM-DD format.");
  }
  return new Date(value + "T00:00:00.000Z");
}

function addDays(date: string, days: number): string {
  const result = toDate(date);
  result.setUTCDate(result.getUTCDate() + days);
  return dateOnly(result);
}

function boundedDays(value: number | undefined): number {
  if (value === undefined) return 7;
  if (!Number.isInteger(value) || value < 1 || value > 90) {
    throw new HealthBandError("days must be a whole number between 1 and 90.");
  }
  return value;
}

function decimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function mean(values: number[]): number | undefined {
  if (!values.length) return undefined;
  return decimal(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function deterministicValue(input: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function metricForMockSync(
  petId: Id,
  deviceId: Id,
  date: string,
  scenario: MockBandScenario,
  now: string,
  existing?: HealthBandDailyMetric,
): HealthBandDailyMetric {
  const variation = deterministicValue(petId + ":" + date);
  let restingHeartRateBpm = 76 + (variation % 13);
  let activityMinutes = 42 + (variation % 29);
  let sleepMinutes = 490 + (variation % 71);

  if (scenario === "LOW_ACTIVITY") activityMinutes = 12;
  if (scenario === "ELEVATED_HEART_RATE") restingHeartRateBpm = 126;
  if (scenario === "SHORT_SLEEP") sleepMinutes = 390;

  const steps = Math.round(activityMinutes * (82 + (variation % 26)));
  return {
    id: existing?.id ?? createId("band-metric"),
    petId,
    deviceId,
    date,
    source: "BAND",
    restingHeartRateBpm,
    averageHeartRateBpm: restingHeartRateBpm + 15 + (variation % 8),
    maxHeartRateBpm: restingHeartRateBpm + 56 + (variation % 24),
    activityMinutes,
    steps,
    distanceKm: decimal(steps / 1_400),
    caloriesKcal: Math.round(activityMinutes * 5.8),
    sleepMinutes,
    sleepQualityScore: Math.min(100, Math.max(45, Math.round(sleepMinutes / 6))),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

function alertDetails(
  metric: HealthBandDailyMetric,
): Array<Pick<HealthBandAlert, "type" | "severity" | "title" | "message">> {
  const observations: Array<Pick<HealthBandAlert, "type" | "severity" | "title" | "message">> = [];

  if ((metric.restingHeartRateBpm ?? 0) >= HEALTH_BAND_THRESHOLDS.elevatedRestingHeartRateBpm) {
    observations.push({
      type: "HIGH_RESTING_HEART_RATE",
      severity: "WARNING",
      title: "Elevated resting heart-rate estimate",
      message: "The wearable estimated a resting heart rate above the configured wellness observation threshold. A band cannot diagnose a condition; contact a veterinarian promptly if this is unusual for your pet or they seem unwell.",
    });
  }
  if (metric.activityMinutes <= HEALTH_BAND_THRESHOLDS.lowActivityMinutes) {
    observations.push({
      type: "LOW_ACTIVITY",
      severity: "INFO",
      title: "Activity was lower than the daily target",
      message: "The wearable recorded lower activity than the configured target. This is a wellness signal, not a diagnosis; consider your pet's normal routine and any veterinary advice.",
    });
  }
  if (metric.sleepMinutes <= HEALTH_BAND_THRESHOLDS.lowSleepMinutes) {
    observations.push({
      type: "LOW_SLEEP",
      severity: "INFO",
      title: "Sleep was shorter than the daily target",
      message: "The wearable estimated shorter sleep than the configured target. Monitor your pet's usual behaviour and contact a veterinarian if you are concerned.",
    });
  }
  return observations;
}

function upsertAlert(
  draft: RepositoryState,
  input: Omit<HealthBandAlert, "id" | "createdAt" | "updatedAt" | "status">,
  now: string,
): HealthBandAlert {
  const existing = draft.healthBandAlerts.find((alert) => alert.dedupeKey === input.dedupeKey);
  if (existing) {
    Object.assign(existing, input, { updatedAt: now });
    return existing;
  }

  const alert: HealthBandAlert = {
    id: createId("band-alert"),
    ...input,
    status: "OPEN",
    createdAt: now,
    updatedAt: now,
  };
  draft.healthBandAlerts.push(alert);
  return alert;
}

function resolveMissingMetricAlerts(
  draft: RepositoryState,
  metric: HealthBandDailyMetric,
  activeTypes: HealthBandAlertType[],
  now: string,
): void {
  for (const alert of draft.healthBandAlerts) {
    if (
      alert.dailyMetricId === metric.id &&
      !activeTypes.includes(alert.type) &&
      alert.status !== "RESOLVED"
    ) {
      alert.status = "RESOLVED";
      alert.resolvedAt = now;
      alert.updatedAt = now;
    }
  }
}

/** Rebuilds deterministic daily observations. Call only inside a repository transaction. */
export function refreshHealthBandAlerts(
  draft: RepositoryState,
  petId: Id,
  now = nowIso(),
): HealthBandAlert[] {
  const activeAlerts: HealthBandAlert[] = [];
  const metrics = draft.healthBandDailyMetrics.filter((metric) => metric.petId === petId);

  for (const metric of metrics) {
    const details = alertDetails(metric);
    resolveMissingMetricAlerts(draft, metric, details.map((item) => item.type), now);
    for (const item of details) {
      activeAlerts.push(
        upsertAlert(
          draft,
          {
            petId,
            deviceId: metric.deviceId,
            dailyMetricId: metric.id,
            dedupeKey: "metric:" + metric.id + ":" + item.type,
            ...item,
            observedAt: metric.date + "T12:00:00.000Z",
          },
          now,
        ),
      );
    }
  }

  for (const device of draft.wearableDevices.filter((item) => item.petId === petId && item.status === "OFFLINE")) {
    activeAlerts.push(
      upsertAlert(
        draft,
        {
          petId,
          deviceId: device.id,
          dedupeKey: "device:" + device.id + ":OFFLINE",
          type: "DEVICE_OFFLINE",
          severity: "INFO",
          title: "Wearable is offline",
          message: "The wearable has not connected. Check that it is charged, fitted safely, and within sync range.",
          observedAt: now,
        },
        now,
      ),
    );
  }

  return activeAlerts.sort((left, right) => right.observedAt.localeCompare(left.observedAt));
}

function mockHabitEvents(
  petId: Id,
  deviceId: Id,
  deviceIdentifier: string,
  metric: HealthBandDailyMetric,
  now: string,
): PetHabitEvent[] {
  const date = metric.date;
  return [
    {
      id: createId("habit"),
      petId,
      deviceId,
      sourceEventId: deviceIdentifier + ":walk:" + date,
      type: "WALK",
      source: "BAND",
      occurredAt: date + "T06:45:00.000Z",
      durationMinutes: Math.min(metric.activityMinutes, 35),
      note: "Wearable-detected morning walk.",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createId("habit"),
      petId,
      deviceId,
      sourceEventId: deviceIdentifier + ":sleep:" + date,
      type: "SLEEP",
      source: "BAND",
      occurredAt: date + "T00:00:00.000Z",
      durationMinutes: metric.sleepMinutes,
      note: "Wearable sleep estimate.",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function upsertHabitEvent(draft: RepositoryState, event: PetHabitEvent): PetHabitEvent {
  const existing = event.sourceEventId
    ? draft.habitEvents.find((candidate) => candidate.sourceEventId === event.sourceEventId)
    : undefined;
  if (existing) {
    Object.assign(existing, { ...event, id: existing.id, createdAt: existing.createdAt });
    return existing;
  }
  draft.habitEvents.push(event);
  return event;
}

/**
 * Creates a deterministic local demo reading. Real band provider webhooks can
 * later replace this boundary without changing the returned health summary.
 */
export function syncMockHealthBand(
  repository: PetCareRepository,
  petId: Id,
  options: MockBandSyncOptions = {},
): HealthBandSyncResult {
  const clock = options.now ?? new Date();
  const now = clock.toISOString();
  const date = options.date ?? dateOnly(clock);
  toDate(date);
  const scenario = options.scenario ?? "BASELINE";

  return repository.transaction((draft) => {
    let device = options.deviceId
      ? draft.wearableDevices.find((candidate) => candidate.id === options.deviceId && candidate.petId === petId)
      : draft.wearableDevices.find((candidate) => candidate.petId === petId && candidate.status === "PAIRED");

    if (options.deviceId && !device) {
      throw new HealthBandError("Wearable device not found for this pet.", 404);
    }

    if (!device) {
      device = {
        id: createId("band"),
        petId,
        deviceIdentifier: "MOCK-" + petId + "-" + createId("device").slice(-8),
        displayName: "PetCare demo band",
        manufacturer: "PetCare",
        model: "Demo Pulse",
        status: "PAIRED",
        batteryPercent: 82,
        pairedAt: now,
        lastSyncedAt: now,
        createdAt: now,
        updatedAt: now,
      };
      draft.wearableDevices.push(device);
    } else {
      device.status = "PAIRED";
      device.batteryPercent = Math.max(20, (device.batteryPercent ?? 85) - 1);
      device.lastSyncedAt = now;
      device.updatedAt = now;
    }

    const existingMetric = draft.healthBandDailyMetrics.find(
      (metric) => metric.petId === petId && metric.date === date,
    );
    const metric = metricForMockSync(
      petId,
      device.id,
      date,
      scenario,
      now,
      existingMetric,
    );
    if (existingMetric) {
      Object.assign(existingMetric, metric);
    } else {
      draft.healthBandDailyMetrics.push(metric);
    }

    const habits = mockHabitEvents(petId, device.id, device.deviceIdentifier, metric, now)
      .map((event) => upsertHabitEvent(draft, event));
    const alerts = refreshHealthBandAlerts(draft, petId, now);
    return { device, metric, habits, alerts };
  });
}

export function recordOwnerHabitEvent(
  repository: PetCareRepository,
  petId: Id,
  input: OwnerHabitInput,
  now = nowIso(),
): PetHabitEvent {
  return repository.transaction((draft) => {
    if (input.deviceId && !draft.wearableDevices.some((device) => device.id === input.deviceId && device.petId === petId)) {
      throw new HealthBandError("Wearable device not found for this pet.", 404);
    }

    const event: PetHabitEvent = {
      id: createId("habit"),
      petId,
      deviceId: input.deviceId,
      type: input.type,
      source: "OWNER",
      occurredAt: input.occurredAt,
      durationMinutes: input.durationMinutes,
      quantity: input.quantity,
      unit: input.unit,
      note: input.note,
      createdAt: now,
      updatedAt: now,
    };
    draft.habitEvents.push(event);
    return event;
  });
}

export function updateHealthBandAlertStatus(
  repository: PetCareRepository,
  petId: Id,
  alertId: Id,
  status: Extract<HealthBandAlertStatus, "ACKNOWLEDGED" | "RESOLVED">,
  now = nowIso(),
): HealthBandAlert {
  return repository.transaction((draft) => {
    const alert = draft.healthBandAlerts.find(
      (candidate) => candidate.id === alertId && candidate.petId === petId,
    );
    if (!alert) {
      throw new HealthBandError("Health-band alert not found for this pet.", 404);
    }
    alert.status = status;
    alert.acknowledgedAt = status === "ACKNOWLEDGED" ? now : alert.acknowledgedAt;
    alert.resolvedAt = status === "RESOLVED" ? now : undefined;
    alert.updatedAt = now;
    return alert;
  });
}

export function getHealthBandSummary(
  repository: PetCareRepository,
  petId: Id,
  options: HealthBandSummaryOptions = {},
): HealthBandSummary {
  const allMetrics = repository.listHealthBandDailyMetrics(petId);
  const days = boundedDays(options.days);
  const endDate = options.endDate ?? allMetrics.at(-1)?.date ?? dateOnly(new Date());
  toDate(endDate);
  const from = addDays(endDate, 1 - days);
  const isInRange = (value: string) => value >= from && value <= endDate;
  const metrics = allMetrics.filter((metric) => isInRange(metric.date));
  const habits = repository.listHabitEvents(petId).filter((event) => isInRange(event.occurredAt.slice(0, 10)));
  const alerts = repository.listHealthBandAlerts(petId).filter(
    (alert) => isInRange(alert.observedAt.slice(0, 10)) || alert.status !== "RESOLVED",
  );
  const totalActivityMinutes = metrics.reduce((sum, metric) => sum + metric.activityMinutes, 0);
  const totalSleepMinutes = metrics.reduce((sum, metric) => sum + metric.sleepMinutes, 0);
  const totalSteps = metrics.reduce((sum, metric) => sum + (metric.steps ?? 0), 0);
  const device = repository.getLatestWearableDevice(petId);

  return {
    petId,
    range: { from, to: endDate },
    device,
    latestMetric: metrics.at(-1),
    metrics,
    habits,
    alerts,
    aggregate: {
      daysWithData: metrics.length,
      activeDays: metrics.filter((metric) => metric.activityMinutes > 0).length,
      totalActivityMinutes,
      averageActivityMinutes: metrics.length ? decimal(totalActivityMinutes / metrics.length) : 0,
      totalSleepMinutes,
      averageSleepMinutes: metrics.length ? decimal(totalSleepMinutes / metrics.length) : 0,
      totalSteps,
      averageRestingHeartRateBpm: mean(
        metrics
          .map((metric) => metric.restingHeartRateBpm)
          .filter((value): value is number => value !== undefined),
      ),
      latestSyncedAt: device?.lastSyncedAt,
    },
  };
}
