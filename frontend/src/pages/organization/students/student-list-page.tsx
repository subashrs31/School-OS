import * as React from "react"
import { useParams, Link } from "react-router-dom"
import { ChevronRightIcon, PlusIcon, PencilIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useStudents, useCreateStudent, useUpdateStudent, useOrganization } from "@/hooks/organization/useOrganization"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

const BLANK = { admissionNo: "", name: "", dateOfBirth: "", gender: "", email: "", mobile: "", address: "", admissionDate: "" }

type StudentForm = typeof BLANK
type SetFn = (field: string, value: string) => void

const StudentFormFields = ({ form, set, showAdmissionNo }: { form: StudentForm; set: SetFn; showAdmissionNo: boolean }) => (
  <div className="space-y-3 pt-1">
    <div className="grid grid-cols-2 gap-3">
      {showAdmissionNo && (
        <div className="space-y-1.5 col-span-2">
          <Label>Admission No *</Label>
          <Input value={form.admissionNo} onChange={(e) => set("admissionNo", e.target.value)} />
        </div>
      )}
      <div className="space-y-1.5 col-span-2">
        <Label>Full Name *</Label>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Date of Birth</Label>
        <Input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Gender</Label>
        <select value={form.gender} onChange={(e) => set("gender", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="">— Select —</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Mobile</Label>
        <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Admission Date</Label>
        <Input type="date" value={form.admissionDate} onChange={(e) => set("admissionDate", e.target.value)} />
      </div>
      <div className="space-y-1.5 col-span-2">
        <Label>Address</Label>
        <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
      </div>
    </div>
  </div>
)

export default function StudentListPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const orgId = Number(organizationId)

  const [search, setSearch]           = React.useState("")
  const [createOpen, setCreateOpen]   = React.useState(false)
  const [editStudent, setEditStudent] = React.useState<any>(null)
  const [form, setForm]               = React.useState(BLANK)

  const { data: students = [], isLoading } = useStudents(orgId)
  const { data: org }                      = useOrganization(orgId)
  const createStudent = useCreateStudent()
  const updateStudent = useUpdateStudent()
  const canCreate     = useHasPermission("students.create")
  const canEdit       = useHasPermission("students.edit")

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const filtered = (students as any[]).filter((s) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo?.toLowerCase().includes(search.toLowerCase())
  )

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.admissionNo || !form.name) return
    const data: Record<string, unknown> = { ...form }
    if (!data["gender"])        delete data["gender"]
    if (!data["dateOfBirth"])   delete data["dateOfBirth"]
    if (!data["admissionDate"]) delete data["admissionDate"]
    createStudent.mutate({ orgId, data }, { onSuccess: () => { setCreateOpen(false); setForm(BLANK) } })
  }

  function openEdit(s: any) {
    setEditStudent(s)
    setForm({ admissionNo: s.admissionNo ?? "", name: s.name ?? "", dateOfBirth: s.dateOfBirth ?? "",
              gender: s.gender ?? "", email: s.email ?? "", mobile: s.mobile ?? "",
              address: s.address ?? "", admissionDate: s.admissionDate ?? "" })
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    updateStudent.mutate({ orgId, studentId: editStudent.id, data: form as Record<string, unknown> },
      { onSuccess: () => setEditStudent(null) })
  }

  const statusColor: Record<string, string> = {
    active: "default", inactive: "outline", transferred: "outline", graduated: "secondary",
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
            <span className="text-foreground">Students</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight">Students</h1>
        </div>
        {canCreate && (
          <Button size="sm" className="cursor-pointer" onClick={() => { setForm(BLANK); setCreateOpen(true) }}>
            <PlusIcon className="size-3.5" /> Admit Student
          </Button>
        )}
      </div>

      <div className="relative w-64">
        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input className="h-8 pl-8 text-sm" placeholder="Search students…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10 text-center">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="w-24">Status</TableHead>
              {canEdit && <TableHead className="w-20 text-right pr-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}</TableRow>
                ))
              : filtered.length === 0
              ? <TableRow><TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">No students found</TableCell></TableRow>
              : filtered.map((s: any, idx: number) => (
                  <TableRow key={s.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="text-center text-xs text-muted-foreground">{idx + 1}</TableCell>
                    <TableCell className="font-medium text-sm">{s.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.admissionNo}</TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{s.gender ?? "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.mobile ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={(statusColor[s.status] ?? "outline") as any} className="text-xs capitalize">
                        {s.status}
                      </Badge>
                    </TableCell>
                    {canEdit && (
                      <TableCell className="pr-4">
                        <div className="flex justify-end">
                          <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                            onClick={() => openEdit(s)}><PencilIcon className="size-3.5" /></Button>
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
          <DialogHeader><DialogTitle>Admit Student</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <StudentFormFields form={form} set={set} showAdmissionNo={true} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createStudent.isPending}>
                {createStudent.isPending ? "Saving…" : "Admit Student"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editStudent} onOpenChange={(v) => !v && setEditStudent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit}>
            <StudentFormFields form={form} set={set} showAdmissionNo={false} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEditStudent(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateStudent.isPending}>
                {updateStudent.isPending ? "Saving…" : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </OrgPageShell>
  )
}
