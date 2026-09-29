import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { ChevronRightIcon, PlusIcon, PencilIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useBranches, useCreateBranch, useUpdateBranch, useOrganization } from "@/hooks/organization/useOrganization"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

const BLANK = { name: "", code: "", email: "", mobile: "", address: "", timing: "" }

const BranchFormFields = ({ form, set }: {
  form: typeof BLANK
  set: (field: string, value: string) => void
}) => (
  <div className="space-y-3 pt-1">
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5 col-span-2">
        <Label>Branch Name *</Label>
        <Input placeholder="e.g. Chennai Branch" value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Code</Label>
        <Input placeholder="e.g. CHN" value={form.code} onChange={(e) => set("code", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Timing</Label>
        <Input placeholder="8 AM – 3 PM" value={form.timing} onChange={(e) => set("timing", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Mobile</Label>
        <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>
    </div>
  </div>
)

export default function BranchListPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const orgId = Number(organizationId)

  const { data: branches = [], isLoading } = useBranches(orgId)
  const { data: org } = useOrganization(orgId)
  const createBranch = useCreateBranch()
  const updateBranch = useUpdateBranch()
  const canCreate    = useHasPermission("branches.create")
  const canEdit      = useHasPermission("branches.edit")

  const [createOpen, setCreateOpen] = React.useState(false)
  const [editBranch, setEditBranch] = React.useState<any>(null)
  const [form, setForm]             = React.useState(BLANK)

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  function openCreate() { setForm(BLANK); setCreateOpen(true) }
  function openEdit(b: any) {
    setEditBranch(b)
    setForm({ name: b.name ?? "", code: b.code ?? "", email: b.email ?? "",
              mobile: b.mobile ?? "", address: b.address ?? "", timing: b.timing ?? "" })
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    createBranch.mutate({ orgId, data: form }, { onSuccess: () => setCreateOpen(false) })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    updateBranch.mutate({ orgId, branchId: editBranch.id, data: form }, { onSuccess: () => setEditBranch(null) })
  }

  return (
    <OrgPageShell>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to={PATHS.ORGANIZATION.ROOT} className="hover:text-foreground transition-colors">Organizations</Link>
            <ChevronRightIcon className="size-3.5" />
            <Link to={PATHS.ORGANIZATION.DETAIL(orgId)} className="hover:text-foreground transition-colors">{(org as any)?.name ?? "…"}</Link>
            <ChevronRightIcon className="size-3.5" />
            <span className="text-foreground">Branches</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight">Branches</h1>
        </div>
        {canCreate && (
          <Button size="sm" className="cursor-pointer" onClick={openCreate}>
            <PlusIcon className="size-3.5" /> Add Branch
          </Button>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="w-24">Status</TableHead>
              {canEdit && <TableHead className="w-20 text-right pr-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}</TableRow>
                ))
              : (branches as any[]).length === 0
              ? <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No branches found</TableCell></TableRow>
              : (branches as any[]).map((b: any, idx: number) => (
                  <TableRow key={b.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{b.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.code ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.email ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.mobile ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={b.isActive ? "default" : "outline"} className="text-xs">
                        {b.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="pr-4">
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                            onClick={() => openEdit(b)}><PencilIcon className="size-3.5" /></Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
            }
          </TableBody>
        </Table>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Branch</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <BranchFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createBranch.isPending}>
                {createBranch.isPending ? "Saving…" : "Create Branch"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBranch} onOpenChange={(v) => !v && setEditBranch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Branch</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit}>
            <BranchFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditBranch(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateBranch.isPending}>
                {updateBranch.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrgPageShell>
  )
}
