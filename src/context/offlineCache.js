export const STATE_CACHE_KEY = 'eu2027_cache';
export const RATE_CACHE_KEY = 'eu2027_rate_cache';
export const PENDING_SYNC_KEY = 'eu2027_pending_sync';

export function readCache(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage no disponible (modo privado, cuota excedida, etc.) — se ignora
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}
