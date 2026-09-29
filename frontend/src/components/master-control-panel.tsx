import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsersIcon, ShieldIcon, GraduationCapIcon, LayoutGridIcon, BookOpenIcon } from "lucide-react"

const panels = [
  {
    title: "Student Management",
    Icon: UsersIcon,
    actions: [
      { label: "Add New",      variant: "outline"     as const },
      { label: "Edit Profile", variant: "outline"     as const },
      { label: "Delete",       variant: "destructive" as const },
      { label: "Suspend",      variant: "outline"     as const },
      { label: "Import CSV",   variant: "outline"     as const },
    ],
  },
  {
    title: "User Roles & Permissions",
    Icon: ShieldIcon,
    actions: [
      { label: "Create Role",     variant: "outline" as const },
      { label: "Admin Access",    variant: "outline" as const },
      { label: "Teachers Access", variant: "outline" as const },
      { label: "Full CRUD",       variant: "outline" as const },
    ],
  },
  {
    title: "Teacher Management",
    Icon: GraduationCapIcon,
    actions: [
      { label: "Assign Classes", variant: "outline" as const },
      { label: "Deactivate",     variant: "outline" as const },
      { label: "Update Roles",   variant: "outline" as const },
      { label: "View Profile",   variant: "outline" as const },
    ],
  },
  {
    title: "Class & Section Control",
    Icon: LayoutGridIcon,
    actions: [
      { label: "Assign Teacher", variant: "outline" as const },
      { label: "Create Class",   variant: "outline" as const },
      { label: "Merge Section",  variant: "outline" as const },
      { label: "Delete Section", variant: "outline" as const },
      { label: "Change Section", variant: "outline" as const },
    ],
  },
  {
    title: "Subject Management",
    Icon: BookOpenIcon,
    actions: [
      { label: "Add Subjects",    variant: "outline" as const },
      { label: "Assign To Class", variant: "outline" as const },
      { label: "Credit Hours",    variant: "outline" as const },
      { label: "Update Syllabus", variant: "outline" as const },
    ],
  },
]

export function MasterControlPanel() {
  return (
    <div className="px-4 lg:px-6">
      <h2 className="mb-3 text-base font-semibold">Master Control Panel</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {panels.map((panel) => (
          <Card key={panel.title}>
            <CardHeader className="gap-2 px-4 pb-2 pt-4">
              <div
                className="w-fit rounded-lg p-2"
                style={{ background: "color-mix(in oklch, var(--primary) 15%, transparent)" }}
              >
                <panel.Icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-semibold leading-snug">{panel.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5 px-4 pb-4">
              {panel.actions.map((action, i) => (
                <Button key={i} variant={action.variant} size="sm" className="h-7 px-2 text-xs">
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
