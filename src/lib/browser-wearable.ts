/**
 * A small, browser-only Web Bluetooth adapter for standard BLE health-band
 * services. It deliberately supports only the interoperable GATT services a
 * browser is allowed to see; vendor-locked watches need their vendor's OAuth
 * or native companion integration.
 */

const BATTERY_SERVICE = "battery_service";
const BATTERY_LEVEL_CHARACTERISTIC = "battery_level";
const HEART_RATE_SERVICE = "heart_rate";
const HEART_RATE_MEASUREMENT_CHARACTERISTIC = "heart_rate_measurement";
const DEVICE_INFORMATION_SERVICE = "device_information";

type BluetoothCharacteristicLike = {
  value?: DataView;
  readValue?: () => Promise<DataView>;
  startNotifications?: () => Promise<BluetoothCharacteristicLike>;
  stopNotifications?: () => Promise<BluetoothCharacteristicLike>;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
};

type BluetoothServiceLike = {
  getCharacteristic: (characteristic: string) => Promise<BluetoothCharacteristicLike>;
};

type BluetoothServerLike = {
  getPrimaryService: (service: string) => Promise<BluetoothServiceLike>;
};

type BluetoothGattLike = {
  connected: boolean;
  connect: () => Promise<BluetoothServerLike>;
  disconnect: () => void;
};

type BluetoothDeviceLike = {
  id: string;
  name?: string;
  gatt?: BluetoothGattLike;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
};

type BluetoothApiLike = {
  getAvailability?: () => Promise<boolean>;
  requestDevice: (options: {
    acceptAllDevices?: boolean;
    optionalServices?: string[];
  }) => Promise<BluetoothDeviceLike>;
};

export interface BrowserWearableReading {
  deviceId: string;
  name: string;
  connected: boolean;
  batteryLevel?: number;
  heartRate?: number;
  supportsBattery: boolean;
  supportsHeartRate: boolean;
  readAt: string;
}

export interface BrowserWearableSession extends BrowserWearableReading {
  disconnect: () => void;
}

export class BrowserWearableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrowserWearableError";
  }
}

type ActiveSession = {
  device: BluetoothDeviceLike;
  batteryCharacteristic?: BluetoothCharacteristicLike;
  heartRateCharacteristic?: BluetoothCharacteristicLike;
  heartRateListener?: EventListener;
  snapshot: BrowserWearableReading;
  onHeartRate?: (reading: BrowserWearableReading) => void;
};

const sessions = new Map<string, ActiveSession>();

function bluetoothApi(): BluetoothApiLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as Navigator & { bluetooth?: BluetoothApiLike }).bluetooth;
}

function deviceName(device: BluetoothDeviceLike) {
  return device.name?.trim() || "Bluetooth health band";
}

function deviceIsConnected(device: BluetoothDeviceLike) {
  return Boolean(device.gatt?.connected);
}

function parseHeartRate(value: DataView | undefined): number | undefined {
  if (!value || value.byteLength < 2) return undefined;
  const flags = value.getUint8(0);
  const isSixteenBit = (flags & 0x01) === 0x01;
  const offset = 1;
  if (isSixteenBit && value.byteLength >= offset + 2) return value.getUint16(offset, true);
  return value.getUint8(offset);
}

async function getCharacteristic(
  server: BluetoothServerLike,
  serviceId: string,
  characteristicId: string,
) {
  try {
    const service = await server.getPrimaryService(serviceId);
    return await service.getCharacteristic(characteristicId);
  } catch {
    return undefined;
  }
}

async function readBattery(characteristic?: BluetoothCharacteristicLike) {
  if (!characteristic?.readValue) return undefined;
  try {
    const value = await characteristic.readValue();
    return value.byteLength ? Math.max(0, Math.min(100, value.getUint8(0))) : undefined;
  } catch {
    return undefined;
  }
}

async function readHeartRate(characteristic?: BluetoothCharacteristicLike) {
  if (!characteristic?.readValue) return undefined;
  try {
    return parseHeartRate(await characteristic.readValue());
  } catch {
    return undefined;
  }
}

function browserError(error: unknown) {
  if (error instanceof BrowserWearableError) return error;
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return new BrowserWearableError("No device was selected. Choose your band in the browser picker to connect it.");
  }
  if (error instanceof DOMException && error.name === "SecurityError") {
    return new BrowserWearableError("Bluetooth is blocked here. Open the app over HTTPS (or localhost) and allow Bluetooth for this site.");
  }
  if (error instanceof Error) return new BrowserWearableError(error.message || "The band could not be connected.");
  return new BrowserWearableError("The band could not be connected.");
}

function snapshotFor(session: ActiveSession): BrowserWearableReading {
  return {
    ...session.snapshot,
    connected: deviceIsConnected(session.device),
    readAt: new Date().toISOString(),
  };
}

function disposeSession(deviceId: string) {
  const session = sessions.get(deviceId);
  if (!session) return;
  if (session.heartRateCharacteristic && session.heartRateListener) {
    session.heartRateCharacteristic.removeEventListener?.("characteristicvaluechanged", session.heartRateListener);
    const stopNotifications = session.heartRateCharacteristic.stopNotifications?.();
    if (stopNotifications) void stopNotifications.catch(() => undefined);
  }
  sessions.delete(deviceId);
}

/** Returns whether the current browser can ask the user to select a BLE band. */
export function getBrowserWearableSupport() {
  const api = bluetoothApi();
  if (!api) {
    return {
      supported: false,
      message: "This browser does not provide Web Bluetooth. Use Chrome or Edge on a supported device, or connect through your watch maker's app.",
    };
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return {
      supported: false,
      message: "Bluetooth requires HTTPS. localhost works for desktop development; a phone opened through a LAN IP needs HTTPS.",
    };
  }
  return { supported: true, message: "Your browser can request access to compatible Bluetooth Low Energy bands." };
}

export function isBrowserWearableSessionActive(deviceId?: string) {
  if (!deviceId) return false;
  const session = sessions.get(deviceId);
  return Boolean(session && deviceIsConnected(session.device));
}

/**
 * Opens the browser's native Bluetooth chooser. The user must choose the
 * device; the site cannot silently scan for nearby watches.
 */
export async function connectBrowserWearable(
  onHeartRate?: (reading: BrowserWearableReading) => void,
): Promise<BrowserWearableSession> {
  try {
    const api = bluetoothApi();
    const support = getBrowserWearableSupport();
    if (!api || !support.supported) throw new BrowserWearableError(support.message);
    if (await api.getAvailability?.() === false) throw new BrowserWearableError("Bluetooth is currently unavailable on this device. Turn Bluetooth on and try again.");

    const device = await api.requestDevice({
      acceptAllDevices: true,
      optionalServices: [BATTERY_SERVICE, HEART_RATE_SERVICE, DEVICE_INFORMATION_SERVICE],
    });
    if (!device.gatt) throw new BrowserWearableError("This selected device does not expose a Bluetooth Low Energy connection to the browser.");

    const server = await device.gatt.connect();
    const batteryCharacteristic = await getCharacteristic(server, BATTERY_SERVICE, BATTERY_LEVEL_CHARACTERISTIC);
    const heartRateCharacteristic = await getCharacteristic(server, HEART_RATE_SERVICE, HEART_RATE_MEASUREMENT_CHARACTERISTIC);
    const [batteryLevel, heartRate] = await Promise.all([
      readBattery(batteryCharacteristic),
      readHeartRate(heartRateCharacteristic),
    ]);

    const session: ActiveSession = {
      device,
      batteryCharacteristic,
      heartRateCharacteristic,
      onHeartRate,
      snapshot: {
        deviceId: device.id,
        name: deviceName(device),
        connected: true,
        batteryLevel,
        heartRate,
        supportsBattery: Boolean(batteryCharacteristic),
        supportsHeartRate: Boolean(heartRateCharacteristic),
        readAt: new Date().toISOString(),
      },
    };

    if (heartRateCharacteristic?.startNotifications) {
      try {
        await heartRateCharacteristic.startNotifications();
        session.heartRateListener = (event) => {
          const characteristic = event.target as BluetoothCharacteristicLike;
          const latestHeartRate = parseHeartRate(characteristic.value);
          if (latestHeartRate === undefined) return;
          session.snapshot = { ...session.snapshot, heartRate: latestHeartRate, readAt: new Date().toISOString() };
          session.onHeartRate?.(snapshotFor(session));
        };
        heartRateCharacteristic.addEventListener?.("characteristicvaluechanged", session.heartRateListener);
      } catch {
        // A number of bands only allow an active notification stream after
        // their companion app prepares the device. Initial reads still work.
      }
    }

    device.addEventListener?.("gattserverdisconnected", () => disposeSession(device.id));
    sessions.set(device.id, session);
    const initial = snapshotFor(session);
    return { ...initial, disconnect: () => disconnectBrowserWearable(device.id) };
  } catch (error) {
    throw browserError(error);
  }
}

/** Reads the standard battery and heart-rate characteristics from an active session. */
export async function refreshBrowserWearable(deviceId: string): Promise<BrowserWearableReading> {
  const session = sessions.get(deviceId);
  if (!session || !deviceIsConnected(session.device)) {
    throw new BrowserWearableError("This browser session is no longer connected to the band. Choose Connect a real BLE band again.");
  }
  const [batteryLevel, heartRate] = await Promise.all([
    readBattery(session.batteryCharacteristic),
    readHeartRate(session.heartRateCharacteristic),
  ]);
  session.snapshot = {
    ...session.snapshot,
    batteryLevel: batteryLevel ?? session.snapshot.batteryLevel,
    heartRate: heartRate ?? session.snapshot.heartRate,
    connected: true,
    readAt: new Date().toISOString(),
  };
  return snapshotFor(session);
}

export function disconnectBrowserWearable(deviceId: string) {
  const session = sessions.get(deviceId);
  if (session?.device.gatt?.connected) session.device.gatt.disconnect();
  disposeSession(deviceId);
}
