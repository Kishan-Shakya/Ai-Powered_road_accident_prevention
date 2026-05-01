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
  type EmergencyState,
  type SeverityLevel,
} from "@/lib/dashboard-data"

function parseNumberOrFallback(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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

function getHighSensorCount(sensors: SensorData): number {
  let count = 0
  if (sensors.alcohol.status === "warning" || sensors.alcohol.status === "danger") count++
  if (sensors.ultrasonic.status === "warning" || sensors.ultrasonic.status === "danger") count++
  if (sensors.mpu.status === "warning" || sensors.mpu.status === "danger") count++
  return count
}

function getEmergencyLevelFromSensors(highSensorCount: number): { state: EmergencyState; alertLevel: SeverityLevel } {
  if (highSensorCount === 0) {
    return { state: "NORMAL", alertLevel: "Minor" }
  } else if (highSensorCount === 1) {
    return { state: "COUNTDOWN_ACTIVE", alertLevel: "Moderate" }
  } else if (highSensorCount >= 2) {
    return { state: "EMERGENCY_CONFIRMED", alertLevel: "Severe" }
  }
  return { state: "NORMAL", alertLevel: "Minor" }
}

export default function DashboardPage() {
  const [sensors, setSensors] = useState<SensorData>(initialSensorData)
  const [emergency, setEmergency] = useState<EmergencyData>(initialEmergencyData)
  const [severity, setSeverity] = useState<SeverityData>(initialSeverityData)
  const [events, setEvents] = useState<EventRecord[]>(sampleEvents)
  const [lastUpdated, setLastUpdated] = useState("Just now")
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch Firebase data and update sensor readings
  useEffect(() => {
    const fetchFirebaseData = async () => {
      try {
        const response = await fetch('/api/data')
        const firebaseData = await response.json()

        if (firebaseData && typeof firebaseData === 'object') {
          const sensorPayload =
            firebaseData.sensor && typeof firebaseData.sensor === "object"
              ? firebaseData.sensor
              : firebaseData

          // Check for emergency trigger from Firebase
          const emergencyData = firebaseData.emergency
          const isEmergencyTriggered =
            emergencyData &&
            typeof emergencyData === "object" &&
            emergencyData.status === "TRIGGERED"
          const emergencyReason =
            emergencyData && emergencyData.reason ? emergencyData.reason : ""

          setSensors((prev) => {
            // Support Firebase shape: { sensor: { alcohol, distance, impact, vision } }
            const alcohol = parseNumberOrFallback(sensorPayload.alcohol, prev.alcohol.value)
            const ultrasonic = parseNumberOrFallback(sensorPayload.distance, prev.ultrasonic.value)
            const mpu = parseNumberOrFallback(sensorPayload.impact, prev.mpu.value)
            const visionValue =
              typeof sensorPayload.vision === "string" && sensorPayload.vision.trim().length > 0
                ? sensorPayload.vision.trim().toUpperCase()
                : prev.drowsiness.value
            const visionStatus: SensorStatus = visionValue === "NORMAL" ? "normal" : "warning"

            const newSensors = {
              ...prev,
              alcohol: {
                value: parseFloat(alcohol.toFixed(3)),
                unit: "BAC",
                status: getSensorStatus(alcohol, { warning: 0.04, danger: 0.08 }),
              },
              ultrasonic: {
                value: parseFloat(ultrasonic.toFixed(1)),
                unit: "cm",
                status: ultrasonic > 40 ? "normal" : ultrasonic > 20 ? "warning" : "danger",
              },
              mpu: {
                value: parseFloat(mpu.toFixed(2)),
                unit: "G",
                status: getSensorStatus(mpu, { warning: 1.5, danger: 3.0 }),
              },
              drowsiness: {
                value: visionValue,
                status: visionStatus,
              },
            }

            // Update emergency status: prioritize Firebase emergency trigger
            let emergencyLevel = getEmergencyLevelFromSensors(getHighSensorCount(newSensors))
            if (isEmergencyTriggered) {
              emergencyLevel = { state: "EMERGENCY_CONFIRMED" as EmergencyState, alertLevel: "Severe" }
            }
            
            setEmergency({
              state: emergencyLevel.state,
              countdown: emergencyLevel.state === "EMERGENCY_CONFIRMED" ? 20 : 20,
              alertLevel: emergencyLevel.alertLevel,
            })

            // Update severity: prioritize Firebase emergency trigger
            let severityScore = 1.2
            let severityClassification: SeverityLevel = "Minor"
            
            if (isEmergencyTriggered) {
              severityScore = 9.5
              severityClassification = "Severe"
            } else {
              const highSensorCount = getHighSensorCount(newSensors)
              if (highSensorCount === 1) {
                severityScore = 5.8
                severityClassification = "Moderate"
              } else if (highSensorCount >= 2) {
                severityScore = 8.9
                severityClassification = "Severe"
              }
            }
            
            setSeverity({
              score: severityScore,
              classification: severityClassification,
            })

            return newSensors
          })
        }

        setLastUpdated(new Date().toLocaleTimeString("en-US", { hour12: false }))
      } catch (error) {
        console.error("Error fetching Firebase data:", error)
      }
    }

    // Fetch immediately on mount
    fetchFirebaseData()

    // Fetch every 1 second for real-time updates
    const interval = setInterval(fetchFirebaseData, 1000)

    return () => clearInterval(interval)
  }, [])

  const startCountdown = useCallback(() => {
    setEmergency({
      state: "COUNTDOWN_ACTIVE",
      countdown: 20,
      alertLevel: "Moderate",
    })
    setSeverity({ score: 5.8, classification: "Moderate" })

    // Spike sensors to show danger
    setSensors((prev) => ({
      ...prev,
      acceleration: { value: 4.7, unit: "g", status: "danger" },
      heartRate: { value: 145, unit: "BPM", status: "danger" },
      alcohol: { value: 0.12, unit: "BAC", status: "danger" },
      ultrasonic: { value: 15, unit: "cm", status: "danger" },
      mpu: { value: 2.8, unit: "G", status: "danger" },
    }))

    if (countdownRef.current) clearInterval(countdownRef.current)

    let count = 20
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
