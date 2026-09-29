import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader, DashboardActions } from "@/components/site-header"
import { MasterControlPanel } from "@/components/master-control-panel"
import { SystemAlerts } from "@/components/system-alerts"
import { RecentRecords } from "@/components/recent-records"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        {/* Main scrollable content */}
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-5 py-5">

            {/* Page title + actions */}
            <DashboardActions />

            {/* Stat cards */}
            <SectionCards />

            {/* Master control panel */}
            <MasterControlPanel />

            {/* Attendance chart + System Alerts */}
            <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
              <div className="lg:col-span-2">
                <ChartAreaInteractive />
              </div>
              <SystemAlerts />
            </div>

            {/* Recent Records (custom simple table) */}
            <RecentRecords />

            {/* Original full-featured DataTable */}
            <DataTable data={data} />

          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
