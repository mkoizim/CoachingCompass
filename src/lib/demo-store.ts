'use client';

import { useMemo, useSyncExternalStore } from 'react';
import type { Player } from '@/lib/types';

/**
 * Per-visitor sandbox for the public demo.
 *
 * The shared sample roster is read from Firestore and is read-only. Every change a
 * visitor makes (new players, survey edits, coaching notes, AI summaries, deletes)
 * is recorded here, in localStorage, as an overlay on top of that roster. Nothing a
 * visitor does can affect what anyone else sees, and "Reset demo" clears it.
 */

const STORAGE_KEY = 'coachingcompass:demo:v1';
const CHANGE_EVENT = 'coachingcompass:demo-change';

interface Overlay {
  /** Players created or modified in this browser, keyed by id. */
  upserts: Record<string, Player>;
  /** Ids of shared sample players hidden ("deleted") in this browser. */
  deleted: string[];
}

const EMPTY: Overlay = { upserts: {}, deleted: [] };

let cachedRaw: string | null = null;
let cachedOverlay: Overlay = EMPTY;

function readOverlay(): Overlay {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY; // storage disabled (e.g. some private-browsing modes)
  }
  if (raw === cachedRaw) return cachedOverlay;
  cachedRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    cachedOverlay =
      parsed && typeof parsed === 'object'
        ? { upserts: parsed.upserts ?? {}, deleted: parsed.deleted ?? [] }
        : EMPTY;
  } catch {
    cachedOverlay = EMPTY;
  }
  return cachedOverlay;
}

function writeOverlay(next: Overlay) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.error('Could not save demo changes to localStorage:', e);
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(onChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onChange();
  };
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onStorage); // keep other tabs in sync
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onStorage);
  };
}

const getServerSnapshot = () => EMPTY;
const getHydratedServer = () => false;
const getHydratedClient = () => true;
const noopSubscribe = () => () => {};

function useOverlay(): Overlay {
  return useSyncExternalStore(subscribe, readOverlay, getServerSnapshot);
}

/** False during server render and hydration; true once localStorage has been read. */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, getHydratedClient, getHydratedServer);
}

export function savePlayer(player: Player) {
  const current = readOverlay();
  writeOverlay({
    upserts: { ...current.upserts, [player.id]: player },
    deleted: current.deleted.filter((id) => id !== player.id),
  });
}

export function removePlayer(id: string) {
  const current = readOverlay();
  const { [id]: _removed, ...upserts } = current.upserts;
  writeOverlay({
    upserts,
    deleted: current.deleted.includes(id) ? current.deleted : [...current.deleted, id],
  });
}

export function resetDemo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function newLocalPlayerId() {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `local-${random}`;
}

/** The shared roster with this visitor's local changes applied. */
export function useRoster(seedPlayers: Player[]): Player[] {
  const overlay = useOverlay();
  return useMemo(() => {
    const deleted = new Set(overlay.deleted);
    const seedIds = new Set(seedPlayers.map((p) => p.id));
    const merged = seedPlayers
      .filter((p) => !deleted.has(p.id))
      .map((p) => overlay.upserts[p.id] ?? p);
    const localOnly = Object.values(overlay.upserts).filter(
      (p) => !seedIds.has(p.id) && !deleted.has(p.id),
    );
    return [...merged, ...localOnly];
  }, [seedPlayers, overlay]);
}

/** A single player with this visitor's local changes applied, or null if absent/deleted. */
export function usePlayer(id: string, seedPlayer: Player | null): Player | null {
  const overlay = useOverlay();
  if (overlay.deleted.includes(id)) return null;
  return overlay.upserts[id] ?? seedPlayer;
}

export function useHasLocalChanges(): boolean {
  const overlay = useOverlay();
  return overlay.deleted.length > 0 || Object.keys(overlay.upserts).length > 0;
}
