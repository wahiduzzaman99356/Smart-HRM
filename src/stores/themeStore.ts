import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemePreset {
  name: string;
  label: string;
  primary: string;
  dark: string;
  light: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: 'teal',     label: 'Teal',     primary: '#0f766e', dark: '#115e59', light: '#f0fdfa' },
  { name: 'blue',     label: 'Blue',     primary: '#2563eb', dark: '#1d4ed8', light: '#eff6ff' },
  { name: 'violet',   label: 'Violet',   primary: '#7c3aed', dark: '#6d28d9', light: '#f5f3ff' },
  { name: 'rose',     label: 'Rose',     primary: '#e11d48', dark: '#be123c', light: '#fff1f2' },
  { name: 'amber',    label: 'Amber',    primary: '#d97706', dark: '#b45309', light: '#fffbeb' },
  { name: 'indigo',   label: 'Indigo',   primary: '#4f46e5', dark: '#4338ca', light: '#eef2ff' },
  { name: 'emerald',  label: 'Emerald',  primary: '#059669', dark: '#047857', light: '#ecfdf5' },
  { name: 'sky',      label: 'Sky',      primary: '#0284c7', dark: '#0369a1', light: '#f0f9ff' },
  { name: 'pink',     label: 'Pink',     primary: '#db2777', dark: '#be185d', light: '#fdf2f8' },
  { name: 'orange',   label: 'Orange',   primary: '#ea580c', dark: '#c2410c', light: '#fff7ed' },
  { name: 'fuchsia',  label: 'Fuchsia',  primary: '#a21caf', dark: '#86198f', light: '#fdf4ff' },
  { name: 'slate',    label: 'Slate',    primary: '#475569', dark: '#334155', light: '#f8fafc' },
];

export type ThemeMode       = 'light' | 'dark' | 'system';
export type BorderRadiusMode = 'sharp' | 'default' | 'rounded';
export type DensityMode     = 'compact' | 'default' | 'spacious';
export type FontFamilyMode  = 'manrope' | 'inter' | 'system';
export type TopbarStyle     = 'gradient' | 'minimal';
export type PresetName      = string;

export interface ThemeState {
  mode: ThemeMode;
  presetName: PresetName;
  primaryColor: string;
  primaryDark: string;
  primaryLight: string;
  borderRadius: BorderRadiusMode;
  density: DensityMode;
  fontFamily: FontFamilyMode;
  topbarStyle: TopbarStyle;

  setMode: (mode: ThemeMode) => void;
  applyPreset: (name: string) => void;
  setCustomColor: (primary: string, dark: string, light: string) => void;
  setBorderRadius: (r: BorderRadiusMode) => void;
  setDensity: (d: DensityMode) => void;
  setFontFamily: (f: FontFamilyMode) => void;
  setTopbarStyle: (s: TopbarStyle) => void;
  reset: () => void;
}

const DEFAULT_PRESET = THEME_PRESETS[0];

const DEFAULT_STATE = {
  mode:        'light'    as ThemeMode,
  presetName:  DEFAULT_PRESET.name,
  primaryColor: DEFAULT_PRESET.primary,
  primaryDark:  DEFAULT_PRESET.dark,
  primaryLight: DEFAULT_PRESET.light,
  borderRadius: 'default' as BorderRadiusMode,
  density:     'default'  as DensityMode,
  fontFamily:  'manrope'  as FontFamilyMode,
  topbarStyle: 'gradient' as TopbarStyle,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      setMode: (mode) => set({ mode }),

      applyPreset: (name) => {
        const preset = THEME_PRESETS.find((p) => p.name === name);
        if (!preset) return;
        set({
          presetName:  preset.name,
          primaryColor: preset.primary,
          primaryDark:  preset.dark,
          primaryLight: preset.light,
        });
      },

      setCustomColor: (primary, dark, light) =>
        set({ presetName: 'custom', primaryColor: primary, primaryDark: dark, primaryLight: light }),

      setBorderRadius: (borderRadius) => set({ borderRadius }),
      setDensity:      (density)      => set({ density }),
      setFontFamily:   (fontFamily)   => set({ fontFamily }),
      setTopbarStyle:  (topbarStyle)  => set({ topbarStyle }),

      reset: () => set({ ...DEFAULT_STATE }),
    }),
    { name: 'zyrova-theme-v1' },
  ),
);
