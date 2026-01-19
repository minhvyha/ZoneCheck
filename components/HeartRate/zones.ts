// FILE: src/components/HeartRate/zones.ts

export type Zone = {
  label: string
  percentMin: number
  percentMax: number
  bpmMin: number
  bpmMax: number
}

const BASE_ZONE_PERCENTAGES = [
  { label: "Zone 1", min: 0.5, max: 0.6 },
  { label: "Zone 2", min: 0.6, max: 0.7 },
  { label: "Zone 3", min: 0.7, max: 0.8 },
  { label: "Zone 4", min: 0.8, max: 0.9 },
  { label: "Zone 5", min: 0.9, max: 1.0 },
]

export function computeZones(maxHr: number, restingHr: number, useHrr: boolean): Zone[] {
  const hrMax = Math.max(30, Math.round(maxHr))
  const rest = Math.max(30, Math.round(restingHr))
  const hrr = Math.max(0, hrMax - rest)

  return BASE_ZONE_PERCENTAGES.map((p) => {
    if (useHrr) {
      const bpmMin = Math.round(rest + hrr * p.min)
      const bpmMax = Math.round(rest + hrr * p.max)
      return {
        label: p.label,
        percentMin: Math.round(p.min * 100),
        percentMax: Math.round(p.max * 100),
        bpmMin,
        bpmMax,
      }
    }

    const bpmMin = Math.round(hrMax * p.min)
    const bpmMax = Math.round(hrMax * p.max)
    return {
      label: p.label,
      percentMin: Math.round(p.min * 100),
      percentMax: Math.round(p.max * 100),
      bpmMin,
      bpmMax,
    }
  })
}
