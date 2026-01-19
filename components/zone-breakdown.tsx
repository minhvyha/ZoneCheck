"use client"

const zones = [
  {
    name: "Zone 1 - Recovery",
    bpmRange: "111-130 bpm",
    time: "8 mins",
    percentage: 8,
    color: "#6b7280",
  },
  {
    name: "Zone 2 - Easy",
    bpmRange: "130-145 bpm",
    time: "55 mins",
    percentage: 52,
    color: "#00d4ff",
  },
  {
    name: "Zone 3 - Aerobic",
    bpmRange: "145-157 bpm",
    time: "23 mins",
    percentage: 22,
    color: "#22c55e",
  },
  {
    name: "Zone 4 - Threshold",
    bpmRange: "157-172 bpm",
    time: "14 mins",
    percentage: 13,
    color: "#f97316",
  },
  {
    name: "Zone 5 - Max",
    bpmRange: "172-185 bpm",
    time: "5 mins",
    percentage: 5,
    color: "#ef4444",
  },
]

export function ZoneBreakdown({}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Zone Breakdown
      </h3>
      <div className="grid gap-2">
        {zones.map((zone) => (
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
