import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCreateOrganization } from "@/hooks/organization/useOrganization"
import { PATHS } from "@/routes/paths"
import { OrgPageShell } from "../OrgPageShell"

const BLANK = {
  name: "", email: "", mobile: "", website: "", schoolTiming: "", address: "",
  socialLinks: { facebook: "", instagram: "", youtube: "", linkedin: "", twitter: "" },
}

export default function OrganizationCreatePage() {
  const [form, setForm]   = React.useState(BLANK)
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const create   = useCreateOrganization()
  const navigate = useNavigate()

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const setSocial = (key: string, value: string) =>
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }))

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e["name"] = "School name is required"
    setErrors(e)
    return !Object.keys(e).length
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    const payload: Record<string, unknown> = { ...form }
    // strip empty social links
    const social = Object.fromEntries(Object.entries(form.socialLinks).filter(([, v]) => v.trim()))
    payload["socialLinks"] = social
    create.mutate(payload, {
      onSuccess: () => navigate(PATHS.ORGANIZATION.ROOT),
    })
  }

  return (
    <OrgPageShell>
      <div>
        <h1 className="text-xl font-bold tracking-tight">Add School</h1>
        <p className="text-sm text-muted-foreground">Create a new school organization</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Basic Info */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>School Name *</Label>
              <Input placeholder="e.g. Sunrise Academy" value={form.name} onChange={(e) => set("name", e.target.value)} />
              {errors["name"] && <p className="text-xs text-destructive">{errors["name"]}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>School Timing</Label>
              <Input placeholder="e.g. 8:00 AM – 3:00 PM" value={form.schoolTiming} onChange={(e) => set("schoolTiming", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contact Information</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="school@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Mobile</Label>
              <Input placeholder="+91 99999 99999" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Website</Label>
              <Input placeholder="https://school.example.com" value={form.website} onChange={(e) => set("website", e.target.value)} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Address</Label>
              <Input placeholder="Full address" value={form.address} onChange={(e) => set("address", e.target.value)} />
            </div>
          </div>
        </section>

        {/* Social Media */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Social Media</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(["facebook", "instagram", "youtube", "linkedin", "twitter"] as const).map((key) => (
              <div key={key} className="space-y-1.5">
                <Label className="capitalize">{key}</Label>
                <Input placeholder={`https://${key}.com/…`}
                  value={form.socialLinks[key]}
                  onChange={(e) => setSocial(key, e.target.value)} />
              </div>
            ))}
          </div>
        </section>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" type="button" className="cursor-pointer" onClick={() => navigate(PATHS.ORGANIZATION.ROOT)}>
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer" disabled={create.isPending}>
            {create.isPending ? "Creating…" : "Create School"}
          </Button>
        </div>
      </form>
    </OrgPageShell>
  )
}
