export function readJSON<T>(key: string, fallback: T): T {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(stored) as T;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

export function writeJSON<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export function appendItem<T extends { id: string }>(
  key: string,
  item: T
): T {
  const items = readJSON<T[]>(key, []);
  items.push(item);
  writeJSON(key, items);
  return item;
}

export function updateItem<T extends { id: string }>(
  key: string,
  id: string,
  updater: (item: T) => T
): T | undefined {
  const items = readJSON<T[]>(key, []);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return undefined;
  const updated = updater(items[idx]);
  items[idx] = updated;
  writeJSON(key, items);
  return updated;
}

export function removeItem<T extends { id: string }>(
  key: string,
  id: string
): boolean {
  const items = readJSON<T[]>(key, []);
  const idx = items.findIndex((item) => item.id === id);
  if (idx === -1) return false;
  items.splice(idx, 1);
  writeJSON(key, items);
  return true;
}
