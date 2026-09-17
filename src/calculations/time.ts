export function timestampMs(value?: string): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function durationSeconds(start?: string, end?: string): number | null {
  const startMs = timestampMs(start);
  const endMs = timestampMs(end);
  if (startMs === null || endMs === null || endMs < startMs) return null;
  return Math.floor((endMs - startMs) / 1000);
}

export const calculateDurationSeconds = (start: string, end: string): number => durationSeconds(start, end) ?? 0;
export const calculateWaitingTime = durationSeconds;
export const calculateDeliveryDuration = durationSeconds;
