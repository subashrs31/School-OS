import { createSlice } from "@reduxjs/toolkit";

// ── Types ────────────────────────────────────────────────────────────────────

export type ThemeMode     = "light" | "dark" | "system";
export type Direction     = "ltr" | "rtl";
export type ColorPreset   = "default" | "blue" | "green" | "purple" | "orange" | "red" | "custom";
export type FontFamily    = "geist" | "inter" | "roboto" | "poppins";
export type ToastPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
export type ToastType     = "hot-toast" | "default";

export interface GradientConfig {
  from:      string; // hex e.g. "#6366f1"
  to:        string; // hex e.g. "#ec4899"
  direction: string; // e.g. "to right" | "135deg"
}

// ── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "theme-settings";

type PersistedTheme = {
  colorPreset?:   ColorPreset;
  customColor?:   string;
  gradient?:      GradientConfig | null;
  fontFamily?:    FontFamily;
  fontSize?:      number;
  toastPosition?: ToastPosition;
  toastType?:     ToastType;
};

function load(): PersistedTheme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(state: StateType) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      colorPreset:   state.colorPreset,
      customColor:   state.customColor,
      gradient:      state.gradient,
      fontFamily:    state.fontFamily,
      fontSize:      state.fontSize,
      toastPosition: state.toastPosition,
      toastType:     state.toastType,
    } satisfies PersistedTheme));
  } catch { /* ignore */ }
}

// ── State ────────────────────────────────────────────────────────────────────

interface StateType {
  // Layout / sidebar
  activeDir:        Direction;
  activeMode:       ThemeMode;
  SidebarWidth:     number;
  MiniSidebarWidth: number;
  TopbarHeight:     number;
  isCollapse:       boolean;
  borderRadius:     number;
  isMobileSidebar:  boolean;

  // Color / font — mirrors theme-controller-drawer fields
  colorPreset:   ColorPreset;
  customColor:   string;
  gradient:      GradientConfig | null;
  fontFamily:    FontFamily;
  fontSize:      number;
  toastPosition: ToastPosition;
  toastType:     ToastType;
}

const p = load();

const initialState: StateType = {
  activeDir:        "ltr",
  activeMode:       (sessionStorage.getItem("mode") as ThemeMode) || "system",
  SidebarWidth:     240,
  MiniSidebarWidth: 76,
  TopbarHeight:     70,
  isCollapse:       false,
  borderRadius:     7,
  isMobileSidebar:  false,

  // Restored from localStorage, fallback to defaults
  colorPreset:   p.colorPreset   ?? "default",
  customColor:   p.customColor   ?? "#3b82f6",
  gradient:      p.gradient      ?? null,
  fontFamily:    p.fontFamily    ?? "geist",
  fontSize:      p.fontSize      ?? 16,
  toastPosition: p.toastPosition ?? "top-right",
  toastType:     p.toastType     ?? "hot-toast",
};

// ── Slice ────────────────────────────────────────────────────────────────────

export const CustomizerSlice = createSlice({
  name: "customizer",
  initialState,
  reducers: {
    // Layout
    setDarkMode: (state, action: { payload: ThemeMode }) => {
      state.activeMode = action.payload;
      sessionStorage.setItem("mode", action.payload);
    },
    setDir: (state, action: { payload: Direction }) => {
      state.activeDir = action.payload;
    },
    toggleSidebar: (state) => {
      state.isCollapse = !state.isCollapse;
    },
    setBorderRadius: (state, action: { payload: number }) => {
      state.borderRadius = action.payload;
    },
    toggleMobileSidebar: (state) => {
      state.isMobileSidebar = !state.isMobileSidebar;
    },

    // Color preset — clears gradient (matches drawer: clicking a preset clears gradient)
    setColorPreset: (state, action: { payload: ColorPreset }) => {
      state.colorPreset = action.payload;
      state.gradient    = null;
      save(state);
    },

    // Custom hex color — sets preset to "custom", clears gradient
    setCustomColor: (state, action: { payload: string }) => {
      state.customColor = action.payload;
      state.colorPreset = "custom";
      state.gradient    = null;
      save(state);
    },

    // Gradient — null clears it (matches drawer clearGradient)
    setGradient: (state, action: { payload: GradientConfig | null }) => {
      state.gradient = action.payload;
      // When gradient is applied, keep colorPreset as-is (drawer doesn't change it)
      save(state);
    },

    // Font family
    setFontFamily: (state, action: { payload: FontFamily }) => {
      state.fontFamily = action.payload;
      save(state);
    },

    // Font size (drawer range: 12–20)
    setFontSize: (state, action: { payload: number }) => {
      state.fontSize = action.payload;
      save(state);
    },

    // Toast type
    setToastType: (state, action: { payload: ToastType }) => {
      state.toastType = action.payload;
      save(state);
    },

    // Toast position
    setToastPosition: (state, action: { payload: ToastPosition }) => {
      state.toastPosition = action.payload;
      save(state);
    },

    // Reset — matches drawer handleReset defaults exactly
    resetTheme: (state) => {
      state.colorPreset   = "default";
      state.customColor   = "#3b82f6";
      state.gradient      = null;
      state.fontFamily    = "geist";
      state.fontSize      = 16;
      state.toastPosition = "top-right";
      state.toastType     = "hot-toast";
      save(state);
    },
  },
});

export const {
  setDarkMode,
  setDir,
  toggleSidebar,
  setBorderRadius,
  toggleMobileSidebar,
  setColorPreset,
  setCustomColor,
  setGradient,
  setFontFamily,
  setFontSize,
  setToastPosition,
  setToastType,
  resetTheme,
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
