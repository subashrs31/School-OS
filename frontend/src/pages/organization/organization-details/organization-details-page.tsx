import * as React from "react"
import { useNavigate, useParams, Link } from "react-router-dom"
import { ChevronRightIcon, PencilIcon, BuildingIcon, UsersIcon, GraduationCapIcon, GitBranchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization } from "@/hooks/organization/useOrganization"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

export default function OrganizationDetailsPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const id = Number(organizationId)
  const { data, isLoading } = useOrganization(id)
  const canEdit = useHasPermission("organizations.edit")
  const navigate = useNavigate()

  const org     = (data as any)?.organization ?? data
  const summary = (data as any)?.summary ?? {}

  const quickLinks = [
    { label: "Branches",  icon: GitBranchIcon,    href: PATHS.ORGANIZATION.BRANCHES(id),  count: summary.branchCount  },
    { label: "Staff",     icon: UsersIcon,         href: PATHS.ORGANIZATION.STAFF(id),     count: summary.staffCount   },
    { label: "Students",  icon: GraduationCapIcon, href: PATHS.ORGANIZATION.STUDENTS(id),  count: summary.studentCount },
    { label: "Academics", icon: BuildingIcon,      href: PATHS.ORGANIZATION.ACADEMICS(id), count: null                 },
  ]

  if (isLoading) return (
    <OrgPageShell>
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
    </OrgPageShell>
  )

  return (
    <OrgPageShell>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to={PATHS.ORGANIZATION.ROOT} className="hover:text-foreground transition-colors">Organizations</Link>
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">{org?.name ?? "…"}</span>
          </nav>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">{org?.name}</h1>
            <Badge variant={org?.isActive ? "default" : "outline"} className="text-xs">
              {org?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {org?.email ?? ""}{org?.email && org?.mobile ? " · " : ""}{org?.mobile ?? ""}
          </p>
        </div>
        {canEdit && (
          <Button size="sm" variant="outline" className="cursor-pointer"
            onClick={() => navigate(PATHS.ORGANIZATION.EDIT(id))}>
            <PencilIcon className="size-3.5" /> Edit
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {quickLinks.map(({ label, icon: Icon, href, count }) => (
          <Link key={label} to={href}
            className="rounded-lg border bg-card p-4 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="size-4 text-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
            {count !== null && (
              <p className="text-2xl font-bold">{count ?? 0}</p>
            )}
          </Link>
        ))}
      </div>

      {/* School info */}
      {(org?.address || org?.website || org?.schoolTiming) && (
        <div className="rounded-lg border p-4 space-y-2 max-w-lg">
          <h2 className="text-sm font-semibold">School Information</h2>
          {org?.schoolTiming && <p className="text-sm text-muted-foreground">Timing: {org.schoolTiming}</p>}
          {org?.address      && <p className="text-sm text-muted-foreground">Address: {org.address}</p>}
          {org?.website      && (
            <a href={org.website} target="_blank" rel="noreferrer"
              className="text-sm text-primary underline underline-offset-4">{org.website}</a>
          )}
        </div>
      )}

      {/* Social links */}
      {org?.socialLinks && Object.keys(org.socialLinks).length > 0 && (
        <div className="rounded-lg border p-4 space-y-2 max-w-lg">
          <h2 className="text-sm font-semibold">Social Media</h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(org.socialLinks as Record<string, string>).map(([key, url]) => (
              <a key={key} href={url} target="_blank" rel="noreferrer">
                <Badge variant="outline" className="capitalize cursor-pointer">{key}</Badge>
              </a>
            ))}
          </div>
        </div>
      )}
    </OrgPageShell>
  )
}
