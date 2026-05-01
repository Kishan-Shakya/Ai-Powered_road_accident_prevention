export type SensorStatus = "normal" | "warning" | "danger" | "critical"

export type EmergencyState = "NORMAL" | "COUNTDOWN_ACTIVE" | "EMERGENCY_CONFIRMED"

export type SeverityLevel = "Minor" | "Moderate" | "Severe"

export type EventType = "Accident" | "Alcohol"

export type EventAction = "Cancelled" | "Confirmed" | "Pending"

export interface SensorData {
  acceleration: { value: number; unit: string; status: SensorStatus }
  heartRate: { value: number; unit: string; status: SensorStatus }
  alcohol: { value: number; unit: string; status: SensorStatus }
  ultrasonic: { value: number; unit: string; status: SensorStatus }
  mpu: { value: number; unit: string; status: SensorStatus }
  drowsiness: { value: string; status: SensorStatus }
  gps: { lat: number; lng: number }
}

export interface EmergencyData {
  state: EmergencyState
  countdown: number
  alertLevel: SeverityLevel
}

export interface SeverityData {
  score: number
  classification: SeverityLevel
}

export interface EventRecord {
  id: string
  time: string
  type: EventType
  severity: SeverityLevel
  action: EventAction
}

export function getStatusColor(status: SensorStatus): string {
  switch (status) {
    case "normal":
      return "text-status-normal"
    case "warning":
      return "text-status-warning"
    case "danger":
      return "text-status-danger"
    case "critical":
      return "text-status-critical"
    default:
      return "text-muted-foreground"
  }
}

export function getStatusBg(status: SensorStatus): string {
  switch (status) {
    case "normal":
      return "bg-status-normal/10 border-status-normal/30"
    case "warning":
      return "bg-status-warning/10 border-status-warning/30"
    case "danger":
      return "bg-status-danger/10 border-status-danger/30"
    case "critical":
      return "bg-status-critical/10 border-status-critical/30"
    default:
      return "bg-muted border-border"
  }
}

export function getStatusDot(status: SensorStatus): string {
  switch (status) {
    case "normal":
      return "bg-status-normal"
    case "warning":
      return "bg-status-warning"
    case "danger":
      return "bg-status-danger"
    case "critical":
      return "bg-status-critical"
    default:
      return "bg-muted-foreground"
  }
}

export function getSeverityColor(level: SeverityLevel): string {
  switch (level) {
    case "Minor":
      return "text-status-normal"
    case "Moderate":
      return "text-status-warning"
    case "Severe":
      return "text-status-danger"
    default:
      return "text-muted-foreground"
  }
}

export function getSeverityProgressColor(level: SeverityLevel): string {
  switch (level) {
    case "Minor":
      return "bg-status-normal"
    case "Moderate":
      return "bg-status-warning"
    case "Severe":
      return "bg-status-danger"
    default:
      return "bg-muted-foreground"
  }
}

export const initialSensorData: SensorData = {
  acceleration: { value: 1.02, unit: "g", status: "normal" },
  heartRate: { value: 72, unit: "BPM", status: "normal" },
  alcohol: { value: 0.01, unit: "BAC", status: "normal" },
  ultrasonic: { value: 150, unit: "cm", status: "normal" },
  mpu: { value: 0.5, unit: "G", status: "normal" },
  drowsiness: { value: "Alert", status: "normal" },
  gps: { lat: 24.8607, lng: 67.0011 },
}

export const initialEmergencyData: EmergencyData = {
  state: "NORMAL",
  countdown: 20,
  alertLevel: "Minor",
}

export const initialSeverityData: SeverityData = {
  score: 1.2,
  classification: "Minor",
}

export const sampleEvents: EventRecord[] = [
  { id: "1", time: "14:32:08", type: "Accident", severity: "Severe", action: "Confirmed" },
  { id: "2", time: "11:05:12", type: "Alcohol", severity: "Minor", action: "Confirmed" },
  { id: "3", time: "09:47:33", type: "Accident", severity: "Moderate", action: "Pending" },
]
