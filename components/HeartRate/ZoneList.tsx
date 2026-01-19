
// FILE: src/components/HeartRate/ZoneList.tsx

import React from "react"
import { Zone } from "./zones"

type Props = {
  zones: Zone[]
}

export default function ZoneList({ zones }: Props) {
  return (
    <div className="mt-2 grid gap-2">
      {zones.map((z) => (
        <div key={z.label} className="flex items-center justify-between rounded-md border border-border p-2">
          <div className="text-sm">
            <div className="font-medium">{z.label}</div>
            <div className="text-xs text-muted-foreground">{z.percentMin}% - {z.percentMax}%</div>
          </div>
          <div className="text-sm font-semibold">{z.bpmMin} - {z.bpmMax} BPM</div>
        </div>
      ))}
    </div>
  )
}
