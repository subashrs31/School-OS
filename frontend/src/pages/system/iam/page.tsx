import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { UsersIcon, ShieldIcon, KeyIcon } from "lucide-react"
import { UsersTab } from "./components/UsersTab"
import { RolesTab } from "./components/RolesTab"
import { PermissionsTab } from "./components/PermissionsTab"

const TABS = [
  { id: "users",       label: "Users",       icon: UsersIcon  },
  { id: "roles",       label: "Roles",       icon: ShieldIcon },
  { id: "permissions", label: "Permissions", icon: KeyIcon    },
] as const

type TabId = typeof TABS[number]["id"]

export default function IamPage() {
  const [activeTab, setActiveTab] = React.useState<TabId>("users")

  return (
    <SidebarProvider style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-5 px-4 py-6 lg:px-6">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Identity & Access Management</h1>
            <p className="text-sm text-muted-foreground">Manage users, roles, and permissions</p>
          </div>

          <div className="flex gap-1 rounded-lg border bg-muted/40 p-1 w-fit">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={[
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  activeTab === id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {activeTab === "users"       && <UsersTab />}
            {activeTab === "roles"       && <RolesTab />}
            {activeTab === "permissions" && <PermissionsTab />}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
