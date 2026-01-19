// FILE: src/components/HeartRate/FileUploader.tsx

import React from "react"
import { Upload } from "lucide-react"
import { isSupportedWorkoutFile } from "./utils"

type Props = {
  isDragOver: boolean
  fileName: string | null
  setFileName: (name: string | null) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => void
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function FileUploader({
  isDragOver,
  fileName,
  setFileName,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  handleFileChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Upload className="h-4 w-4 text-primary" />
        </div>
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
        <input id="file-upload" type="file" accept=".gpx,.fit" className="sr-only" onChange={handleFileChange} />
        <Upload className={`mb-2 h-8 w-8 ${isDragOver || fileName ? "text-primary" : "text-muted-foreground"}`} />
        {fileName ? (
          <p className="text-sm font-medium text-primary">{fileName}</p>
        ) : (
          <>
            <p className="text-center text-sm text-muted-foreground">{"Drag 'n' drop your workout file here, or click to select"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Supports .gpx and .fit files</p>
          </>
        )}
      </label>
    </div>
  )
}