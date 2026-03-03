"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SensorPanel } from "@/components/dashboard/sensor-panel"
import { EmergencyPanel } from "@/components/dashboard/emergency-panel"
import { SeverityPanel } from "@/components/dashboard/severity-panel"
import { GpsMapPanel } from "@/components/dashboard/gps-map-panel"
import { EventHistoryPanel } from "@/components/dashboard/event-history-panel"
import { ControlPanel } from "@/components/dashboard/control-panel"
import {
  initialSensorData,
  initialEmergencyData,
  initialSeverityData,
  sampleEvents,
  type SensorData,
  type EmergencyData,
  type SeverityData,
  type EventRecord,
  type SensorStatus,
  type SeverityLevel,
} from "@/lib/dashboard-data"

function randomFluctuation(base: number, range: number) {
  return base + (Math.random() - 0.5) * range
}

function getSensorStatus(value: number, thresholds: { warning: number; danger: number; isReversed?: boolean }): SensorStatus {
  if (thresholds.isReversed) {
    if (value <= thresholds.danger) return "danger"
    if (value <= thresholds.warning) return "warning"
    return "normal"
  }
  if (value >= thresholds.danger) return "danger"
  if (value >= thresholds.warning) return "warning"
  return "normal"
}

export default function DashboardPage() {
  const [sensors, setSensors] = useState<SensorData>(initialSensorData)
  const [emergency, setEmergency] = useState<EmergencyData>(initialEmergencyData)
  const [severity, setSeverity] = useState<SeverityData>(initialSeverityData)
  const [events, setEvents] = useState<EventRecord[]>(sampleEvents)
  const [lastUpdated, setLastUpdated] = useState("Just now")
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Simulate real-time sensor fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setSensors((prev) => {
        const accVal = randomFluctuation(prev.acceleration.value, 0.15)
        const hrVal = randomFluctuation(prev.heartRate.value, 3)
        const alcVal = Math.max(0, randomFluctuation(prev.alcohol.value, 0.005))

        return {
          acceleration: {
            value: parseFloat(Math.max(0, accVal).toFixed(2)),
            unit: "g",
            status: getSensorStatus(accVal, { warning: 2.5, danger: 4.0 }),
          },
          heartRate: {
            value: Math.round(Math.max(40, Math.min(200, hrVal))),
            unit: "BPM",
            status: getSensorStatus(hrVal, { warning: 110, danger: 140 }),
          },
          alcohol: {
            value: parseFloat(alcVal.toFixed(3)),
            unit: "BAC",
            status: getSensorStatus(alcVal, { warning: 0.04, danger: 0.08 }),
          },
          drowsiness: prev.drowsiness,
          gps: {
            lat: parseFloat(randomFluctuation(prev.gps.lat, 0.0001).toFixed(6)),
            lng: parseFloat(randomFluctuation(prev.gps.lng, 0.0001).toFixed(6)),
          },
        }
      })

      setLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const startCountdown = useCallback(() => {
    setEmergency({
      state: "COUNTDOWN_ACTIVE",
      countdown: 30,
      alertLevel: "Moderate",
    })
    setSeverity({ score: 5.8, classification: "Moderate" })

    // Spike sensors to show danger
    setSensors((prev) => ({
      ...prev,
      acceleration: { value: 4.7, unit: "g", status: "danger" },
      heartRate: { value: 145, unit: "BPM", status: "danger" },
    }))

    if (countdownRef.current) clearInterval(countdownRef.current)

    let count = 30
    countdownRef.current = setInterval(() => {
      count--
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current)
        setEmergency({
          state: "EMERGENCY_CONFIRMED",
          countdown: 0,
          alertLevel: "Severe",
        })
        setSeverity({ score: 8.9, classification: "Severe" })
        setSensors((prev) => ({
          ...prev,
          acceleration: { value: 6.3, unit: "g", status: "critical" as SensorStatus },
          heartRate: { value: 168, unit: "BPM", status: "danger" },
          drowsiness: { value: "Unresponsive", status: "danger" },
        }))
        // Add new event
        setEvents((prev) => [
          {
            id: Date.now().toString(),
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
            type: "Accident" as const,
            severity: "Severe" as SeverityLevel,
            action: "Confirmed" as const,
          },
          ...prev,
        ])
      } else {
        setEmergency((prev) => ({ ...prev, countdown: count }))
      }
    }, 1000)
  }, [])

  const cancelEmergency = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setEmergency(initialEmergencyData)
    setSeverity(initialSeverityData)
    setSensors(initialSensorData)
    setEvents((prev) => [
      {
        id: Date.now().toString(),
        time: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type: "Accident" as const,
        severity: "Moderate" as SeverityLevel,
        action: "Cancelled" as const,
      },
      ...prev,
    ])
  }, [])

  const resetSystem = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setSensors(initialSensorData)
    setEmergency(initialEmergencyData)
    setSeverity(initialSeverityData)
    setEvents(sampleEvents)
  }, [])

  const exportLogs = useCallback(() => {
    const data = JSON.stringify({ sensors, emergency, severity, events }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `safedrive-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [sensors, emergency, severity, events])

  const isEmergencyActive = emergency.state !== "NORMAL"

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
        <DashboardHeader />

        {/* Top: Live Sensor Panel (Full Width) */}
        <SensorPanel data={sensors} />

        {/* Middle: Emergency + Severity + GPS */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <EmergencyPanel data={emergency} />
          <SeverityPanel data={severity} />
          <GpsMapPanel
            lat={sensors.gps.lat}
            lng={sensors.gps.lng}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* Bottom: Event History + Control Panel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <EventHistoryPanel events={events} />
          </div>
          <ControlPanel
            onCancelEmergency={cancelEmergency}
            onResetSystem={resetSystem}
            onSimulateEmergency={startCountdown}
            onExportLogs={exportLogs}
            isEmergencyActive={isEmergencyActive}
          />
        </div>
      </div>
    </main>
  )
}
