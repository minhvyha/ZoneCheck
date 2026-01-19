"use client";

import React from "react";
import { useState, useCallback, useMemo } from "react";
import { Upload, Heart, Info, Calculator } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FormulaType = "custom" | "fox" | "tanaka" | "hunt" | "karvonen";

interface FormulaInfo {
  name: string;
  description: string;
  calculate: (age: number, restingHr?: number) => number;
  requiresRestingHr?: boolean;
}

type Zone = {
  label: string;
  percentMin: number;
  percentMax: number;
  bpmMin: number;
  bpmMax: number;
};

/* ---------- Formula implementations as named functions ---------- */

function foxFormula(age: number) {
  return 220 - age;
}

function tanakaFormula(age: number) {
  return Math.round(208 - 0.7 * age);
}

function huntFormula(age: number) {
  return Math.round(211 - 0.64 * age);
}

function karvonenFormula(age: number, restingHr = 60) {
  const maxHr = 220 - age;
  return Math.round(maxHr);
}

function customFormula(_age: number, _restingHr?: number) {
  return 0;
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
};

/* ---------- Zone percentages ---------- */

const BASE_ZONE_PERCENTAGES = [
  { label: "Zone 1", min: 0.5, max: 0.6 },
  { label: "Zone 2", min: 0.6, max: 0.7 },
  { label: "Zone 3", min: 0.7, max: 0.8 },
  { label: "Zone 4", min: 0.8, max: 0.9 },
  { label: "Zone 5", min: 0.9, max: 1.0 },
];

function computeZones(
  maxHr: number,
  restingHr: number,
  useHrr: boolean,
): Zone[] {
  const hrMax = Math.max(30, Math.round(maxHr));
  const rest = Math.max(30, Math.round(restingHr));
  const hrr = Math.max(0, hrMax - rest);

  return BASE_ZONE_PERCENTAGES.map((p) => {
    if (useHrr) {
      const bpmMin = Math.round(rest + hrr * p.min);
      const bpmMax = Math.round(rest + hrr * p.max);
      return {
        label: p.label,
        percentMin: Math.round(p.min * 100),
        percentMax: Math.round(p.max * 100),
        bpmMin,
        bpmMax,
      };
    }

    const bpmMin = Math.round(hrMax * p.min);
    const bpmMax = Math.round(hrMax * p.max);
    return {
      label: p.label,
      percentMin: Math.round(p.min * 100),
      percentMax: Math.round(p.max * 100),
      bpmMin,
      bpmMax,
    };
  });
}

/* ---------- Component ---------- */

export function InputSection() {
  const [formula, setFormula] = useState<FormulaType>("fox");
  const [age, setAge] = useState("30");
  const [restingHr, setRestingHr] = useState("60");
  const [customMaxHr, setCustomMaxHr] = useState("185");
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [zoneAnalysis, setZoneAnalysis] = useState<any | null>(null);

  /* ---------- Derived value ---------- */
  const calculatedMaxHr = useMemo(() => {
    if (formula === "custom") return parseInt(customMaxHr) || 0;
    const ageNum = parseInt(age) || 30;
    const restingHrNum = parseInt(restingHr) || 60;
    return formulas[formula].calculate(ageNum, restingHrNum);
  }, [formula, age, restingHr, customMaxHr]);

  /* ---------- Compute zones for every formula and keep them in a variable ---------- */
  const allZones = useMemo(() => {
    const ageNum = parseInt(age) || 30;
    const restingNum = parseInt(restingHr) || 60;
    const customNum = parseInt(customMaxHr) || 0;

    return {
      fox: computeZones(foxFormula(ageNum), restingNum, false),
      tanaka: computeZones(tanakaFormula(ageNum), restingNum, false),
      hunt: computeZones(huntFormula(ageNum), restingNum, false),
      karvonen: computeZones(
        karvonenFormula(ageNum, restingNum),
        restingNum,
        true,
      ),
      custom: computeZones(customNum, restingNum, false),
    } as Record<FormulaType, Zone[]>;
  }, [age, restingHr, customMaxHr]);

  // current zones for the selected formula stored in a variable
  const zonesForSelectedFormula = allZones[formula];

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!isSupportedWorkoutFile(file.name)) return;
      setFileName(file.name);

      try {
        let samples: Sample[] = [];
        if (file.name.toLowerCase().endsWith(".gpx")) {
          samples = await parseGpxFile(file);
        } else if (file.name.toLowerCase().endsWith(".fit")) {
          samples = await parseFitFile(file);
        }

        // if no HR samples found
        if (!samples.length || samples.every((s) => s.hr == null)) {
          setZoneAnalysis({ error: "No heart rate data found in file." });
          return;
        }

        // compute zones for the currently selected formula
        const ageNum = parseInt(age) || 30;
        const restingNum = parseInt(restingHr) || 60;
        const maxHr =
          formula === "custom"
            ? parseInt(customMaxHr) || 0
            : formulas[formula].calculate(ageNum, restingNum);
        const useHrr = formula === "karvonen";
        const zones = computeZones(maxHr, restingNum, useHrr);

        const analysis = computeTimeInZonesFromSamples(samples, zones);
        setZoneAnalysis({ samplesCount: samples.length, zones, ...analysis });
      } catch (err) {
        console.error(err);
        setZoneAnalysis({ error: "Failed to parse file." });
      }
    },
    [formula, age, restingHr, customMaxHr],
  );

  /* ---------- Handlers as named functions ---------- */

  const onFormulaChange = useCallback((value: FormulaType) => {
    setFormula(value);
  }, []);

  const onAgeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      setAge("");
      return;
    }
    const num = parseInt(val);
    if (!Number.isNaN(num)) {
      const clamped = Math.max(1, Math.min(120, num));
      setAge(String(clamped));
    }
  }, []);

  const onRestingHrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") {
        setRestingHr("");
        return;
      }
      const num = parseInt(val);
      if (!Number.isNaN(num)) {
        setRestingHr(String(num));
      }
    },
    [],
  );

  const onCustomMaxHrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      if (val === "") {
        setCustomMaxHr("");
        return;
      }
      const num = parseInt(val);
      if (!Number.isNaN(num)) {
        const clamped = Math.max(100, Math.min(250, num));
        setCustomMaxHr(String(clamped));
      }
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - some browsers expose dataTransfer.dropEffect
      e.dataTransfer.dropEffect = "copy";
    } catch {
      // ignore if not supported
    }
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    const files = dt.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (isSupportedWorkoutFile(file.name)) {
        setFileName(file.name);
      }
    }
  }, []);

  /* ---------- Utility helpers ---------- */

  function isSupportedWorkoutFile(name: string) {
    const lower = name.toLowerCase();
    return lower.endsWith(".gpx") || lower.endsWith(".fit");
  }

  const selectedFormula = formulas[formula];

  type Sample = { time: number /* epoch ms */; hr: number | null };
  type ZoneTime = { label: string; seconds: number; percent: number };

  // --- GPX parser (browser friendly) ---
  async function parseGpxFile(file: File): Promise<Sample[]> {
    const text = await file.text();
    const doc = new DOMParser().parseFromString(text, "application/xml");
    const trkpts = Array.from(doc.getElementsByTagName("trkpt"));
    const samples: Sample[] = trkpts.map((tp) => {
      // time
      const timeEl = tp.getElementsByTagName("time")[0];
      const time = timeEl ? Date.parse(timeEl.textContent || "") : NaN;

      // hr can be <hr> or inside <extensions> as <gpxtpx:TrackPointExtension><gpxtpx:hr>NN</gpxtpx:hr></...>
      let hr: number | null = null;
      const hrEl = tp.getElementsByTagName("hr")[0];
      if (hrEl && hrEl.textContent) {
        hr = parseInt(hrEl.textContent, 10);
      } else {
        const exts = tp.getElementsByTagName("extensions");
        if (exts.length) {
          const extText = exts[0].innerHTML || exts[0].textContent || "";
          const m = extText.match(/<gpxtpx:hr>(\d+)<\/gpxtpx:hr>/);
          if (m) hr = parseInt(m[1], 10);
        }
      }

      return { time: Number.isNaN(time) ? Date.now() : time, hr: hr ?? null };
    });

    // filter out entries with no time, keep order
    return samples.filter((s) => !!s.time);
  }

  // --- FIT parser using `fit-file-parser` ---
  async function parseFitFile(file: File): Promise<Sample[]> {
    // dynamic import so bundlers can handle optional dependency
    const { default: FitParser } = await import("fit-file-parser");
    const parser = new FitParser({
      force: true,
      speedUnit: "km/h",
      lengthUnit: "m",
    });

    const buffer = await file.arrayBuffer();
    return await new Promise<Sample[]>((resolve, reject) => {
      parser.parse(buffer as any, (err: any, data: any) => {
        if (err) return reject(err);
        // data.records is an array of record objects
        const records = data.records || [];
        const samples: Sample[] = records
          .filter((r: any) => r.timestamp) // only records with timestamp
          .map((r: any) => ({
            time: new Date(r.timestamp).getTime(),
            hr: typeof r.heart_rate === "number" ? r.heart_rate : null,
          }));
        resolve(samples);
      });
    });
  }

  // --- Compute time-in-zone using your zones ---
  function computeTimeInZonesFromSamples(samples: Sample[], zones: Zone[]) {
    // make sure samples sorted by time
    const s = samples.slice().sort((a, b) => a.time - b.time);

    const zoneSeconds: Record<string, number> = {};
    zones.forEach((z) => (zoneSeconds[z.label] = 0));

    let totalHrSeconds = 0;

    if (s.length < 2) {
      return {
        zoneSeconds,
        totalHrSeconds: 0,
        avgHr: null,
        maxHr: null,
        minHr: null,
      };
    }

    // iterate intervals between consecutive samples
    for (let i = 0; i < s.length - 1; i++) {
      const a = s[i];
      const b = s[i + 1];
      if (a.hr == null && b.hr == null) continue;
      const dt = Math.max(0, (b.time - a.time) / 1000); // seconds
      // average HR across interval (simple approach)
      const hrA = a.hr ?? b.hr;
      const hrB = b.hr ?? a.hr;
      if (hrA == null || hrB == null) continue;
      const avgHr = Math.round((hrA + hrB) / 2);
      // find zone containing avgHr
      const zone = zones.find((z) => avgHr >= z.bpmMin && avgHr <= z.bpmMax);
      if (zone) {
        zoneSeconds[zone.label] += dt;
        totalHrSeconds += dt;
      } else {
        // HR outside defined zones - could be below zone1 or above zone5
        // decide what to do; we'll ignore for the zone totals but still count
        totalHrSeconds += dt;
      }
    }

    // compute stats
    const hrValues = s.map((x) => x.hr).filter(Boolean) as number[];
    const avgHr = hrValues.length
      ? Math.round(hrValues.reduce((a, b) => a + b, 0) / hrValues.length)
      : null;
    const maxHr = hrValues.length ? Math.max(...hrValues) : null;
    const minHr = hrValues.length ? Math.min(...hrValues) : null;

    // convert to percentages and array
    const zoneTimes: ZoneTime[] = zones.map((z) => {
      const sec = zoneSeconds[z.label] || 0;
      return {
        label: z.label,
        seconds: Math.round(sec),
        percent: totalHrSeconds ? Math.round((sec / totalHrSeconds) * 100) : 0,
      };
    });

    return {
      zoneTimes,
      totalHrSeconds: Math.round(totalHrSeconds),
      avgHr,
      maxHr,
      minHr,
    };
  }

  return (
    <>
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
                    isDragOver || fileName
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                />
                {fileName ? (
                  <p className="text-sm font-medium text-primary">{fileName}</p>
                ) : (
                  <>
                    <p className="text-center text-sm text-muted-foreground">
                      {
                        "Drag 'n' drop your workout file here, or click to select"
                      }
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
      {/* Calculated Result */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-10">
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
            Heart Rate Reserve: {calculatedMaxHr - parseInt(restingHr || "60")}{" "}
            BPM
          </p>
        )}

        {/* Display zones for the selected formula */}
        <div className="">
          <h4 className="text-xs font-medium text-muted-foreground">
            Training zones
          </h4>
          <div className="mt-2 grid gap-2">
            {zonesForSelectedFormula.map((z) => (
              <div
                key={z.label}
                className="flex items-center justify-between rounded-md border border-border p-2"
              >
                <div className="text-sm">
                  <div className="font-medium">{z.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {z.percentMin}% - {z.percentMax}%
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {z.bpmMin} - {z.bpmMax} BPM
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
     
    </>
  );
}
