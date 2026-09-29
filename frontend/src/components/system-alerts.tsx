import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircleIcon, BanIcon, CloudIcon } from "lucide-react"

const alerts = [
  {
    Icon: AlertCircleIcon,
    iconClass: "text-destructive",
    bgStyle: { background: "color-mix(in oklch, var(--destructive) 12%, transparent)" },
    title: "124 Unpaid Fees",
    desc: "Due date passed for 3 sections",
    action: "REMIND",
    btnClass: "bg-destructive text-white hover:bg-destructive/90 border-0",
    btnVariant: "default" as const,
  },
  {
    Icon: BanIcon,
    iconClass: "text-orange-500",
    bgStyle: { background: "color-mix(in oklch, oklch(0.646 0.222 41.116) 12%, transparent)" },
    title: "Inactive Staff Detected",
    desc: "3 teacher accounts inactive for 30+ days",
    action: "REVIEW",
    btnClass: "bg-orange-500 text-white hover:bg-orange-600 border-0",
    btnVariant: "default" as const,
  },
  {
    Icon: CloudIcon,
    iconClass: "text-primary",
    bgStyle: { background: "color-mix(in oklch, var(--primary) 12%, transparent)" },
    title: "Cloud Backup Sync",
    desc: "Scheduled for tonight at 11:59 PM",
    action: "SETTINGS",
    btnClass: "",
    btnVariant: "outline" as const,
  },
]

export function SystemAlerts() {
  return (
    <Card>
      <CardHeader className="px-4 pb-2 pt-4">
        <CardTitle className="text-sm font-semibold">System Alerts</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2.5 px-4 pb-4">
        {alerts.map((alert, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
            <div className="shrink-0 rounded-lg p-2" style={alert.bgStyle}>
              <alert.Icon className={`size-4 ${alert.iconClass}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.desc}</p>
            </div>
            <Button
              size="sm"
              variant={alert.btnVariant}
              className={`h-7 shrink-0 px-2.5 text-xs font-semibold ${alert.btnClass}`}
            >
              {alert.action}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
