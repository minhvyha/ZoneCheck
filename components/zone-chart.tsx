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

const zoneData = [
  { name: "Zone Distribution", zone1: 8, zone2: 52, zone3: 22, zone4: 13, zone5: 5 },
]



const COLORS = {
  zone1: "#6b7280", // Grey
  zone2: "#00d4ff", // Electric Cyan
  zone3: "#22c55e", // Green
  zone4: "#f97316", // Orange
  zone5: "#ef4444", // Red
}

const ZONE_LABELS = {
  zone1: "Zone 1",
  zone2: "Zone 2",
  zone3: "Zone 3",
  zone4: "Zone 4",
  zone5: "Zone 5",
}

export function ZoneChart({  }) {
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
            <Tooltip
              cursor={false}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0]
                  const zoneName = ZONE_LABELS[data.dataKey as keyof typeof ZONE_LABELS]
                  return (
                    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
                      <p className="text-sm font-medium text-foreground">
                        {zoneName}: {data.value}%
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="zone1" stackId="a" radius={[8, 0, 0, 8]}>
              <Cell fill={COLORS.zone1} />
            </Bar>
            <Bar dataKey="zone2" stackId="a">
              <Cell fill={COLORS.zone2} />
            </Bar>
            <Bar dataKey="zone3" stackId="a">
              <Cell fill={COLORS.zone3} />
            </Bar>
            <Bar dataKey="zone4" stackId="a">
              <Cell fill={COLORS.zone4} />
            </Bar>
            <Bar dataKey="zone5" stackId="a" radius={[0, 8, 8, 0]}>
              <Cell fill={COLORS.zone5} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {Object.entries(COLORS).map(([zone, color]) => (
          <div key={zone} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-muted-foreground">
              {ZONE_LABELS[zone as keyof typeof ZONE_LABELS]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
