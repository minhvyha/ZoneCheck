"use client"

import React from "react"
import { useState, useCallback, useMemo } from "react"
import { Upload, Heart, Info, Calculator } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FormulaType = "custom" | "fox" | "tanaka" | "hunt" | "karvonen"

interface FormulaInfo {
  name: string
  description: string
  calculate: (age: number, restingHr?: number) => number
  requiresRestingHr?: boolean
}

type Zone = {
  label: string
  percentMin: number
  percentMax: number
  bpmMin: number
  bpmMax: number
}

/* ---------- Formula implementations as named functions ---------- */

function foxFormula(age: number) {
  return 220 - age
}

function tanakaFormula(age: number) {
  return Math.round(208 - 0.7 * age)
}

function huntFormula(age: number) {
  return Math.round(211 - 0.64 * age)
}

function karvonenFormula(age: number, restingHr = 60) {
  const maxHr = 220 - age
  return Math.round(maxHr)
}

function customFormula(_age: number, _restingHr?: number) {
  return 0
}

/* ---------- Formulas map ---------- */

const formulas: Record<FormulaType, FormulaInfo> = {
  fox: {
    name: "Fox Formula",
    description: "220 - age (Classic formula)",
    calculate: foxFormula,
  },
  tanaka: {
    name: "Tanaka Formula",
    description: "208 - (0.7 x age) (More accurate for 40+)",
    calculate: tanakaFormula,
  },
  hunt: {
    name: "HUNT Formula",
    description: "211 - (0.64 x age) (For active individuals)",
    calculate: huntFormula,
  },
  karvonen: {
    name: "Karvonen Method",
    description: "Uses heart rate reserve (HRR)",
    calculate: karvonenFormula,
    requiresRestingHr: true,
  },
  custom: {
    name: "Custom",
    description: "Enter your own max heart rate",
    calculate: customFormula,
  },
}

/* ---------- Zone percentages ---------- */

const BASE_ZONE_PERCENTAGES = [
  { label: "Zone 1", min: 0.5, max: 0.6 },
  { label: "Zone 2", min: 0.6, max: 0.7 },
  { label: "Zone 3", min: 0.7, max: 0.8 },
  { label: "Zone 4", min: 0.8, max: 0.9 },
  { label: "Zone 5", min: 0.9, max: 1.0 },
]

function computeZones(maxHr: number, restingHr: number, useHrr: boolean): Zone[] {
  const hrMax = Math.max(30, Math.round(maxHr))
  const rest = Math.max(30, Math.round(restingHr))
  const hrr = Math.max(0, hrMax - rest)

  return BASE_ZONE_PERCENTAGES.map((p) => {
    if (useHrr) {
      const bpmMin = Math.round(rest + hrr * p.min)
      const bpmMax = Math.round(rest + hrr * p.max)
      return {
        label: p.label,
        percentMin: Math.round(p.min * 100),
        percentMax: Math.round(p.max * 100),
        bpmMin,
        bpmMax,
      }
    }

    const bpmMin = Math.round(hrMax * p.min)
    const bpmMax = Math.round(hrMax * p.max)
    return {
      label: p.label,
      percentMin: Math.round(p.min * 100),
      percentMax: Math.round(p.max * 100),
      bpmMin,
      bpmMax,
    }
  })
}

/* ---------- Component ---------- */

export function InputSection() {
  const [formula, setFormula] = useState<FormulaType>("fox")
  const [age, setAge] = useState("30")
  const [restingHr, setRestingHr] = useState("60")
  const [customMaxHr, setCustomMaxHr] = useState("185")
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  /* ---------- Derived value ---------- */
  const calculatedMaxHr = useMemo(() => {
    if (formula === "custom") return parseInt(customMaxHr) || 0
    const ageNum = parseInt(age) || 30
    const restingHrNum = parseInt(restingHr) || 60
    return formulas[formula].calculate(ageNum, restingHrNum)
  }, [formula, age, restingHr, customMaxHr])

  /* ---------- Compute zones for every formula and keep them in a variable ---------- */
  const allZones = useMemo(() => {
    const ageNum = parseInt(age) || 30
    const restingNum = parseInt(restingHr) || 60
    const customNum = parseInt(customMaxHr) || 0

    return {
      fox: computeZones(foxFormula(ageNum), restingNum, false),
      tanaka: computeZones(tanakaFormula(ageNum), restingNum, false),
      hunt: computeZones(huntFormula(ageNum), restingNum, false),
      karvonen: computeZones(karvonenFormula(ageNum, restingNum), restingNum, true),
      custom: computeZones(customNum, restingNum, false),
    } as Record<FormulaType, Zone[]>
  }, [age, restingHr, customMaxHr])

  // current zones for the selected formula stored in a variable
  const zonesForSelectedFormula = allZones[formula]

  /* ---------- Handlers as named functions ---------- */

  const onFormulaChange = useCallback((value: FormulaType) => {
    setFormula(value)
  }, [])

  const onAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") {
      setAge("")
      return
    }
    const num = parseInt(val)
    if (!Number.isNaN(num)) {
      const clamped = Math.max(1, Math.min(120, num))
      setAge(String(clamped))
    }
  }, [])

  const onRestingHrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === "") {
        setRestingHr("")
        return
      }
      const num = parseInt(val)
      if (!Number.isNaN(num)) {
        setRestingHr(String(num))
      }
    },
    []
  )

  const onCustomMaxHrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (val === "") {
        setCustomMaxHr("")
        return
      }
      const num = parseInt(val)
      if (!Number.isNaN(num)) {
        const clamped = Math.max(100, Math.min(250, num))
        setCustomMaxHr(String(clamped))
      }
    },
    []
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - some browsers expose dataTransfer.dropEffect
      e.dataTransfer.dropEffect = "copy"
    } catch {
      // ignore if not supported
    }
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dt = e.dataTransfer
    if (!dt) return
    const files = dt.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isSupportedWorkoutFile(file.name)) {
        setFileName(file.name)
      }
    }
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (isSupportedWorkoutFile(file.name)) {
          setFileName(file.name)
        }
      }
    },
    []
  )

  /* ---------- Utility helpers ---------- */

  function isSupportedWorkoutFile(name: string) {
    const lower = name.toLowerCase()
    return lower.endsWith(".gpx") || lower.endsWith(".fit")
  }

  const selectedFormula = formulas[formula]

  return (
    <Card className="mb-10 border-primary/30 bg-card shadow-lg shadow-primary/5">
      <CardContent className="p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Max Heart Rate Calculator */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <Label className="text-sm font-medium text-foreground">
                Max Heart Rate Calculator
              </Label>
            </div>

            {/* Formula Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="formula"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Calculation Method
                </Label>
              </div>
              <Select
                value={formula}
                onValueChange={(v) => onFormulaChange(v as FormulaType)}
              >
                <SelectTrigger
                  id="formula"
                  className="h-11 border-border bg-input text-foreground"
                >
                  <SelectValue placeholder="Select formula" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(formulas) as FormulaType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col items-start">
                        <span>{formulas[key].name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedFormula.description}
              </p>
            </div>

            {/* Inputs based on formula */}
            <div className="grid gap-4 sm:grid-cols-2">
              {formula !== "custom" && (
                <div className="space-y-2">
                  <Label
                    htmlFor="age"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={onAgeChange}
                    placeholder="e.g. 30"
                    min="1"
                    max="120"
                    className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </div>
              )}

              {formula === "karvonen" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <Label
                      htmlFor="restingHr"
                      className="text-xs font-medium text-muted-foreground"
                    >
                      Resting HR
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 cursor-help text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Measure in the morning before getting up</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id="restingHr"
                    type="number"
                    value={restingHr}
                    onChange={onRestingHrChange}
                    placeholder="e.g. 60"
                    min="30"
                    max="120"
                    className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </div>
              )}

              {formula === "custom" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label
                    htmlFor="customMaxHr"
                    className="text-xs font-medium text-muted-foreground"
                  >
                    Your Max Heart Rate
                  </Label>
                  <Input
                    id="customMaxHr"
                    type="number"
                    value={customMaxHr}
                    onChange={onCustomMaxHrChange}
                    placeholder="e.g. 185"
                    min="100"
                    max="250"
                    className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* Calculated Result */}
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Your Max HR
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-primary">
                    {calculatedMaxHr}
                  </span>
                  <span className="text-sm text-muted-foreground">BPM</span>
                </div>
              </div>
              {formula === "karvonen" && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Heart Rate Reserve: {calculatedMaxHr - parseInt(restingHr || "60")} BPM
                </p>
              )}

              {/* Display zones for the selected formula */}
              <div className="mt-3">
                <h4 className="text-xs font-medium text-muted-foreground">Training zones</h4>
                <div className="mt-2 grid gap-2">
                  {zonesForSelectedFormula.map((z) => (
                    <div key={z.label} className="flex items-center justify-between rounded-md border border-border p-2">
                      <div className="text-sm">
                        <div className="font-medium">{z.label}</div>
                        <div className="text-xs text-muted-foreground">{z.percentMin}% - {z.percentMax}%</div>
                      </div>
                      <div className="text-sm font-semibold">{z.bpmMin} - {z.bpmMax} BPM</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Zone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <Label className="text-sm font-medium text-foreground">
                Workout File
              </Label>
            </div>
            <label
              htmlFor="file-upload"
              className={`flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all ${
                isDragOver
                  ? "border-primary bg-primary/10"
                  : fileName
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-input hover:border-primary/50 hover:bg-muted"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="file-upload"
                type="file"
                accept=".gpx,.fit"
                className="sr-only"
                onChange={handleFileChange}
              />
              <Upload
                className={`mb-2 h-8 w-8 ${
                  isDragOver || fileName ? "text-primary" : "text-muted-foreground"
                }`}
              />
              {fileName ? (
                <p className="text-sm font-medium text-primary">{fileName}</p>
              ) : (
                <>
                  <p className="text-center text-sm text-muted-foreground">
                    {"Drag 'n' drop your workout file here, or click to select"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports .gpx and .fit files
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
