import { Card, CardContent } from "@/components/ui/card"
import { UsersIcon, GraduationCapIcon, LayoutGridIcon, UserCogIcon, Trash2Icon } from "lucide-react"

const stats = [
  {
    label: "Total Students",
    value: "2,450",
    Icon: UsersIcon,
    sub: [
      { dot: "bg-green-500", text: "Present: 2,430" },
      { dot: "bg-orange-400", text: "Absent 20" },
    ],
  },
  {
    label: "Total Teachers",
    value: "68",
    Icon: GraduationCapIcon,
    sub: [{ dot: "bg-green-500", text: "Present: 63" }],
  },
  {
    label: "Total Classes",
    value: "68",
    Icon: LayoutGridIcon,
    sub: [{ dot: "bg-green-500", text: "Sections: 96" }],
  },
  {
    label: "System Users",
    value: "2,650",
    Icon: UserCogIcon,
    sub: [{ dot: "", text: "Admins: 5  ·  Staff: 67" }],
  },
  {
    label: "Deleted Records",
    value: "12",
    Icon: Trash2Icon,
    sub: [{ dot: "", text: "Last: Today 11:42 AM" }],
  },
]

export function SectionCards() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4 md:grid-cols-3 lg:px-6 xl:grid-cols-5">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="flex items-start justify-between gap-2 p-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <span className="text-2xl font-bold tabular-nums leading-none">{s.value}</span>
              <div className="mt-1.5 flex flex-col gap-0.5">
                {s.sub.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                    {item.dot && <span className={`size-1.5 shrink-0 rounded-full ${item.dot}`} />}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Use inline style so gradient themes work — color-mix not needed, just opacity on bg */}
            <div
              className="shrink-0 rounded-lg p-2"
              style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)" }}
            >
              <s.Icon className="size-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
