"use client"

import * as React from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuBadge, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import {
  LayoutDashboardIcon, UsersIcon, CalendarIcon, CreditCardIcon, ShieldIcon,
  ClipboardListIcon, SettingsIcon, HelpCircleIcon, LogOutIcon,
  ChevronRightIcon, GraduationCapIcon, KeyRoundIcon, BuildingIcon,
} from "lucide-react"
import { useLogout } from "@/hooks/auth/useAuth"
import { useHasPermission } from "@/hooks/auth/usePermissions"
import { PATHS } from "@/routes/paths"

const navItems = [
  { title: "Students",
    icon:  UsersIcon,
    href:  PATHS.STUDENTS.ROOT,
    items: [
      { label: "Add",    href: PATHS.STUDENTS.ADD    },
      { label: "View",   href: PATHS.STUDENTS.VIEW   },
      { label: "Edit",   href: PATHS.STUDENTS.EDIT   },
      { label: "Delete", href: PATHS.STUDENTS.DELETE },
    ],
  },
  { title: "Teachers",         icon: GraduationCapIcon, href: PATHS.TEACHERS,         items: [] },
  { title: "Class Schedules",  icon: CalendarIcon,      href: PATHS.CLASS_SCHEDULES,  items: [] },
  { title: "Fee Management",   icon: CreditCardIcon,    href: PATHS.FEE_MANAGEMENT,   items: [] },
  { title: "User Permissions", icon: ShieldIcon,        href: PATHS.USER_PERMISSIONS, items: [] },
]

const adminItems = [
  { title: "IAM",      icon: KeyRoundIcon,   href: PATHS.SYSTEM.IAM },
  { title: "Settings", icon: SettingsIcon,   href: PATHS.SETTINGS },
  { title: "Help",     icon: HelpCircleIcon, href: PATHS.HELP     },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const [logoutOpen, setLogoutOpen] = React.useState(false)
  const { mutate: logout, isPending: loggingOut } = useLogout()
  const canViewOrgs = useHasPermission("organizations.view")

  return (
    <>
      <Sidebar collapsible="icon" {...props}>

        {/* ── Logo ── */}
        <SidebarHeader className="border-b px-2 py-2">
          <div className="flex h-8 items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="bg-primary-bg flex size-8 shrink-0 items-center justify-center rounded-lg text-primary-foreground">
              <GraduationCapIcon className="size-4" />
            </div>
            <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate text-sm font-semibold">AMR</span>
              <span className="truncate text-xs text-muted-foreground">Management Portal V2.4</span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>

              {/* Dashboard */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === PATHS.DASHBOARD}
                  tooltip="Dashboard"
                  render={<Link to={PATHS.DASHBOARD} />}
                >
                  <LayoutDashboardIcon />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Organizations — permission-gated */}
              {canViewOrgs && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(PATHS.ORGANIZATION.ROOT)}
                    tooltip="Organizations"
                    render={<Link to={PATHS.ORGANIZATION.ROOT} />}
                  >
                    <BuildingIcon />
                    <span>Organizations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {navItems.map((item) =>
                item.items.length > 0 ? (
                  <Collapsible
                    key={item.title}
                    defaultOpen={pathname.startsWith(item.href)}
                    className="group/collapsible"
                    render={<SidebarMenuItem />}
                  >
                    <CollapsibleTrigger render={<SidebarMenuButton tooltip={item.title} isActive={pathname.startsWith(item.href)} />}>
                      <item.icon />
                      <span>{item.title}</span>
                      <ChevronRightIcon className="ml-auto size-4 transition-transform duration-200 group-data-open/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((sub) => (
                          <SidebarMenuSubItem key={sub.label}>
                            <SidebarMenuSubButton
                              isActive={pathname === sub.href}
                              render={<Link to={sub.href} />}
                            >
                              <span>{sub.label}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={pathname === item.href}
                      tooltip={item.title}
                      render={<Link to={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}

              {/* System Logs */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === PATHS.SYSTEM_LOGS}
                  tooltip="System Logs"
                  render={<Link to={PATHS.SYSTEM_LOGS} />}
                >
                  <ClipboardListIcon />
                  <span>System Logs</span>
                </SidebarMenuButton>
                <SidebarMenuBadge className="bg-primary-bg text-primary-foreground rounded-full px-1.5 text-[10px]">
                  10
                </SidebarMenuBadge>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    render={<Link to={item.href} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Logout"
                  onClick={() => setLogoutOpen(true)}
                  disabled={loggingOut}
                >
                  <LogOutIcon />
                  <span>{loggingOut ? "Logging out…" : "Logout"}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </Sidebar>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogoutOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={loggingOut}
              onClick={() => logout()}
            >
              {loggingOut ? "Signing out…" : "Sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
