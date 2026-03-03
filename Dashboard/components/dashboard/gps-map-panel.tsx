"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ExternalLink, Compass } from "lucide-react"
import { Button } from "@/components/ui/button"

interface GpsMapPanelProps {
  lat: number
  lng: number
  lastUpdated: string
}

export function GpsMapPanel({ lat, lng, lastUpdated }: GpsMapPanelProps) {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          GPS Location
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {/* Map Embed */}
          <div className="relative overflow-hidden rounded-lg border border-border/50">
            <iframe
              title="Vehicle Location Map"
              src={embedUrl}
              className="h-48 w-full grayscale-[0.3] invert-[0.92] hue-rotate-180"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="absolute bottom-2 right-2">
              <Button
                variant="secondary"
                size="sm"
                className="h-7 gap-1.5 bg-background/80 text-xs backdrop-blur-sm"
                asChild
              >
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  Open Maps <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Latitude
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {lat.toFixed(6)}
              </span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border/50 bg-secondary/30 px-3 py-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                Longitude
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                {lng.toFixed(6)}
              </span>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/20 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Compass className="size-3 text-primary" aria-hidden="true" />
              <span className="text-[10px] text-muted-foreground">Last Updated</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground/70">{lastUpdated}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
