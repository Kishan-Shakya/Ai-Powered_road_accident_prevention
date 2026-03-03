"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, XCircle, RotateCcw, AlertOctagon, Download } from "lucide-react"

interface ControlPanelProps {
  onCancelEmergency: () => void
  onResetSystem: () => void
  onSimulateEmergency: () => void
  onExportLogs: () => void
  isEmergencyActive: boolean
}

export function ControlPanel({
  onCancelEmergency,
  onResetSystem,
  onSimulateEmergency,
  onExportLogs,
  isEmergencyActive,
}: ControlPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <Settings className="size-4 text-primary" aria-hidden="true" />
          Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 border-status-danger/30 bg-status-danger/5 py-3 text-status-danger hover:bg-status-danger/10 hover:text-status-danger disabled:border-border disabled:bg-transparent disabled:text-muted-foreground"
            onClick={onCancelEmergency}
            disabled={!isEmergencyActive}
          >
            <XCircle className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cancel Emergency</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 border-border/50 py-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
            onClick={onResetSystem}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Reset System</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 border-status-warning/30 bg-status-warning/5 py-3 text-status-warning hover:bg-status-warning/10 hover:text-status-warning"
            onClick={onSimulateEmergency}
          >
            <AlertOctagon className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Simulate Emergency</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 border-primary/30 bg-primary/5 py-3 text-primary hover:bg-primary/10 hover:text-primary"
            onClick={onExportLogs}
          >
            <Download className="size-5" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Export Logs</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
