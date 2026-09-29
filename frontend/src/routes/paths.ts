// Frontend route paths — single source of truth.
// Grouped by domain. Use PATHS.AUTH.LOGIN, PATHS.DASHBOARD, etc.
// Flat aliases (PATHS.LOGIN) are also available for convenience.

export const PATHS = {
  ROOT: "/",

  // ── Auth (/auth/*) ──────────────────────────────────────────────────────────
  AUTH: {
    ROOT:     "/auth",
    LOGIN:    "/auth/login",
    REGISTER: "/auth/register",
  },

  // ── Dashboard ───────────────────────────────────────────────────────────────
  DASHBOARD: "/dashboard",

  // ── Students (/students/*) ──────────────────────────────────────────────────
  STUDENTS: {
    ROOT:   "/students",
    ADD:    "/students/add",
    VIEW:   "/students/view",
    EDIT:   "/students/edit",
    DELETE: "/students/delete",
  },

  // ── Teachers ────────────────────────────────────────────────────────────────
  TEACHERS: "/teachers",

  // ── Schedules & Finance ─────────────────────────────────────────────────────
  CLASS_SCHEDULES: "/class-schedules",
  FEE_MANAGEMENT:  "/fee-management",

  // ── Permissions ─────────────────────────────────────────────────────────────
  USER_PERMISSIONS: "/user-permissions",

  // ── Logs ────────────────────────────────────────────────────────────────────
  SYSTEM_LOGS: "/system-logs",

  // ── System (/system/*) ──────────────────────────────────────────────────────
  SYSTEM: {
    ROOT: "/iam",
    IAM:  "/iam",
    ROLE_PERMISSIONS:  (id: number | string) => `/iam/roles/${id}/permissions`,
    USER_PERMISSIONS:  (id: number | string) => `/iam/users/${id}/permissions`,
  },

  // ── Organization (/organization/*) ──────────────────────────────────────────
  ORGANIZATION: {
    ROOT:       "/organization",
    CREATE:     "/organization/create",
    DETAIL:     (id: number | string) => `/organization/${id}`,
    EDIT:       (id: number | string) => `/organization/${id}/edit`,
    BRANCHES:   (id: number | string) => `/organization/${id}/branches`,
    STAFF:      (id: number | string) => `/organization/${id}/staff`,
    STUDENTS:   (id: number | string) => `/organization/${id}/students`,
    ACADEMICS:  (id: number | string) => `/organization/${id}/academics`,
  },

  // ── Admin ───────────────────────────────────────────────────────────────────
  SETTINGS: "/settings",
  HELP:     "/help",

  // ── Error pages ─────────────────────────────────────────────────────────────
  ERROR: {
    NOT_FOUND:    "/404",
    UNAUTHORIZED: "/403",
    SERVER_ERROR: "/500",
  },
} as const

// Flat aliases — so both PATHS.LOGIN and PATHS.AUTH.LOGIN work
export const LOGIN    = PATHS.AUTH.LOGIN
export const REGISTER = PATHS.AUTH.REGISTER
export const IAM      = PATHS.SYSTEM.IAM

export type AppPath = string
