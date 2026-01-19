// FILE: src/components/HeartRate/formulas.ts

import React from "react"

export type FormulaType = "custom" | "fox" | "tanaka" | "hunt" | "karvonen"

export interface FormulaInfo {
  name: string
  description: string
  calculate: (age: number, restingHr?: number) => number
  requiresRestingHr?: boolean
}

// Formula implementations
export function foxFormula(age: number) {
  return 220 - age
}

export function tanakaFormula(age: number) {
  return Math.round(208 - 0.7 * age)
}

export function huntFormula(age: number) {
  return Math.round(211 - 0.64 * age)
}

export function karvonenFormula(age: number, restingHr = 60) {
  const maxHr = 220 - age
  // here we return maxHr. If you want HRR results elsewhere, compute from this
  return Math.round(maxHr)
}

export function customFormula(_age: number, _restingHr?: number) {
  return 0
}

export const formulas: Record<FormulaType, FormulaInfo> = {
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











