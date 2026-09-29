import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeControllerDrawer } from "@/components/theme-controller-drawer"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useThemeSettings } from "@/context/ThemeContext"
import { SearchIcon, BellIcon, ChevronDownIcon, UserPlusIcon, DownloadIcon, UserIcon, MailIcon, PhoneIcon, BuildingIcon, RotateCcwIcon, LogOutIcon, SettingsIcon } from "lucide-react"
import * as React from "react"

function ProfileDrawer() {
  const [open, setOpen] = React.useState(false)
  const theme = useThemeSettings()

  function handleReset() {
    theme.resetTheme()
  }

  return (
    <>
      <Avatar className="size-8 cursor-pointer" onClick={() => setOpen(true)}>
        <AvatarFallback className="bg-primary-bg text-primary-foreground text-xs font-medium">
          AD
        </AvatarFallback>
      </Avatar>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 flex flex-col gap-0 p-0 [&>button]:text-primary-foreground [&>button]:top-3 [&>button]:right-3">
          <SheetHeader className="sr-only">
            <SheetTitle>Profile</SheetTitle>
            <SheetDescription>User profile and settings</SheetDescription>
          </SheetHeader>

          {/* Profile hero */}
          <div className="flex flex-col items-center gap-3 bg-primary-bg px-6 py-8">
            <Avatar className="size-16 ring-2 ring-primary-foreground/30">
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
                AD
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p className="font-semibold text-primary-foreground">Admin User</p>
              <p className="text-xs text-primary-foreground/70">System Administrator</p>
            </div>
            <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs">
              Super Admin
            </Badge>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-3 px-5 py-5 border-b">
            {([
              { icon: MailIcon,     label: "Email",  value: "admin@educontrol.edu" },
              { icon: PhoneIcon,    label: "Phone",  value: "+1 (555) 000-0000" },
              { icon: BuildingIcon, label: "Branch", value: "Main Campus" },
            ] as const).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                  <p className="truncate text-sm font-medium">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1.5 px-4 py-4">
            <Button variant="ghost" className="justify-start gap-2 text-sm" size="sm">
              <UserIcon className="size-4" />
              Edit Profile
            </Button>
            <Button variant="ghost" className="justify-start gap-2 text-sm" size="sm">
              <SettingsIcon className="size-4" />
              Account Settings
            </Button>
            <Separator className="my-1" />
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              size="sm"
              onClick={handleReset}
            >
              <RotateCcwIcon className="size-4" />
              Reset to Default Theme
            </Button>
            <Button
              variant="ghost"
              className="justify-start gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
              size="sm"
            >
              <LogOutIcon className="size-4" />
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur-md backdrop-saturate-150 lg:px-6">
      <SidebarTrigger className="-ml-1 shrink-0" />
      <Separator orientation="vertical" className="mx-1 h-4 data-vertical:self-auto" />

      {/* Search */}
      <div className="relative hidden w-52 md:block">
        <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-8 pl-8 text-sm" placeholder="Search students, staff..." />
      </div>

      {/* Nav tabs */}
      <nav className="ml-4 hidden items-center gap-5 lg:flex">
        {(["Admin", "Academic", "Finance", "HR"] as const).map((item) => (
          <a
            key={item}
            href="#"
            className={
              item === "Admin"
                ? "text-sm font-semibold text-primary"
                : "text-sm text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            {item}
          </a>
        ))}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="outline" size="sm" className="hidden gap-1 text-xs sm:flex">
          2025-2026 Year
          <ChevronDownIcon className="size-3" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8">
          <BellIcon className="size-4" />
        </Button>
        <ThemeControllerDrawer trigger="topbar" />
        <ProfileDrawer />
      </div>
    </header>
  )
}

export function DashboardActions() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 px-4 pt-4 lg:px-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Here is your overview.</p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Button variant="outline" size="sm">
          <DownloadIcon className="size-3.5" />
          Export Data
        </Button>
        <Button size="sm">
          <UserPlusIcon className="size-3.5" />
          Add Student
        </Button>
      </div>
    </div>
  )
}
