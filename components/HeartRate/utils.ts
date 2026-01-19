// FILE: src/components/HeartRate/utils.ts

export function isSupportedWorkoutFile(name: string) {
  const lower = name.toLowerCase()
  return lower.endsWith(".gpx") || lower.endsWith(".fit")
}