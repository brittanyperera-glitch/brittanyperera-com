// Storage can be blocked, full or absent (server render); none of it may throw.
function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = store()?.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    store()?.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: persistence is best-effort
  }
}

export function removeKey(key: string): void {
  try {
    store()?.removeItem(key);
  } catch {
    // ignore: persistence is best-effort
  }
}
