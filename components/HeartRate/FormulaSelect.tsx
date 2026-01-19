// FILE: src/components/HeartRate/FormulaSelect.tsx

import React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator } from "lucide-react"
import { Label } from "@/components/ui/label"
import { formulas, FormulaType } from "./formulas"

type Props = {
  value: FormulaType
  onChange: (v: FormulaType) => void
}

export default function FormulaSelect({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="formula" className="text-xs font-medium text-muted-foreground">
          Calculation Method
        </Label>
      </div>

      <Select value={value} onValueChange={(v) => onChange(v as FormulaType)}>
        <SelectTrigger id="formula" className="h-11 border-border bg-input text-foreground">
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
      <p className="text-xs text-muted-foreground">{formulas[value].description}</p>
    </div>
  )
}