"use client"

import { Download, FileText, Clock, Heart } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoneChart } from "@/components/zone-chart"
import { ZoneBreakdown } from "@/components/zone-breakdown"
import type { WorkoutAnalysis } from "@/app/page"

interface ResultCardProps {
  data: WorkoutAnalysis
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function ResultCard({ data }: ResultCardProps) {
  const { fileName, zoneTimes, zones, totalHrSeconds, avgHr } = data

  return (
    <Card className="border-border bg-secondary/50 shadow-xl">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{fileName}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formatDuration(totalHrSeconds)} Duration</span>
          </div>
          {avgHr && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Avg HR: {avgHr} bpm</span>
              </div>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <ZoneChart zoneTimes={zoneTimes} />
        <ZoneBreakdown zoneTimes={zoneTimes} zones={zones} />
      </CardContent>
      <CardFooter className="border-t border-border pt-6">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
          <Download className="mr-2 h-5 w-5" />
          Download Shareable Image
        </Button>
      </CardFooter>
    </Card>
  )
}
