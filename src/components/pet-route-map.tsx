"use client";

import { useMemo } from "react";
import { Crosshair, MapPin, Navigation, Route, ShieldCheck, Trash2 } from "lucide-react";
import type { PetLocationPoint } from "@/features/demo-data";

const MAP_WIDTH = 768;
const MAP_HEIGHT = 384;
const TILE_SIZE = 256;

function radians(value: number) {
  return value * Math.PI / 180;
}

function haversineMeters(left: PetLocationPoint, right: PetLocationPoint) {
  const earthRadius = 6_371_000;
  const latitude = radians(right.latitude - left.latitude);
  const longitude = radians(right.longitude - left.longitude);
  const a = Math.sin(latitude / 2) ** 2
    + Math.cos(radians(left.latitude)) * Math.cos(radians(right.latitude)) * Math.sin(longitude / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number) {
  if (meters < 1_000) return `${Math.round(meters)} m`;
  return `${(meters / 1_000).toFixed(meters >= 10_000 ? 1 : 2)} km`;
}

function formatLastSeen(value?: string) {
  if (!value) return "No location recorded yet";
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(value));
}

function project(latitude: number, longitude: number, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const safeLatitude = Math.max(-85.05112878, Math.min(85.05112878, latitude));
  const latitudeRadians = radians(safeLatitude);
  return {
    x: ((longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + Math.sin(latitudeRadians)) / (1 - Math.sin(latitudeRadians))) / (4 * Math.PI)) * scale,
  };
}

function mapZoom(points: PetLocationPoint[]) {
  if (points.length < 2) return 16;
  for (let zoom = 18; zoom >= 3; zoom -= 1) {
    const projected = points.map((point) => project(point.latitude, point.longitude, zoom));
    const width = Math.max(...projected.map((point) => point.x)) - Math.min(...projected.map((point) => point.x));
    const height = Math.max(...projected.map((point) => point.y)) - Math.min(...projected.map((point) => point.y));
    if (width <= MAP_WIDTH * 0.62 && height <= MAP_HEIGHT * 0.62) return zoom;
  }
  return 3;
}

function mapsDirectionsUrl(points: PetLocationPoint[]) {
  if (points.length < 2) return undefined;
  const start = points[0];
  const end = points.at(-1);
  if (!end) return undefined;
  const params = new URLSearchParams({
    api: "1",
    origin: `${start.latitude},${start.longitude}`,
    destination: `${end.latitude},${end.longitude}`,
    travelmode: "walking",
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function RoadMap({ points, petName }: { points: PetLocationPoint[]; petName: string }) {
  const geometry = useMemo(() => {
    const recent = points.slice(-160);
    if (!recent.length) return undefined;
    const zoom = mapZoom(recent);
    const projected = recent.map((point) => project(point.latitude, point.longitude, zoom));
    const center = {
      x: (Math.min(...projected.map((point) => point.x)) + Math.max(...projected.map((point) => point.x))) / 2,
      y: (Math.min(...projected.map((point) => point.y)) + Math.max(...projected.map((point) => point.y))) / 2,
    };
    const left = center.x - MAP_WIDTH / 2;
    const top = center.y - MAP_HEIGHT / 2;
    const worldSize = 2 ** zoom;
    const tiles: Array<{ x: number; y: number; left: number; top: number; url: string }> = [];
    const fromX = Math.floor(left / TILE_SIZE);
    const toX = Math.floor((left + MAP_WIDTH) / TILE_SIZE);
    const fromY = Math.max(0, Math.floor(top / TILE_SIZE));
    const toY = Math.min(worldSize - 1, Math.floor((top + MAP_HEIGHT) / TILE_SIZE));
    for (let x = fromX; x <= toX; x += 1) {
      const wrappedX = ((x % worldSize) + worldSize) % worldSize;
      for (let y = fromY; y <= toY; y += 1) {
        tiles.push({
          x,
          y,
          left: x * TILE_SIZE - left,
          top: y * TILE_SIZE - top,
          url: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${y}.png`,
        });
      }
    }
    return {
      tiles,
      path: projected.map((point) => `${point.x - left},${point.y - top}`).join(" "),
      start: { x: projected[0].x - left, y: projected[0].y - top },
      latest: { x: projected.at(-1)!.x - left, y: projected.at(-1)!.y - top },
    };
  }, [points]);

  if (!geometry) {
    return <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center"><div><MapPin className="mx-auto text-slate-400" size={28}/><p className="mt-3 font-bold text-ink">No route to show yet</p><p className="mt-1 max-w-sm text-sm leading-6 text-slate-600">Start a GPS session while the phone is with {petName} to add consented route points.</p></div></div>;
  }

  return <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-[#e8edf1] shadow-inner sm:h-80" role="img" aria-label={`Road map and GPS route for ${petName}`}>
    {geometry.tiles.map((tile) => <img key={`${tile.x}-${tile.y}`} src={tile.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none select-none" style={{ left: `${tile.left / MAP_WIDTH * 100}%`, top: `${tile.top / MAP_HEIGHT * 100}%`, width: `${TILE_SIZE / MAP_WIDTH * 100}%`, height: `${TILE_SIZE / MAP_HEIGHT * 100}%` }} />)}
    <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} preserveAspectRatio="none" aria-hidden="true">
      {points.length > 1 ? <polyline points={geometry.path} fill="none" stroke="#ffffff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" /> : null}
      {points.length > 1 ? <polyline points={geometry.path} fill="none" stroke="#0f766e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.96" /> : null}
      <circle cx={geometry.start.x} cy={geometry.start.y} r="9" fill="#ffffff" opacity="0.95" />
      <circle cx={geometry.start.x} cy={geometry.start.y} r="5" fill="#0ea5e9" />
      <circle cx={geometry.latest.x} cy={geometry.latest.y} r="14" fill="#0f766e" opacity="0.22" />
      <circle cx={geometry.latest.x} cy={geometry.latest.y} r="8" fill="#0f766e" stroke="#ffffff" strokeWidth="3" />
    </svg>
    <a className="absolute bottom-2 left-2 rounded bg-white/90 px-2 py-1 text-[10px] font-semibold text-slate-600 shadow-sm hover:text-teal-800" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
  </div>;
}

export interface PetRouteMapProps {
  petName: string;
  points: PetLocationPoint[];
  tracking: boolean;
  message?: string;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onClearRoute: () => void;
}

/** A consent-first GPS route UI. Location is collected only while tracking is active. */
export function PetRouteMap({ petName, points, tracking, message, onStartTracking, onStopTracking, onClearRoute }: PetRouteMapProps) {
  const orderedPoints = useMemo(() => [...points].sort((left, right) => left.timestamp.localeCompare(right.timestamp)), [points]);
  const distanceMeters = useMemo(() => orderedPoints.slice(1).reduce((total, point, index) => total + haversineMeters(orderedPoints[index], point), 0), [orderedPoints]);
  const latest = orderedPoints.at(-1);
  const directionsUrl = mapsDirectionsUrl(orderedPoints);

  return <section className="surface overflow-hidden" aria-labelledby="route-map-title">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6"><div><span className="eyebrow"><Route size={14}/> Live GPS route</span><h2 id="route-map-title" className="mt-3 text-xl font-black tracking-[-.03em] text-ink">{petName}&apos;s road map</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Tracks this phone only while it is accompanying {petName}. The line joins recorded GPS points over a road map; it is not a guarantee of the pet&apos;s exact position.</p></div><div className="flex shrink-0 flex-wrap gap-2">{tracking ? <button type="button" className="btn-secondary" onClick={onStopTracking}><Crosshair size={16}/> Stop tracking</button> : <button type="button" className="btn-primary" onClick={onStartTracking}><Navigation size={16}/> Start GPS tracking</button>}{orderedPoints.length ? <button type="button" className="btn-ghost text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={onClearRoute} aria-label="Clear saved GPS route"><Trash2 size={16}/> Clear</button> : null}</div></div>
    <div className="p-5 sm:p-6"><RoadMap points={orderedPoints} petName={petName}/><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-mint/55 p-4"><p className="text-xs font-bold uppercase tracking-wide text-moss">Status</p><p className="mt-1 flex items-center gap-2 font-black text-ink"><span className={`h-2.5 w-2.5 rounded-full ${tracking ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`}/>{tracking ? "Tracking now" : "Stopped"}</p></div><div className="rounded-2xl bg-sky/60 p-4"><p className="text-xs font-bold uppercase tracking-wide text-sky-800">Route distance</p><p className="mt-1 font-black text-ink">{orderedPoints.length > 1 ? formatDistance(distanceMeters) : "—"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Last reported</p><p className="mt-1 font-black text-ink">{formatLastSeen(latest?.timestamp)}</p>{latest ? <p className="mt-1 text-xs text-slate-500">±{Math.round(latest.accuracyMeters)} m accuracy</p> : null}</div></div>
      {message ? <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-3 text-sm leading-6 text-amber-900" role="status">{message}</p> : null}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"><p className="flex max-w-2xl gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 shrink-0 text-moss" size={16}/>GPS points stay in this signed-in browser workspace. Tracking stops when you choose Stop or close this page; use a dedicated pet GPS tracker plus its provider integration for unattended tracking.</p>{directionsUrl ? <a className="btn-secondary" href={directionsUrl} target="_blank" rel="noreferrer"><Route size={16}/> Open road route</a> : null}</div>
    </div>
  </section>;
}
