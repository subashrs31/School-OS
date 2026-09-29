import { useAppSelector, useAppDispatch } from "@/store/store";
import {
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
  resetTheme,
} from "@/store/custom/customizerSlice";

/**
 * Single unified hook for all theme state — reads from Redux customizer slice.
 * Replaces both the old useThemeSettings() + separate customizer selectors.
 */
export const useTheme = () => {
  const dispatch   = useAppDispatch();
  const customizer = useAppSelector((s) => s.customizer);

  return {
    // ── State ──────────────────────────────────────────────────────────────
    activeMode:       customizer.activeMode,
    activeDir:        customizer.activeDir,
    borderRadius:     customizer.borderRadius,
    isCollapse:       customizer.isCollapse,
    isMobileSidebar:  customizer.isMobileSidebar,
    sidebarWidth:     customizer.SidebarWidth,
    miniSidebarWidth: customizer.MiniSidebarWidth,
    colorPreset:      customizer.colorPreset,
    customColor:      customizer.customColor,
    gradient:         customizer.gradient,
    fontFamily:       customizer.fontFamily,
    fontSize:         customizer.fontSize,

    // ── Actions ────────────────────────────────────────────────────────────
    setDarkMode:          (v: typeof customizer.activeMode)   => dispatch(setDarkMode(v)),
    setDir:               (v: typeof customizer.activeDir)    => dispatch(setDir(v)),
    toggleSidebar:        ()                                  => dispatch(toggleSidebar()),
    setBorderRadius:      (v: number)                         => dispatch(setBorderRadius(v)),
    toggleMobileSidebar:  ()                                  => dispatch(toggleMobileSidebar()),
    setColorPreset:       (v: typeof customizer.colorPreset)  => dispatch(setColorPreset(v)),
    setCustomColor:       (v: string)                         => dispatch(setCustomColor(v)),
    setGradient:          (v: typeof customizer.gradient)     => dispatch(setGradient(v)),
    setFontFamily:        (v: typeof customizer.fontFamily)   => dispatch(setFontFamily(v)),
    setFontSize:          (v: number)                         => dispatch(setFontSize(v)),
    resetTheme:           ()                                  => dispatch(resetTheme()),
  };
};
