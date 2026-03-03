"use client"

import { Badge } from "@/components/ui/badge"
import { Shield, Wifi, Clock } from "lucide-react"
import { useEffect, useState } from "react"

export function DashboardHeader() {
  const [time, setTime] = useState("")

  useEffect(() => {
    function update() {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="size-5 text-primary" aria-hidden="true" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            SafeDrive Command Center
          </h1>
          <p className="text-xs text-muted-foreground">
            Real-time vehicle safety monitoring
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
          <Wifi className="size-3 animate-pulse" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Connected</span>
        </Badge>
        <div className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-secondary/30 px-3 py-1.5">
          <Clock className="size-3 text-muted-foreground" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </header>
  )
}
