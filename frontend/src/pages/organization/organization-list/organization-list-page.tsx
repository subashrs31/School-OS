import * as React from "react"
import { useNavigate } from "react-router-dom"
import { PlusIcon, PencilIcon, EyeIcon, SearchIcon, BuildingIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganizations } from "@/hooks/organization/useOrganization"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

export default function OrganizationListPage() {
  const [search, setSearch] = React.useState("")
  const { data: orgs = [], isLoading } = useOrganizations()
  const canCreate = useHasPermission("organizations.create")
  const navigate  = useNavigate()

  const filtered = (orgs as any[]).filter((o) =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <OrgPageShell>
      <div>
        <h1 className="text-xl font-bold tracking-tight">Organizations</h1>
        <p className="text-sm text-muted-foreground">Manage schools and their branches</p>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="relative w-64">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input className="h-8 pl-8 text-sm" placeholder="Search organizations…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {canCreate && (
          <Button size="sm" className="cursor-pointer" onClick={() => navigate(PATHS.ORGANIZATION.CREATE)}>
            <PlusIcon className="size-3.5" /> Add School
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-28 text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : filtered.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                      No organizations found
                    </TableCell>
                  </TableRow>
                )
              : filtered.map((org: any, idx: number) => (
                  <TableRow key={org.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <BuildingIcon className="size-3.5 text-primary" />
                        </div>
                        <span className="font-medium text-sm">{org.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{org.email ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{org.mobile ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={org.isActive ? "default" : "outline"} className="text-xs">
                        {org.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="View"
                          onClick={() => navigate(PATHS.ORGANIZATION.DETAIL(org.id))}>
                          <EyeIcon className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7 cursor-pointer" title="Edit"
                          onClick={() => navigate(PATHS.ORGANIZATION.EDIT(org.id))}>
                          <PencilIcon className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>
    </OrgPageShell>
  )
}
