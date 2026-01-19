// FILE: src/components/HeartRate/InputSection.tsx

"use client"

import React, { useCallback, useMemo, useState } from "react"
import FormulaSelect from "./HeartRate/FormulaSelect"
import FileUploader from "./HeartRate/FileUploader"
import ResultCard from "./HeartRate/ResultCard"
import { formulas, FormulaType } from "./HeartRate/formulas"
import { computeZones } from "./HeartRate/zones"
import { isSupportedWorkoutFile } from "./HeartRate/utils"
import { Label } from "./ui/label"

export function InputSection() {
  const [formula, setFormula] = useState<FormulaType>("fox")
  const [age, setAge] = useState("30")
  const [restingHr, setRestingHr] = useState("60")
  const [customMaxHr, setCustomMaxHr] = useState("185")
  const [isDragOver, setIsDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const calculatedMaxHr = useMemo(() => {
    if (formula === "custom") return parseInt(customMaxHr) || 0
    const ageNum = parseInt(age) || 30
    const restingHrNum = parseInt(restingHr) || 60
    return formulas[formula].calculate(ageNum, restingHrNum)
  }, [formula, age, restingHr, customMaxHr])

  const allZones = useMemo(() => {
    const ageNum = parseInt(age) || 30
    const restingNum = parseInt(restingHr) || 60
    const customNum = parseInt(customMaxHr) || 0

    return {
      fox: computeZones(formulas.fox.calculate(ageNum), restingNum, false),
      tanaka: computeZones(formulas.tanaka.calculate(ageNum), restingNum, false),
      hunt: computeZones(formulas.hunt.calculate(ageNum), restingNum, false),
      karvonen: computeZones(formulas.karvonen.calculate(ageNum, restingNum), restingNum, true),
      custom: computeZones(customNum, restingNum, false),
    } as Record<FormulaType, ReturnType<typeof computeZones>>
  }, [age, restingHr, customMaxHr])

  const zonesForSelectedFormula = allZones[formula]

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

  const onRestingHrChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") {
      setRestingHr("")
      return
    }
    const num = parseInt(val)
    if (!Number.isNaN(num)) {
      setRestingHr(String(num))
    }
  }, [])

  const onCustomMaxHrChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [])

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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (isSupportedWorkoutFile(file.name)) {
        setFileName(file.name)
      }
    }
  }, [])

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <span className="sr-only">heart icon</span>
          </div>
        </div>

        <FormulaSelect value={formula} onChange={onFormulaChange} />

        <div className="grid gap-4 sm:grid-cols-2">
          {formula !== "custom" && (
            <div className="space-y-2">
              <Label htmlFor="age" className="text-xs font-medium text-muted-foreground">
                Age
              </Label>
              <input id="age" type="number" value={age} onChange={onAgeChange} placeholder="e.g. 30" min={1} max={120} className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" />
            </div>
          )}

          {formula === "karvonen" && (
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Label htmlFor="restingHr" className="text-xs font-medium text-muted-foreground">Resting HR</Label>
              </div>
              <input id="restingHr" type="number" value={restingHr} onChange={onRestingHrChange} placeholder="e.g. 60" min={30} max={120} className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" />
            </div>
          )}

          {formula === "custom" && (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="customMaxHr" className="text-xs font-medium text-muted-foreground">Your Max Heart Rate</Label>
              <input id="customMaxHr" type="number" value={customMaxHr} onChange={onCustomMaxHrChange} placeholder="e.g. 185" min={100} max={250} className="h-11 border-border bg-input text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary" />
            </div>
          )}

        </div>

        <ResultCard calculatedMaxHr={calculatedMaxHr} formula={formula} restingHr={restingHr} zones={zonesForSelectedFormula} />
      </div>

      <FileUploader
        isDragOver={isDragOver}
        fileName={fileName}
        setFileName={setFileName}
        handleDragOver={handleDragOver}
        handleDragLeave={handleDragLeave}
        handleDrop={handleDrop}
        handleFileChange={handleFileChange}
      />
    </div>
  )
}

export default InputSection