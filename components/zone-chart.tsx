"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"

interface ZoneTime {
  label: string
  seconds: number
  percent: number
}

interface ZoneChartProps {
  zoneTimes: ZoneTime[]
}

const ZONE_CONFIG: Record<string, { label: string; color: string }> = {
  zone1: { label: "Zone 1", color: "#6b7280" },
  zone2: { label: "Zone 2", color: "#00d4ff" },
  zone3: { label: "Zone 3", color: "#22c55e" },
  zone4: { label: "Zone 4", color: "#f97316" },
  zone5: { label: "Zone 5", color: "#ef4444" },
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) {
    return `${secs}s`
  }
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

export function ZoneChart({ zoneTimes }: ZoneChartProps) {
  // Create a lookup map for zone data
  const zoneDataMap = Object.fromEntries(
    zoneTimes.map((zt) => [zt.label, zt])
  )

  // Transform zoneTimes into the format needed for the stacked bar chart
  const zoneData = [
    {
      name: "Zone Distribution",
      zone1: zoneTimes.find((z) => z.label === "Zone 1")?.percent || 0,
      zone2: zoneTimes.find((z) => z.label === "Zone 2")?.percent || 0,
      zone3: zoneTimes.find((z) => z.label === "Zone 3")?.percent || 0,
      zone4: zoneTimes.find((z) => z.label === "Zone 4")?.percent || 0,
      zone5: zoneTimes.find((z) => z.label === "Zone 5")?.percent || 0,
    },
  ]

  return (
    <div className="mb-8">
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Time in Zone Distribution
      </h3>
      <div className="h-16 w-full overflow-hidden rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={zoneData}
            layout="vertical"
            margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            barCategoryGap={0}
          >
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis type="category" dataKey="name" hide />
            
            <Bar dataKey="zone1" stackId="a" radius={[8, 0, 0, 8]}>
              <Cell fill={ZONE_CONFIG.zone1.color} />
            </Bar>
            <Bar dataKey="zone2" stackId="a">
              <Cell fill={ZONE_CONFIG.zone2.color} />
            </Bar>
            <Bar dataKey="zone3" stackId="a">
              <Cell fill={ZONE_CONFIG.zone3.color} />
            </Bar>
            <Bar dataKey="zone4" stackId="a">
              <Cell fill={ZONE_CONFIG.zone4.color} />
            </Bar>
            <Bar dataKey="zone5" stackId="a" radius={[0, 8, 8, 0]}>
              <Cell fill={ZONE_CONFIG.zone5.color} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {Object.entries(ZONE_CONFIG).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
