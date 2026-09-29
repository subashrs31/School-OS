"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"
import React from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info:    <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error:   <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          // Base toast — uses popover surface so it matches the current theme
          "--normal-bg":      "var(--popover)",
          "--normal-text":    "var(--popover-foreground)",
          "--normal-border":  "var(--border)",

          // Success — green tones from destructive palette direction, use CSS vars
          "--success-bg":     "oklch(0.527 0.154 150.069)",
          "--success-text":   "oklch(0.985 0 0)",
          "--success-border": "oklch(0.527 0.154 150.069)",

          // Error — uses the app's --destructive token so it follows theme
          "--error-bg":       "var(--destructive)",
          "--error-text":     "oklch(0.985 0 0)",
          "--error-border":   "var(--destructive)",

          // Warning — amber
          "--warning-bg":     "oklch(0.646 0.222 41.116)",
          "--warning-text":   "oklch(0.985 0 0)",
          "--warning-border": "oklch(0.646 0.222 41.116)",

          // Info — uses --primary so it follows the selected color preset
          "--info-bg":        "var(--primary)",
          "--info-text":      "var(--primary-foreground)",
          "--info-border":    "var(--primary)",

          "--border-radius":  "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
