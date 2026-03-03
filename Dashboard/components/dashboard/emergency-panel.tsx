"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EmergencyData } from "@/lib/dashboard-data"
import { ShieldCheck, Timer, AlertTriangle } from "lucide-react"

interface EmergencyPanelProps {
  data: EmergencyData
}

function getStateStyles(state: EmergencyData["state"]) {
  switch (state) {
    case "NORMAL":
      return {
        borderClass: "border-status-normal/30",
        bgClass: "bg-status-normal/5",
        textClass: "text-status-normal",
        badgeClass: "bg-status-normal/20 text-status-normal border-status-normal/30",
        label: "NORMAL",
        pulseClass: "",
      }
    case "COUNTDOWN_ACTIVE":
      return {
        borderClass: "border-status-warning/50",
        bgClass: "bg-status-warning/5",
        textClass: "text-status-warning",
        badgeClass: "bg-status-warning/20 text-status-warning border-status-warning/30",
        label: "COUNTDOWN ACTIVE",
        pulseClass: "animate-pulse",
      }
    case "EMERGENCY_CONFIRMED":
      return {
        borderClass: "border-status-danger/50",
        bgClass: "bg-status-danger/5",
        textClass: "text-status-danger",
        badgeClass: "bg-status-danger/20 text-status-danger border-status-danger/30",
        label: "EMERGENCY CONFIRMED",
        pulseClass: "animate-pulse",
      }
  }
}

export function EmergencyPanel({ data }: EmergencyPanelProps) {
  const styles = getStateStyles(data.state)

  return (
    <Card className={`${styles.borderClass} ${styles.bgClass} transition-all duration-500`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <ShieldCheck className={`size-4 ${styles.textClass}`} aria-hidden="true" />
          Emergency Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-5">
          {/* State Indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 ${styles.badgeClass} ${styles.pulseClass}`}>
              <span className={`size-2 rounded-full ${styles.textClass === "text-status-normal" ? "bg-status-normal" : styles.textClass === "text-status-warning" ? "bg-status-warning" : "bg-status-danger"}`} />
              <span className="text-xs font-bold tracking-widest">{styles.label}</span>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Timer className="size-3.5" aria-hidden="true" />
              <span className="text-[10px] uppercase tracking-wider">Countdown</span>
            </div>
            <span className={`font-mono text-5xl font-black tracking-tight ${
              data.state === "COUNTDOWN_ACTIVE" ? "text-status-warning" :
              data.state === "EMERGENCY_CONFIRMED" ? "text-status-danger" :
              "text-muted-foreground/50"
            }`}>
              {data.state === "NORMAL" ? "--" : data.countdown.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground">SECONDS REMAINING</span>
          </div>

          {/* Alert Level */}
          <div className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-secondary/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs text-muted-foreground">Alert Level</span>
            </div>
            <Badge variant="outline" className={`text-xs font-bold ${
              data.alertLevel === "Minor" ? "border-status-normal/50 text-status-normal" :
              data.alertLevel === "Moderate" ? "border-status-warning/50 text-status-warning" :
              "border-status-danger/50 text-status-danger"
            }`}>
              {data.alertLevel}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
