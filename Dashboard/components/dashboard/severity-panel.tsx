"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SeverityData } from "@/lib/dashboard-data"
import { getSeverityColor, getSeverityProgressColor } from "@/lib/dashboard-data"
import { BarChart3 } from "lucide-react"

interface SeverityPanelProps {
  data: SeverityData
}

export function SeverityPanel({ data }: SeverityPanelProps) {
  const progressPercent = (data.score / 10) * 100
  const color = getSeverityColor(data.classification)
  const barColor = getSeverityProgressColor(data.classification)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <BarChart3 className="size-4 text-primary" aria-hidden="true" />
          Severity Classification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {/* Score Display */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Severity Score
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`font-mono text-4xl font-black tracking-tight ${color}`}>
                  {data.score.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground/70">/10</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-sm font-bold ${
              data.classification === "Minor" ? "border-status-normal/50 text-status-normal" :
              data.classification === "Moderate" ? "border-status-warning/50 text-status-warning" :
              "border-status-danger/50 text-status-danger"
            }`}>
              {data.classification}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground/70">
              <span>Safe</span>
              <span>Critical</span>
            </div>
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                style={{ width: `${progressPercent}%` }}
              />
              {/* Scale Markers */}
              <div className="absolute inset-0 flex items-center justify-between px-0">
                {[...Array(11)].map((_, i) => (
                  <div
                    key={i}
                    className="h-3 w-px bg-background/30"
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground/50">
              <span>0</span>
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
              <span>10</span>
            </div>
          </div>

          {/* Classification Zones */}
          <div className="grid grid-cols-3 gap-2">
            <div className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 ${
              data.classification === "Minor" ? "border-status-normal/50 bg-status-normal/10" : "border-border/30 bg-transparent"
            }`}>
              <div className={`size-2 rounded-full ${data.classification === "Minor" ? "bg-status-normal" : "bg-muted-foreground/30"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                data.classification === "Minor" ? "text-status-normal" : "text-muted-foreground/40"
              }`}>Minor</span>
              <span className="text-[9px] text-muted-foreground/50">0-3</span>
            </div>
            <div className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 ${
              data.classification === "Moderate" ? "border-status-warning/50 bg-status-warning/10" : "border-border/30 bg-transparent"
            }`}>
              <div className={`size-2 rounded-full ${data.classification === "Moderate" ? "bg-status-warning" : "bg-muted-foreground/30"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                data.classification === "Moderate" ? "text-status-warning" : "text-muted-foreground/40"
              }`}>Moderate</span>
              <span className="text-[9px] text-muted-foreground/50">4-6</span>
            </div>
            <div className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 ${
              data.classification === "Severe" ? "border-status-danger/50 bg-status-danger/10" : "border-border/30 bg-transparent"
            }`}>
              <div className={`size-2 rounded-full ${data.classification === "Severe" ? "bg-status-danger" : "bg-muted-foreground/30"}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                data.classification === "Severe" ? "text-status-danger" : "text-muted-foreground/40"
              }`}>Severe</span>
              <span className="text-[9px] text-muted-foreground/50">7-10</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
