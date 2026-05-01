"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorData } from "@/lib/dashboard-data"
import { getStatusColor, getStatusBg, getStatusDot } from "@/lib/dashboard-data"
import { Activity, Droplets, Waves, Cpu, Brain, MapPin } from "lucide-react"

interface SensorPanelProps {
  data: SensorData
}

function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  unit: string
  status: "normal" | "warning" | "danger" | "critical"
}) {
  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 transition-all ${getStatusBg(status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${getStatusColor(status)}`} aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${getStatusDot(status)} animate-pulse`} />
          <span className={`text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-mono text-3xl font-bold tracking-tight ${getStatusColor(status)}`}>
          {value}
        </span>
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  )
}

export function SensorPanel({ data }: SensorPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <Activity className="size-4 text-primary" aria-hidden="true" />
          Live Sensor Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SensorCard
            icon={Droplets}
            label="Alcohol"
            value={data.alcohol.value.toFixed(3)}
            unit={data.alcohol.unit}
            status={data.alcohol.status}
          />
          <SensorCard
            icon={Waves}
            label="Distance"
            value={data.ultrasonic.value.toFixed(1)}
            unit={data.ultrasonic.unit}
            status={data.ultrasonic.status}
          />
          <SensorCard
            icon={Cpu}
            label="Impact"
            value={data.mpu.value.toFixed(2)}
            unit={data.mpu.unit}
            status={data.mpu.status}
          />
          <SensorCard
            icon={Brain}
            label="Vision"
            value={data.drowsiness.value}
            unit=""
            status={data.drowsiness.status}
          />
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/50 px-3 py-2">
          <MapPin className="size-3.5 text-primary" aria-hidden="true" />
          <span className="font-mono text-xs text-muted-foreground">
            GPS: {data.gps.lat.toFixed(4)}, {data.gps.lng.toFixed(4)}
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground/70">LIVE</span>
        </div>
      </CardContent>
    </Card>
  )
}
