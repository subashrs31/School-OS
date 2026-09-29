import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { EllipsisVerticalIcon, Trash2Icon } from "lucide-react"

const records = [
  { type: "STUDENT",  name: "Jordan Smith",     action: "Profile Updated", admin: "JD", time: "10:45 AM" },
  { type: "TEACHER",  name: "Maria Garcia",      action: "Leave Approved",  admin: "MG", time: "11:10 AM" },
  { type: "FINANCE",  name: "Fee Invoice #8852", action: "Generated",       admin: "AD", time: "11:56 AM" },
  { type: "ACADEMIC", name: "Class 10-A",        action: "Room Reassigned", admin: "RK", time: "09:30 AM" },
  { type: "STUDENT",  name: "Sarah Jerkins",     action: "Profile Updated", admin: "SJ", time: "09:46 AM" },
  { type: "FINANCE",  name: "Fee Invoice #8851", action: "Generated",       admin: "AD", time: "01:35 PM" },
  { type: "TEACHER",  name: "Donald J. Tom",     action: "Leave Approved",  admin: "DT", time: "02:56 PM" },
]

// STUDENT uses --primary so it follows the theme; others use fixed semantic colors
function TypeBadge({ type }: { type: string }) {
  if (type === "STUDENT") {
    return (
      <span
        className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-primary"
        style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)" }}
      >
        {type}
      </span>
    )
  }
  const cls: Record<string, string> = {
    TEACHER:  "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    FINANCE:  "bg-green-500/10 text-green-700 dark:text-green-400",
    ACADEMIC: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls[type] ?? ""}`}>
      {type}
    </span>
  )
}

export function RecentRecords() {
  return (
    <div className="px-4 lg:px-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent Records</h2>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
          View All Records
        </Button>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Type</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Name</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide sm:table-cell">Action Taken</TableHead>
              <TableHead className="hidden text-xs font-semibold uppercase tracking-wide md:table-cell">By Admin</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Time</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r, i) => (
              <TableRow key={i} className="hover:bg-muted/30">
                <TableCell className="py-2.5"><TypeBadge type={r.type} /></TableCell>
                <TableCell className="py-2.5 font-medium text-sm">{r.name}</TableCell>
                <TableCell className="hidden py-2.5 text-sm text-muted-foreground sm:table-cell">{r.action}</TableCell>
                <TableCell className="hidden py-2.5 md:table-cell">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarFallback
                        className="text-primary text-[10px] font-medium"
                        style={{ background: "color-mix(in oklch, var(--primary) 12%, transparent)" }}
                      >
                        {r.admin}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">{r.action}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5 text-sm text-muted-foreground">{r.time}</TableCell>
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="size-7">
                      <EllipsisVerticalIcon className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive">
                      <Trash2Icon className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
