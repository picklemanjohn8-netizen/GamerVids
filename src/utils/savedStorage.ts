// Client-side persistent storage helper for saved videos and watch history
// Guarantees data remains saved even when leaving the website or closing the browser.

const SAVED_VIDEOS_STORAGE_KEY = 'stream4k_saved_video_ids_v1';
const WATCH_HISTORY_STORAGE_KEY = 'stream4k_watch_history_v1';

export function getLocalSavedVideoIds(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_VIDEOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to read saved videos from localStorage:', err);
    return [];
  }
}

export function setLocalSavedVideoIds(ids: string[]): void {
  try {
    localStorage.setItem(SAVED_VIDEOS_STORAGE_KEY, JSON.stringify(ids));
  } catch (err) {
    console.warn('Failed to write saved videos to localStorage:', err);
  }
}

export const saveLocalSavedVideoIds = setLocalSavedVideoIds;

export function toggleLocalSavedVideo(videoId: string): { isSaved: boolean; ids: string[] } {
  const current = getLocalSavedVideoIds();
  const exists = current.includes(videoId);
  const next = exists ? current.filter((id) => id !== videoId) : [videoId, ...current];
  setLocalSavedVideoIds(next);
  return { isSaved: !exists, ids: next };
}

export interface WatchProgressRecord {
  timestamp: number;
  duration: number;
  updatedAt: string;
}

export function getLocalWatchHistory(): Record<string, WatchProgressRecord> {
  try {
    const raw = localStorage.getItem(WATCH_HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function setLocalWatchProgress(videoId: string, timestamp: number, duration: number): void {
  try {
    const history = getLocalWatchHistory();
    // Only track if watched more than 3 seconds and not finished (>95%)
    const pct = duration > 0 ? timestamp / duration : 0;
    if (timestamp > 3 && pct < 0.95) {
      history[videoId] = {
        timestamp: Math.floor(timestamp),
        duration: Math.floor(duration),
        updatedAt: new Date().toISOString(),
      };
    } else if (pct >= 0.95) {
      // Completed, remove resume point
      delete history[videoId];
    }
    localStorage.setItem(WATCH_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (err) {
    console.warn('Failed to save watch progress to localStorage:', err);
  }
}

export function getLocalVideoProgress(videoId: string): number | null {
  const history = getLocalWatchHistory();
  const record = history[videoId];
  if (!record || record.timestamp < 3) return null;
  return record.timestamp;
}
