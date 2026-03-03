"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { EventRecord } from "@/lib/dashboard-data"
import { List } from "lucide-react"

interface EventHistoryPanelProps {
  events: EventRecord[]
}

function getTypeBadge(type: EventRecord["type"]) {
  switch (type) {
    case "Accident":
      return "border-status-danger/40 text-status-danger bg-status-danger/10"
    case "Heart":
      return "border-status-warning/40 text-status-warning bg-status-warning/10"
    case "Alcohol":
      return "border-chart-5/40 text-chart-5 bg-chart-5/10"
    default:
      return "border-border text-muted-foreground"
  }
}

function getActionBadge(action: EventRecord["action"]) {
  switch (action) {
    case "Confirmed":
      return "border-status-danger/40 text-status-danger bg-status-danger/10"
    case "Cancelled":
      return "border-muted-foreground/40 text-muted-foreground bg-muted"
    case "Pending":
      return "border-status-warning/40 text-status-warning bg-status-warning/10"
    default:
      return "border-border text-muted-foreground"
  }
}

export function EventHistoryPanel({ events }: EventHistoryPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <List className="size-4 text-primary" aria-hidden="true" />
          Event History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border/50">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Time
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Type
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Severity
                </TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id} className="border-border/30 hover:bg-secondary/30">
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {event.time}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${getTypeBadge(event.type)}`}>
                      {event.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${
                      event.severity === "Minor" ? "border-status-normal/40 text-status-normal bg-status-normal/10" :
                      event.severity === "Moderate" ? "border-status-warning/40 text-status-warning bg-status-warning/10" :
                      "border-status-danger/40 text-status-danger bg-status-danger/10"
                    }`}>
                      {event.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${getActionBadge(event.action)}`}>
                      {event.action}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
