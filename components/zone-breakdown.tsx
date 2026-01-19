"use client"

interface ZoneTime {
  label: string
  seconds: number
  percent: number
}

interface Zone {
  label: string
  percentMin: number
  percentMax: number
  bpmMin: number
  bpmMax: number
}

interface ZoneBreakdownProps {
  zoneTimes: ZoneTime[]
  zones: Zone[]
}

const ZONE_CONFIG: Record<string, { name: string; color: string }> = {
  "Zone 1": { name: "Zone 1 - Recovery", color: "#6b7280" },
  "Zone 2": { name: "Zone 2 - Easy", color: "#00d4ff" },
  "Zone 3": { name: "Zone 3 - Aerobic", color: "#22c55e" },
  "Zone 4": { name: "Zone 4 - Threshold", color: "#f97316" },
  "Zone 5": { name: "Zone 5 - Max", color: "#ef4444" },
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs} secs`
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} mins`
}

export function ZoneBreakdown({ zoneTimes, zones }: ZoneBreakdownProps) {
  // Combine zone times with zone BPM ranges
  const combinedZones = zoneTimes.map((zt) => {
    const zone = zones.find((z) => z.label === zt.label)
    const config = ZONE_CONFIG[zt.label]
    return {
      name: config?.name || zt.label,
      bpmRange: zone ? `${zone.bpmMin}-${zone.bpmMax} bpm` : "",
      time: formatTime(zt.seconds),
      percentage: zt.percent,
      color: config?.color || "#6b7280",
    }
  })
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Zone Breakdown
      </h3>
      <div className="grid gap-2">
        {combinedZones.map((zone) => (
          <div
            key={zone.name}
            className="flex items-center justify-between rounded-lg bg-card p-3 transition-colors hover:bg-card/80"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: zone.color }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">{zone.name}</p>
                <p className="text-xs text-muted-foreground">{zone.bpmRange}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {zone.time}
              </p>
              <p className="text-xs text-muted-foreground">
                ({zone.percentage}%)
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
