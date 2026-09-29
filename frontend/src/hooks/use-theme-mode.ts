import { useCallback, useEffect, useState } from "react"

export type ThemeMode = "light" | "dark" | "system"

const STORAGE_KEY = "theme-mode"

function getSystemDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function applyDark(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark)
}

function resolveMode(mode: ThemeMode): boolean {
  if (mode === "dark")   return true
  if (mode === "light")  return false
  return getSystemDark()
}

export function useThemeMode() {
  const [mode, setModeState] = useState<ThemeMode>(
    () => (localStorage.getItem(STORAGE_KEY) as ThemeMode | null) ?? "system"
  )

  const resolvedTheme: "light" | "dark" = resolveMode(mode) ? "dark" : "light"

  useEffect(() => {
    applyDark(resolveMode(mode))
    localStorage.setItem(STORAGE_KEY, mode)

    if (mode !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => applyDark(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [mode])

  const setTheme = useCallback((m: ThemeMode) => setModeState(m), [])

  return { theme: mode, resolvedTheme, setTheme }
}
