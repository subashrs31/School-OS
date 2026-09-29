"use client"

import * as React from "react"
import { MoonIcon, SunIcon, Settings2Icon, MonitorIcon, CheckIcon, RotateCcwIcon } from "lucide-react"
import { useThemeMode } from "@/hooks/use-theme-mode"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  type ColorPreset,
  type FontFamily,
  type GradientConfig,
  type ToastPosition,
  type ToastType,
  useThemeSettings,
} from "@/context/ThemeContext"
import { useAppDispatch, useAppSelector } from "@/store/store"
import { setToastPosition, setToastType } from "@/store/custom/customizerSlice"
import { cn } from "cn"

const colorPresets: { value: ColorPreset; label: string; hex: string }[] = [
  { value: "default", label: "Default", hex: "#18181b" },
  { value: "blue",    label: "Blue",    hex: "#3b82f6" },
  { value: "green",   label: "Green",   hex: "#10b981" },
  { value: "purple",  label: "Purple",  hex: "#8b5cf6" },
  { value: "orange",  label: "Orange",  hex: "#f97316" },
  { value: "red",     label: "Red",     hex: "#ef4444" },
]

const gradientDirections = [
  { label: "→",    value: "to right" },
  { label: "↓",    value: "to bottom" },
  { label: "↗",    value: "to top right" },
  { label: "↘",    value: "to bottom right" },
  { label: "135°", value: "135deg" },
  { label: "45°",  value: "45deg" },
]

const fonts: { value: FontFamily; label: string }[] = [
  { value: "geist",   label: "Geist"   },
  { value: "inter",   label: "Inter"   },
  { value: "roboto",  label: "Roboto"  },
  { value: "poppins", label: "Poppins" },
]

const modes = [
  { value: "light",  label: "Light",  icon: SunIcon    },
  { value: "system", label: "System", icon: MonitorIcon },
  { value: "dark",   label: "Dark",   icon: MoonIcon   },
] as const

const toastPositions: { value: ToastPosition; label: string }[] = [
  { value: "top-left",      label: "Top Left"      },
  { value: "top-center",    label: "Top Center"    },
  { value: "top-right",     label: "Top Right"     },
  { value: "bottom-left",   label: "Bottom Left"   },
  { value: "bottom-center", label: "Bottom Center" },
  { value: "bottom-right",  label: "Bottom Right"  },
]

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
      {children}
    </p>
  )
}

function ColorSwatch({
  color,
  onChange,
  label,
}: {
  color: string
  onChange: (hex: string) => void
  label: string
}) {
  return (
    <label className="flex flex-col items-center gap-1 cursor-pointer">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="relative size-9 rounded-md border border-border ring-1 ring-black/10 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundColor: color }} />
        <input
          type="color"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{color}</span>
    </label>
  )
}

export function ThemeControllerDrawer({ trigger = "floating" }: { trigger?: "floating" | "topbar" }) {
  const [open, setOpen] = React.useState(false)
  const [customHex, setCustomHex] = React.useState("#3b82f6")
  const [customHexError, setCustomHexError] = React.useState(false)
  const [gradFrom, setGradFrom] = React.useState("#6366f1")
  const [gradTo, setGradTo]     = React.useState("#ec4899")
  const [gradDir, setGradDir]   = React.useState("to right")

  const dispatch      = useAppDispatch()
  const toastPosition = useAppSelector((s) => s.customizer.toastPosition)
  const toastType     = useAppSelector((s) => s.customizer.toastType)

  const isMobile = useIsMobile()
  const { resolvedTheme, theme, setTheme } = useThemeMode()
  const {
    colorPreset, customColor,
    gradient,
    setColorPreset, setCustomColor, setGradient,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    resetTheme,
  } = useThemeSettings()

  function handleReset() {
    resetTheme()
    dispatch(setToastPosition("top-right"))
    dispatch(setToastType("hot-toast"))
    setCustomHex("#3b82f6")
    setGradFrom("#6366f1")
    setGradTo("#ec4899")
    setGradDir("to right")
  }

  React.useEffect(() => {
    if (!open) return
    setCustomHex(customColor)
    if (gradient) {
      setGradFrom(gradient.from)
      setGradTo(gradient.to)
      setGradDir(gradient.direction)
    }
  }, [open, customColor, gradient])

  const isGradientActive = gradient !== null
  const previewGradient  = `linear-gradient(${gradDir}, ${gradFrom}, ${gradTo})`

  function applyGradient() {
    setGradient({ from: gradFrom, to: gradTo, direction: gradDir } satisfies GradientConfig)
  }

  function clearGradient() {
    setGradient(null)
    setColorPreset("default")
  }

  function handleCustomHexApply() {
    const val   = customHex.trim()
    const isHex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val)
    if (!isHex) { setCustomHexError(true); return }
    setCustomHexError(false)
    const full = val.length === 4
      ? "#" + val[1] + val[1] + val[2] + val[2] + val[3] + val[3]
      : val
    setCustomColor(full)
  }

  const triggerEl =
    trigger === "floating" ? (
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 size-12 rounded-full shadow-lg"
        aria-label="Open settings"
      >
        <Settings2Icon className="size-5" />
      </Button>
    ) : (
      <Button variant="ghost" size="icon-sm" aria-label="Open settings">
        <Settings2Icon className="size-4" />
      </Button>
    )

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      showSwipeHandle={isMobile}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerTrigger render={triggerEl} />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Settings</DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* ── Mode ── */}
          <div>
            <SectionLabel>Mode</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {modes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors",
                    theme === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <Icon className="size-4" />
                  {label}
                </button>
              ))}
            </div>
            {theme === "system" && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                Currently using <span className="font-medium">{resolvedTheme}</span> mode
              </p>
            )}
          </div>

          {/* ── Color Presets ── */}
          <div>
            <SectionLabel>Color Preset</SectionLabel>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setColorPreset(preset.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    !isGradientActive && colorPreset === preset.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span
                    className="size-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: preset.hex }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom solid color */}
            <div className="mt-3 rounded-lg border border-border p-3 space-y-2">
              <p className="text-xs font-medium">Custom solid color</p>
              <div className="flex gap-2">
                <label className="relative flex items-center shrink-0">
                  <span
                    className="size-9 rounded-md border border-border cursor-pointer ring-1 ring-black/10 block"
                    style={{ backgroundColor: customHex }}
                  />
                  <input
                    type="color"
                    value={customHex.length === 7 ? customHex : customColor}
                    onChange={(e) => { setCustomHex(e.target.value); setCustomHexError(false) }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
                <input
                  type="text"
                  placeholder="#3b82f6"
                  value={customHex}
                  onChange={(e) => { setCustomHex(e.target.value); setCustomHexError(false) }}
                  onKeyDown={(e) => e.key === "Enter" && handleCustomHexApply()}
                  className={cn(
                    "flex-1 rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring",
                    customHexError ? "border-destructive" : "border-border"
                  )}
                />
                <Button size="icon-sm" variant="outline" onClick={handleCustomHexApply} className="shrink-0">
                  <CheckIcon className="size-3.5" />
                </Button>
              </div>
              {customHexError && (
                <p className="text-xs text-destructive">Enter a valid hex (e.g. #3b82f6)</p>
              )}
            </div>
          </div>

          {/* ── Gradient ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Gradient</SectionLabel>
              {isGradientActive && (
                <button
                  onClick={clearGradient}
                  className="text-xs text-destructive hover:underline mb-2"
                >
                  Clear
                </button>
              )}
            </div>

            <div
              className="h-10 w-full rounded-lg mb-3 border border-border ring-1 ring-black/5"
              style={{ backgroundImage: previewGradient }}
            />

            <div className="flex items-start justify-around mb-3">
              <ColorSwatch color={gradFrom} onChange={setGradFrom} label="From" />
              <div className="flex items-center self-center pb-4">
                <div className="h-px w-8 bg-border" />
                <span className="text-xs text-muted-foreground px-1">→</span>
                <div className="h-px w-8 bg-border" />
              </div>
              <ColorSwatch color={gradTo} onChange={setGradTo} label="To" />
            </div>

            <div className="mb-3">
              <p className="mb-1.5 text-xs text-muted-foreground">Direction</p>
              <div className="grid grid-cols-6 gap-1">
                {gradientDirections.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setGradDir(d.value)}
                    className={cn(
                      "rounded-md border py-1.5 text-xs font-medium transition-colors",
                      gradDir === d.value
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border hover:bg-muted"
                    )}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              onClick={applyGradient}
              style={isGradientActive ? { backgroundImage: previewGradient, backgroundColor: "transparent" } : {}}
            >
              {isGradientActive ? "Update Gradient" : "Apply Gradient"}
            </Button>
          </div>

          {/* ── Font Family ── */}
          <div>
            <SectionLabel>Font Family</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFontFamily(f.value)}
                  className={cn(
                    "flex flex-col items-start rounded-lg border px-3 py-2 transition-colors",
                    fontFamily === f.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span className="text-base font-medium leading-tight">Aa</span>
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Font Size ── */}
          <div>
            <SectionLabel>Font Size</SectionLabel>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-6 shrink-0">12</span>
              <input
                type="range"
                min={12}
                max={20}
                step={1}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-primary cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-6 shrink-0 text-right">20</span>
              <span className="w-14 shrink-0 rounded-md bg-primary px-2 py-0.5 text-center text-xs font-medium text-primary-foreground">
                {fontSize}px
              </span>
            </div>
          </div>

          {/* ── Toast Type ── */}
          <div>
            <SectionLabel>Toast Style</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: "hot-toast" as ToastType, label: "Hot Toast",  desc: "Minimal & fast"    },
                { value: "default"   as ToastType, label: "Default",    desc: "Shadcn Sonner"     },
              ] as { value: ToastType; label: string; desc: string }[]).map((t) => (
                <button
                  key={t.value}
                  onClick={() => dispatch(setToastType(t.value))}
                  className={cn(
                    "flex flex-col items-start rounded-lg border px-3 py-2 transition-colors",
                    toastType === t.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">{t.label}</span>
                  <span className="text-xs text-muted-foreground">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Toast Position ── */}
          <div>
            <SectionLabel>Toast Position</SectionLabel>
            <div className="grid grid-cols-2 gap-2">
              {toastPositions.map((p) => (
                <button
                  key={p.value}
                  onClick={() => dispatch(setToastPosition(p.value))}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                    toastPosition === p.value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        <DrawerFooter className="flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            onClick={handleReset}
          >
            <RotateCcwIcon className="size-3.5" />
            Reset
          </Button>
          <DrawerClose render={<Button variant="outline" className="flex-1">Close</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
