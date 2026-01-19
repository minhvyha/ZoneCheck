// FILE: src/components/HeartRate/ResultCard.tsx

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Heart } from "lucide-react"
import ZoneList from "./ZoneList"
import { Zone } from "./zones"

type Props = {
  calculatedMaxHr: number
  formula: string
  restingHr: string
  zones: Zone[]
}

export default function ResultCard({ calculatedMaxHr, formula, restingHr, zones }: Props) {
  return (
    <Card className="mb-10 border-primary/30 bg-card shadow-lg shadow-primary/5">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <Label className="text-sm font-medium text-foreground">Max Heart Rate</Label>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Your Max HR</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-primary">{calculatedMaxHr}</span>
                <span className="text-sm text-muted-foreground">BPM</span>
              </div>
            </div>

            {formula === "karvonen" && (
              <p className="mt-2 text-xs text-muted-foreground">
                Heart Rate Reserve: {calculatedMaxHr - parseInt(restingHr || "60")} BPM
              </p>
            )}

            <div className="mt-3">
              <h4 className="text-xs font-medium text-muted-foreground">Training zones</h4>
              <ZoneList zones={zones} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}