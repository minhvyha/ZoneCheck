"use client"

import { useState } from "react"
import { HeroHeader } from "@/components/hero-header"
import { InputSection } from "@/components/input-section"
import { ResultCard } from "@/components/result-card"

export interface ZoneTime {
  label: string
  seconds: number
  percent: number
}

export interface Zone {
  label: string
  percentMin: number
  percentMax: number
  bpmMin: number
  bpmMax: number
}

export interface WorkoutAnalysis {
  fileName: string
  zoneTimes: ZoneTime[]
  zones: Zone[]
  totalHrSeconds: number
  avgHr: number | null
  maxHr: number | null
  minHr: number | null
  error?: string
}

export default function Page() {
  const [workoutAnalysis, setWorkoutAnalysis] = useState<WorkoutAnalysis | null>(null)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <HeroHeader />
        <InputSection onAnalysisComplete={setWorkoutAnalysis} />
        {workoutAnalysis && !workoutAnalysis.error && (
          <ResultCard data={workoutAnalysis} />
        )}
      </div>
    </main>
  )
}
