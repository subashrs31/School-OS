import * as React from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ChevronRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganization, useUpdateOrganization } from "@/hooks/organization/useOrganization"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

export default function OrganizationEditPage() {
  const { organizationId } = useParams<{ organizationId: string }>()
  const id = Number(organizationId)
  const { data: org, isLoading } = useOrganization(id)
  const update   = useUpdateOrganization()
  const navigate = useNavigate()

  const [form, setForm] = React.useState({
    name: "", email: "", mobile: "", website: "", schoolTiming: "", address: "",
    socialLinks: { facebook: "", instagram: "", youtube: "", linkedin: "", twitter: "" },
    isActive: true,
  })

  React.useEffect(() => {
    if (!org) return
    setForm({
      name:         org.name         ?? "",
      email:        org.email        ?? "",
      mobile:       org.mobile       ?? "",
      website:      org.website      ?? "",
      schoolTiming: org.schoolTiming ?? "",
      address:      org.address      ?? "",
      socialLinks: {
        facebook:  org.socialLinks?.facebook  ?? "",
        instagram: org.socialLinks?.instagram ?? "",
        youtube:   org.socialLinks?.youtube   ?? "",
        linkedin:  org.socialLinks?.linkedin  ?? "",
        twitter:   org.socialLinks?.twitter   ?? "",
      },
      isActive: org.isActive ?? true,
    })
  }, [org])

  const set = (field: string, value: unknown) => setForm((f) => ({ ...f, [field]: value }))
  const setSocial = (key: string, value: string) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const social = Object.fromEntries(Object.entries(form.socialLinks).filter(([, v]) => v.trim()))
    update.mutate({ id, data: { ...form, socialLinks: social } }, {
      onSuccess: () => navigate(PATHS.ORGANIZATION.DETAIL(id)),
    })
  }

  if (isLoading) return (
    <OrgPageShell>
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3 max-w-2xl">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
      </div>
    </OrgPageShell>
  )

  return (
    <OrgPageShell>
      <div className="space-y-1">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link to={PATHS.ORGANIZATION.ROOT} className="hover:text-foreground transition-colors">Organizations</Link>
          <ChevronRightIcon className="size-3.5" />
          <Link to={PATHS.ORGANIZATION.DETAIL(id)} className="hover:text-foreground transition-colors">{org?.name ?? "…"}</Link>
          <ChevronRightIcon className="size-3.5" />
          <span className="text-foreground">Edit</span>
        </nav>
        <h1 className="text-xl font-bold tracking-tight">Edit School</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>School Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>School Timing</Label>
              <Input value={form.schoolTiming} onChange={(e) => set("schoolTiming", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Website</Label>
              <Input value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Address</Label>
              <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Social Media</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(["facebook", "instagram", "youtube", "linkedin", "twitter"] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label className="capitalize">{key}</Label>
                <Input value={form.socialLinks[key]} onChange={(e) => setSocial(key, e.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Status</h2>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)}
              className="size-4 rounded border-input" />
            <span className="text-sm">Active</span>
          </label>
        </section>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" type="button" className="cursor-pointer"
            onClick={() => navigate(PATHS.ORGANIZATION.DETAIL(id))}>Cancel</Button>
          <Button type="submit" className="cursor-pointer" disabled={update.isPending}>
            {update.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </div>
      </form>
    </OrgPageShell>
  )
}
