"use client"

import { Download, Calendar, Clock, Heart } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ZoneChart } from "@/components/zone-chart"
import { ZoneBreakdown } from "@/components/zone-breakdown"

const workoutData = {
  title: "Saturday Morning Long Run",
  duration: "1:45:30",
  avgHr: 138,
}

export function ResultCard() {
  return (
    <Card className="border-border bg-secondary/50 shadow-xl">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{workoutData.title}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{workoutData.duration} Duration</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg HR: {workoutData.avgHr} bpm</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-6">
        <ZoneChart />
        <ZoneBreakdown />
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
