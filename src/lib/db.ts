import type { Podcast, UserPrefs } from './types';

const DB_NAME = 'podcats-db';
const DB_VERSION = 1;
const STORE_NAME = 'state';

function hasIndexedDb(): boolean {
  return typeof indexedDB !== 'undefined';
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDb()) {
      reject(new Error('indexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open DB'));
  });
}

async function saveState<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error('Failed to save state'));
    });
    db.close();
  } catch (err) {
    console.warn('[podcats] Failed to save state', err);
  }
}

async function loadState<T>(key: string, fallback: T): Promise<T> {
  try {
    const db = await openDB();
    const result = await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? fallback);
      req.onerror = () => reject(req.error ?? new Error('Failed to read state'));
    });
    db.close();
    return result;
  } catch (err) {
    console.warn('[podcats] Failed to load state', err);
    return fallback;
  }
}

export function savePodcasts(podcasts: Podcast[]) {
  return saveState<Podcast[]>('podcasts', podcasts);
}

export function loadPodcasts(): Promise<Podcast[]> {
  return loadState<Podcast[]>('podcasts', []);
}

export function savePrefs(prefs: UserPrefs) {
  return saveState<UserPrefs>('prefs', prefs);
}

export function loadPrefs(): Promise<UserPrefs | null> {
  return loadState<UserPrefs | null>('prefs', null);
}
