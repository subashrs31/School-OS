import * as React from "react"
import { useAppDispatch, useAppSelector } from "@/store/store"
import {
  setColorPreset as reduxSetColorPreset,
  setCustomColor as reduxSetCustomColor,
  setGradient    as reduxSetGradient,
  setFontFamily  as reduxSetFontFamily,
  setFontSize    as reduxSetFontSize,
  resetTheme     as reduxResetTheme,
  type ColorPreset,
  type FontFamily,
  type GradientConfig,
  type ToastPosition,
  type ToastType,
} from "@/store/custom/customizerSlice"

export type { ColorPreset, FontFamily, GradientConfig, ToastPosition, ToastType }

// ── CSS applier ──────────────────────────────────────────────────────────────

const PRESETS: Record<string, { light: string; dark: string; lightFg: string; darkFg: string }> = {
  default: { light: "oklch(0.205 0 0)",          dark: "oklch(0.922 0 0)",           lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.205 0 0)" },
  blue:    { light: "oklch(0.546 0.245 262.881)", dark: "oklch(0.707 0.165 254.624)", lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.145 0 0)" },
  green:   { light: "oklch(0.527 0.154 150.069)", dark: "oklch(0.696 0.17  162.48)",  lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.145 0 0)" },
  purple:  { light: "oklch(0.558 0.288 302.321)", dark: "oklch(0.702 0.183 293.541)", lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.145 0 0)" },
  orange:  { light: "oklch(0.646 0.222 41.116)",  dark: "oklch(0.75  0.183 55.934)",  lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.145 0 0)" },
  red:     { light: "oklch(0.577 0.245 27.325)",  dark: "oklch(0.704 0.191 22.216)",  lightFg: "oklch(0.985 0 0)", darkFg: "oklch(0.145 0 0)" },
}

const fontMap: Record<FontFamily, string> = {
  geist:   "'Geist Variable', sans-serif",
  inter:   "'Inter Variable', sans-serif",
  roboto:  "'Roboto Variable', sans-serif",
  poppins: "'Poppins', sans-serif",
}

function hexToOklch(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)
  const x = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const y = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const z = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l_ = Math.cbrt(x), m_ = Math.cbrt(y), s_ = Math.cbrt(z)
  const L    =  0.2104542553 * l_ + 0.793617785  * m_ - 0.0040720468 * s_
  const a    =  1.9779984951 * l_ - 2.428592205  * m_ + 0.4505937099 * s_
  const bVal =  0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766  * s_
  const C    = Math.sqrt(a * a + bVal * bVal)
  const H    = (Math.atan2(bVal, a) * 180) / Math.PI
  return `oklch(${L.toFixed(3)} ${C.toFixed(3)} ${H < 0 ? H + 360 : H})`
}

interface ApplyArgs {
  colorPreset: ColorPreset
  customColor: string
  gradient:    GradientConfig | null
  fontFamily:  FontFamily
  fontSize:    number
}

// Compute a tinted hover color by interpolating between primary and sidebar bg
function mixOklch(primary: string, dark: boolean): string {
  // Parse L, C, H from oklch(L C H)
  const m = primary.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.e+-]+)\)/)
  if (!m) return dark ? "oklch(0.269 0 0)" : "oklch(0.94 0 0)"
  const L = parseFloat(m[1])
  const C = parseFloat(m[2])
  const H = parseFloat(m[3])
  // Sidebar bg: light = oklch(0.985 0 0), dark = oklch(0.205 0 0)
  const bgL = dark ? 0.205 : 0.985
  const t   = 0.13 // 13% primary tint
  const rL  = L * t + bgL * (1 - t)
  const rC  = C * t
  return `oklch(${rL.toFixed(3)} ${rC.toFixed(4)} ${H.toFixed(2)})`
}

export function applySettings(s: ApplyArgs) {
  const root = document.documentElement
  const dark = root.classList.contains("dark")

  root.style.setProperty("--font-sans",    fontMap[s.fontFamily])
  root.style.setProperty("--font-heading", fontMap[s.fontFamily])
  root.style.fontSize = `${s.fontSize}px`

  if (s.gradient) {
    const { from, to, direction } = s.gradient
    const fromOklch = hexToOklch(from)
    const L  = parseFloat(fromOklch.replace("oklch(", ""))
    const fg = L > 0.6 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
    const grad = `linear-gradient(${direction}, ${from}, ${to})`
    // Sidebar hover: very subtle tint of the primary color
    const hoverBg = mixOklch(fromOklch, dark)
    root.style.setProperty("--primary-bg",                 grad)
    root.style.setProperty("--primary",                    fromOklch)
    root.style.setProperty("--primary-foreground",         fg)
    root.style.setProperty("--ring",                       fromOklch)
    root.style.setProperty("--sidebar-primary",            fromOklch)
    root.style.setProperty("--sidebar-primary-foreground", fg)
    root.style.setProperty("--sidebar-accent",             hoverBg)
    root.style.setProperty("--sidebar-accent-foreground",  dark ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)")
    root.style.setProperty("--sidebar-hover-bg",           hoverBg)
    root.style.setProperty("--primary-gradient",           grad)
  } else {
    let primaryOklch: string
    let fgOklch: string
    if (s.colorPreset === "custom") {
      primaryOklch = hexToOklch(s.customColor)
      const L = parseFloat(primaryOklch.replace("oklch(", ""))
      fgOklch = L > 0.6 ? "oklch(0.145 0 0)" : "oklch(0.985 0 0)"
    } else {
      const p = PRESETS[s.colorPreset] ?? PRESETS.default
      primaryOklch = dark ? p.dark   : p.light
      fgOklch      = dark ? p.darkFg : p.lightFg
    }
    // Sidebar hover: subtle tint — never the full primary
    const hoverBg = mixOklch(primaryOklch, dark)
    root.style.setProperty("--primary-bg",                 primaryOklch)
    root.style.setProperty("--primary",                    primaryOklch)
    root.style.setProperty("--primary-foreground",         fgOklch)
    root.style.setProperty("--ring",                       primaryOklch)
    root.style.setProperty("--sidebar-primary",            primaryOklch)
    root.style.setProperty("--sidebar-primary-foreground", fgOklch)
    root.style.setProperty("--sidebar-accent",             hoverBg)
    root.style.setProperty("--sidebar-accent-foreground",  dark ? "oklch(0.985 0 0)" : "oklch(0.145 0 0)")
    root.style.setProperty("--sidebar-hover-bg",           hoverBg)
    root.style.setProperty("--primary-gradient",           primaryOklch)
  }
}

// ── Context (thin wrapper over Redux for component convenience) ──────────────

interface ThemeContextValue {
  colorPreset:    ColorPreset
  customColor:    string
  gradient:       GradientConfig | null
  fontFamily:     FontFamily
  fontSize:       number
  setColorPreset: (v: ColorPreset)           => void
  setCustomColor: (v: string)                => void
  setGradient:    (v: GradientConfig | null) => void
  setFontFamily:  (v: FontFamily)            => void
  setFontSize:    (v: number)                => void
  resetTheme:     ()                         => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dispatch   = useAppDispatch()
  const customizer = useAppSelector((s) => s.customizer)

  const settings: ApplyArgs = {
    colorPreset: customizer.colorPreset,
    customColor: customizer.customColor,
    gradient:    customizer.gradient,
    fontFamily:  customizer.fontFamily,
    fontSize:    customizer.fontSize,
  }

  // Apply CSS vars whenever Redux state changes
  React.useEffect(() => {
    applySettings(settings)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customizer.colorPreset, customizer.customColor, customizer.gradient, customizer.fontFamily, customizer.fontSize])

  // Re-apply when next-themes toggles .dark on <html> — use a ref to avoid stale closure
  const settingsRef = React.useRef(settings)
  React.useEffect(() => { settingsRef.current = settings })

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => applySettings(settingsRef.current))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value: ThemeContextValue = {
    colorPreset:    customizer.colorPreset,
    customColor:    customizer.customColor,
    gradient:       customizer.gradient,
    fontFamily:     customizer.fontFamily,
    fontSize:       customizer.fontSize,
    setColorPreset: (v) => dispatch(reduxSetColorPreset(v)),
    setCustomColor: (v) => dispatch(reduxSetCustomColor(v)),
    setGradient:    (v) => dispatch(reduxSetGradient(v)),
    setFontFamily:  (v) => dispatch(reduxSetFontFamily(v)),
    setFontSize:    (v) => dispatch(reduxSetFontSize(v)),
    resetTheme:     ()  => dispatch(reduxResetTheme()),
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useThemeSettings() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useThemeSettings must be used within ThemeProvider")
  return ctx
}
