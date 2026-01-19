"use client"

import { Activity } from "lucide-react"

export function HeroHeader() {
  return (
    <header className="mb-4 text-center">
      <div className="mb-6 flex items-center justify-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
          <Activity className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Zone<span className="text-primary">Check</span>
        </h1>
      </div>
      <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
        Visualize your training zones from raw GPX/FIT files.
      </p>
    </header>
  )
}
