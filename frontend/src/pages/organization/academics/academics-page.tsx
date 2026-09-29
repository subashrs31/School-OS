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
import {
  useAcademicYears, useCreateAcademicYear, useUpdateAcademicYear,
  useClasses, useCreateClass, useUpdateClass,
  useSubjects, useCreateSubject, useUpdateSubject,
  useExams, useCreateExam, useOrganization,
} from "@/hooks/organization/useOrganization"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

const TABS = ["Years", "Classes", "Subjects", "Exams"] as const
type Tab = typeof TABS[number]

// ── Hoisted form field components (NEVER define these inside another component) ──

const YearFormFields = ({ form, set }: {
  form: { name: string; startDate: string; endDate: string; isCurrent: boolean }
  set: (f: string, v: unknown) => void
}) => (
  <div className="space-y-3 pt-1">
    <div className="space-y-1.5">
      <Label>Name *</Label>
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. 2024-25" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Start Date</Label>
        <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>End Date</Label>
        <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
      </div>
    </div>
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input type="checkbox" checked={form.isCurrent} onChange={(e) => set("isCurrent", e.target.checked)} className="size-4 rounded" />
      <span className="text-sm">Set as current year</span>
    </label>
  </div>
)

const ClassFormFields = ({ form, set }: {
  form: { name: string; displayOrder: string }
  set: (f: string, v: string) => void
}) => (
  <div className="space-y-3 pt-1">
    <div className="space-y-1.5">
      <Label>Class Name *</Label>
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Grade 1" />
    </div>
    <div className="space-y-1.5">
      <Label>Display Order</Label>
      <Input type="number" value={form.displayOrder} onChange={(e) => set("displayOrder", e.target.value)} />
    </div>
  </div>
)

const SubjectFormFields = ({ form, set }: {
  form: { name: string; code: string; type: string }
  set: (f: string, v: string) => void
}) => (
  <div className="space-y-3 pt-1">
    <div className="space-y-1.5">
      <Label>Subject Name *</Label>
      <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Code</Label>
        <Input value={form.code} onChange={(e) => set("code", e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label>Type</Label>
        <select value={form.type} onChange={(e) => set("type", e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="theory">Theory</option>
          <option value="practical">Practical</option>
          <option value="both">Both</option>
        </select>
      </div>
    </div>
  </div>
)

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AcademicsPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const orgId = Number(organizationId)
  const { data: org } = useOrganization(orgId)
  const [tab, setTab] = React.useState<Tab>("Years")
  const canCreate = useHasPermission("academics.create")
  const canEdit   = useHasPermission("academics.edit")

  return (
    <OrgPageShell>
      <div className="space-y-1">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to={PATHS.ORGANIZATION.ROOT} className="hover:text-foreground transition-colors">Organizations</Link>
          <ChevronRightIcon className="size-3.5" />
          <Link to={PATHS.ORGANIZATION.DETAIL(orgId)} className="hover:text-foreground transition-colors">{(org as any)?.name ?? "…"}</Link>
          <ChevronRightIcon className="size-3.5" />
          <span className="text-foreground">Academics</span>
        </nav>
        <h1 className="text-xl font-bold tracking-tight">Academics</h1>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={[
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
              tab === t ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground",
            ].join(" ")}>
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tab === "Years"    && <AcademicYearsTab orgId={orgId} canCreate={canCreate} canEdit={canEdit} />}
        {tab === "Classes"  && <ClassesTab       orgId={orgId} canCreate={canCreate} canEdit={canEdit} />}
        {tab === "Subjects" && <SubjectsTab      orgId={orgId} canCreate={canCreate} canEdit={canEdit} />}
        {tab === "Exams"    && <ExamsTab         orgId={orgId} canCreate={canCreate} canEdit={canEdit} />}
      </div>
    </OrgPageShell>
  )
}

// ── Academic Years Tab ────────────────────────────────────────────────────────
function AcademicYearsTab({ orgId, canCreate, canEdit }: { orgId: number; canCreate: boolean; canEdit: boolean }) {
  const { data: years = [], isLoading } = useAcademicYears(orgId)
  const createYear = useCreateAcademicYear()
  const updateYear = useUpdateAcademicYear()
  const [open, setOpen]     = React.useState(false)
  const [editItem, setEdit] = React.useState<any>(null)
  const [form, setForm]     = React.useState({ name: "", startDate: "", endDate: "", isCurrent: false })
  const set = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createYear.mutate({ orgId, data: form as Record<string, unknown> }, { onSuccess: () => setOpen(false) })
  }
  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    updateYear.mutate({ orgId, yearId: editItem.id, data: form as Record<string, unknown> }, { onSuccess: () => setEdit(null) })
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" className="cursor-pointer" onClick={() => { setForm({ name: "", startDate: "", endDate: "", isCurrent: false }); setOpen(true) }}>
            <PlusIcon className="size-3.5" /> Add Year
          </Button>
        </div>
      )}
      <SimpleTable
        cols={["Name", "Start Date", "End Date", "Current", "Status"]}
        isLoading={isLoading}
        rows={years as any[]}
        renderRow={(y, i) => (
          <TableRow key={y.id} className="hover:bg-muted/30">
            <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="font-medium text-sm">{y.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{y.startDate}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{y.endDate}</TableCell>
            <TableCell>{y.isCurrent ? <Badge className="text-xs">Current</Badge> : "—"}</TableCell>
            <TableCell><Badge variant={y.isActive ? "default" : "outline"} className="text-xs">{y.isActive ? "Active" : "Inactive"}</Badge></TableCell>
            {canEdit && <TableCell className="pr-4 text-right">
              <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                onClick={() => { setEdit(y); setForm({ name: y.name, startDate: y.startDate, endDate: y.endDate, isCurrent: y.isCurrent }) }}>
                <PencilIcon className="size-3.5" />
              </Button>
            </TableCell>}
          </TableRow>
        )}
        extraCols={canEdit ? 1 : 0}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Academic Year</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <YearFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createYear.isPending}>{createYear.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Academic Year</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit}>
            <YearFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateYear.isPending}>{updateYear.isPending ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Classes Tab ───────────────────────────────────────────────────────────────
function ClassesTab({ orgId, canCreate, canEdit }: { orgId: number; canCreate: boolean; canEdit: boolean }) {
  const { data: classes = [], isLoading } = useClasses(orgId)
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editItem, setEdit]         = React.useState<any>(null)
  const [form, setForm]             = React.useState({ name: "", displayOrder: "0" })
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createClass.mutate({ orgId, data: { name: form.name, displayOrder: Number(form.displayOrder) } }, { onSuccess: () => setCreateOpen(false) })
  }
  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    updateClass.mutate({ orgId, classId: editItem.id, data: { name: form.name, displayOrder: Number(form.displayOrder) } }, { onSuccess: () => setEdit(null) })
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" className="cursor-pointer" onClick={() => { setForm({ name: "", displayOrder: "0" }); setCreateOpen(true) }}>
            <PlusIcon className="size-3.5" /> Add Class
          </Button>
        </div>
      )}
      <SimpleTable
        cols={["Name", "Sections", "Status"]}
        isLoading={isLoading}
        rows={classes as any[]}
        renderRow={(c, i) => (
          <TableRow key={c.id} className="hover:bg-muted/30">
            <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="font-medium text-sm">{c.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{c.Sections?.length ?? 0}</TableCell>
            <TableCell><Badge variant={c.isActive ? "default" : "outline"} className="text-xs">{c.isActive ? "Active" : "Inactive"}</Badge></TableCell>
            {canEdit && <TableCell className="pr-4 text-right">
              <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                onClick={() => { setEdit(c); setForm({ name: c.name, displayOrder: String(c.displayOrder ?? 0) }) }}>
                <PencilIcon className="size-3.5" />
              </Button>
            </TableCell>}
          </TableRow>
        )}
        extraCols={canEdit ? 1 : 0}
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Class</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <ClassFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createClass.isPending}>{createClass.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Class</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit}>
            <ClassFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateClass.isPending}>{updateClass.isPending ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Subjects Tab ──────────────────────────────────────────────────────────────
function SubjectsTab({ orgId, canCreate, canEdit }: { orgId: number; canCreate: boolean; canEdit: boolean }) {
  const { data: subjects = [], isLoading } = useSubjects(orgId)
  const createSubject = useCreateSubject()
  const updateSubject = useUpdateSubject()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [editItem, setEdit]         = React.useState<any>(null)
  const [form, setForm]             = React.useState({ name: "", code: "", type: "theory" })
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    createSubject.mutate({ orgId, data: form as Record<string, unknown> }, { onSuccess: () => setCreateOpen(false) })
  }
  function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    updateSubject.mutate({ orgId, subjectId: editItem.id, data: form as Record<string, unknown> }, { onSuccess: () => setEdit(null) })
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" className="cursor-pointer" onClick={() => { setForm({ name: "", code: "", type: "theory" }); setCreateOpen(true) }}>
            <PlusIcon className="size-3.5" /> Add Subject
          </Button>
        </div>
      )}
      <SimpleTable
        cols={["Name", "Code", "Type", "Status"]}
        isLoading={isLoading}
        rows={subjects as any[]}
        renderRow={(s, i) => (
          <TableRow key={s.id} className="hover:bg-muted/30">
            <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="font-medium text-sm">{s.name}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{s.code ?? "—"}</TableCell>
            <TableCell><Badge variant="outline" className="text-xs capitalize">{s.type}</Badge></TableCell>
            <TableCell><Badge variant={s.isActive ? "default" : "outline"} className="text-xs">{s.isActive ? "Active" : "Inactive"}</Badge></TableCell>
            {canEdit && <TableCell className="pr-4 text-right">
              <Button size="icon" variant="ghost" className="size-7 cursor-pointer"
                onClick={() => { setEdit(s); setForm({ name: s.name, code: s.code ?? "", type: s.type }) }}>
                <PencilIcon className="size-3.5" />
              </Button>
            </TableCell>}
          </TableRow>
        )}
        extraCols={canEdit ? 1 : 0}
      />
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Subject</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate}>
            <SubjectFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createSubject.isPending}>{createSubject.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={!!editItem} onOpenChange={(v) => !v && setEdit(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit Subject</DialogTitle></DialogHeader>
          <form onSubmit={handleEdit}>
            <SubjectFormFields form={form} set={set} />
            <DialogFooter className="gap-2 pt-4">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setEdit(null)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={updateSubject.isPending}>{updateSubject.isPending ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Exams Tab ─────────────────────────────────────────────────────────────────
function ExamsTab({ orgId, canCreate }: { orgId: number; canCreate: boolean; canEdit: boolean }) {
  const { data: exams = [], isLoading } = useExams(orgId)
  const { data: years = [] }            = useAcademicYears(orgId)
  const createExam = useCreateExam()
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: "", academicYearId: "", examType: "other", startDate: "", endDate: "" })
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }))

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.academicYearId) return
    createExam.mutate({ orgId, data: { ...form, academicYearId: Number(form.academicYearId) } as Record<string, unknown> },
      { onSuccess: () => setOpen(false) })
  }

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Button size="sm" className="cursor-pointer" onClick={() => { setForm({ name: "", academicYearId: "", examType: "other", startDate: "", endDate: "" }); setOpen(true) }}>
            <PlusIcon className="size-3.5" /> Add Exam
          </Button>
        </div>
      )}
      <SimpleTable
        cols={["Name", "Type", "Start", "End", "Status"]}
        isLoading={isLoading}
        rows={exams as any[]}
        renderRow={(ex, i) => (
          <TableRow key={ex.id} className="hover:bg-muted/30">
            <TableCell className="text-center text-xs text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="font-medium text-sm">{ex.name}</TableCell>
            <TableCell><Badge variant="outline" className="text-xs capitalize">{ex.examType?.replace("_", " ")}</Badge></TableCell>
            <TableCell className="text-sm text-muted-foreground">{ex.startDate ?? "—"}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{ex.endDate ?? "—"}</TableCell>
            <TableCell><Badge variant={ex.isActive ? "default" : "outline"} className="text-xs">{ex.isActive ? "Active" : "Inactive"}</Badge></TableCell>
          </TableRow>
        )}
        extraCols={0}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label>Exam Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year *</Label>
              <select value={form.academicYearId} onChange={(e) => set("academicYearId", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— Select —</option>
                {(years as any[]).map((y: any) => <option key={y.id} value={y.id}>{y.name}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Exam Type</Label>
              <select value={form.examType} onChange={(e) => set("examType", e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="unit_test">Unit Test</option>
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" type="button" className="cursor-pointer" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" className="cursor-pointer" disabled={createExam.isPending}>{createExam.isPending ? "Saving…" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Shared simple table ───────────────────────────────────────────────────────
function SimpleTable({ cols, isLoading, rows, renderRow, extraCols }: {
  cols: string[]; isLoading: boolean; rows: any[];
  renderRow: (row: any, idx: number) => React.ReactNode; extraCols: number;
}) {
  const total = cols.length + 1 + extraCols
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10 text-center">#</TableHead>
            {cols.map((c) => <TableHead key={c}>{c}</TableHead>)}
            {extraCols > 0 && <TableHead className="w-20 text-right pr-4">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: total }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                ))}</TableRow>
              ))
            : rows.length === 0
            ? <TableRow><TableCell colSpan={total} className="py-12 text-center text-sm text-muted-foreground">No records found</TableCell></TableRow>
            : rows.map((row, idx) => renderRow(row, idx))
          }
        </TableBody>
      </Table>
    </div>
  )
}
