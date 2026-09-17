export function calculateRequiredAverageSpeed(distanceMeters: number, seconds: number): number | null {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0 || !Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.round(((distanceMeters / 1000) / (seconds / 3600)) * 100) / 100;
}
