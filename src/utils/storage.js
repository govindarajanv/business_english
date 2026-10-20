// Safe localStorage helpers with in-memory fallback for non-browser environments.

export const STORAGE_KEYS = {
  seenIds: 'businessEnglish.seenIds',
  voiceName: 'businessEnglish.voiceName',
  rate: 'businessEnglish.rate',
};

export function getItem(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / availability errors
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
