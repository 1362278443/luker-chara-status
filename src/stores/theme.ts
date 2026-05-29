import { defineStore } from 'pinia'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ThemePreset {
  id: string
  label: string
  dot: string
  vars: Record<string, string>
}

export interface CustomThemeData {
  accent: string
  text: string
  bg: string
}

// ─── Constants ─────────────────────────────────────────────────────────────

export const THEMES: ThemePreset[] = [
  {
    id: 'sakura',
    label: 'Sakura',
    dot: '#FF8DA1',
    vars: {
      '--cs-pink': '#FF8DA1',
      '--cs-pink-dark': '#E57385',
      '--cs-pink-pale': '#FFF0F2',
      '--cs-text': '#6D2E37',
      '--cs-text-faint': '#B38E94',
      '--cs-bg': 'rgba(255, 245, 246, 0.98)',
      '--cs-bg-muted': 'rgba(255, 235, 238, 0.8)',
      '--cs-border': 'rgba(255, 141, 161, 0.2)',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    dot: '#BAC2DE',
    vars: {
      '--cs-pink': '#F5C2E7',
      '--cs-pink-dark': '#CBA6F7',
      '--cs-pink-pale': '#313244',
      '--cs-text': '#CDD6F4',
      '--cs-text-faint': '#A6ADC8',
      '--cs-bg': 'rgba(30, 30, 46, 0.98)',
      '--cs-bg-muted': 'rgba(24, 24, 37, 0.8)',
      '--cs-border': 'rgba(137, 180, 250, 0.15)',
    },
  },
  {
    id: 'matcha',
    label: 'Matcha',
    dot: '#72B182',
    vars: {
      '--cs-pink': '#72B182',
      '--cs-pink-dark': '#5E966C',
      '--cs-pink-pale': '#EEF7F2',
      '--cs-text': '#2D4B36',
      '--cs-text-faint': '#7D9885',
      '--cs-bg': 'rgba(244, 249, 245, 0.98)',
      '--cs-bg-muted': 'rgba(232, 243, 235, 0.8)',
      '--cs-border': 'rgba(112, 177, 130, 0.2)',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    dot: '#EAA06D',
    vars: {
      '--cs-pink': '#EAA06D',
      '--cs-pink-dark': '#CD8452',
      '--cs-pink-pale': '#FFF5EE',
      '--cs-text': '#593622',
      '--cs-text-faint': '#9B7C6E',
      '--cs-bg': 'rgba(254, 250, 246, 0.98)',
      '--cs-bg-muted': 'rgba(250, 240, 230, 0.8)',
      '--cs-border': 'rgba(234, 160, 109, 0.2)',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    dot: '#6C9FD8',
    vars: {
      '--cs-pink': '#6C9FD8',
      '--cs-pink-dark': '#5486BD',
      '--cs-pink-pale': '#F0F6FC',
      '--cs-text': '#1E3550',
      '--cs-text-faint': '#7C92A6',
      '--cs-bg': 'rgba(245, 248, 252, 0.98)',
      '--cs-bg-muted': 'rgba(235, 242, 248, 0.8)',
      '--cs-border': 'rgba(108, 159, 216, 0.2)',
    },
  },
]

export const DEFAULT_CUSTOM_THEME: CustomThemeData = {
  accent: '#FF8DA1',
  text: '#6D2E37',
  bg: '#FFF5F6',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalizeHex(value: unknown, fallback: string): string {
  const hex = String(value ?? '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) return hex.toUpperCase()
  if (/^#[0-9a-fA-F]{3}$/.test(hex)) {
    return ('#' + hex.slice(1).split('').map((ch) => ch + ch).join('')).toUpperCase()
  }
  return fallback
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = normalizeHex(hex, '#000000').slice(1)
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  }
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return (
    '#' +
    [rgb.r, rgb.g, rgb.b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  )
}

function mixHex(a: string, b: string, weight: number): string {
  const ca = hexToRgb(a)
  const cb = hexToRgb(b)
  return rgbToHex({
    r: ca.r * (1 - weight) + cb.r * weight,
    g: ca.g * (1 - weight) + cb.g * weight,
    b: ca.b * (1 - weight) + cb.b * weight,
  })
}

function rgbaHex(hex: string, alpha: number): string {
  const c = hexToRgb(hex)
  return `rgba(${c.r},${c.g},${c.b},${alpha})`
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useThemeStore = defineStore('theme', () => {
  const currentThemeId = useStorage('cs-theme', 'sakura')
  const customThemeData = useStorage<CustomThemeData>('cs-custom-theme', { ...DEFAULT_CUSTOM_THEME })

  const themeVars = computed<Record<string, string>>(() => {
    if (currentThemeId.value === 'custom') {
      const accent = normalizeHex(customThemeData.value.accent, DEFAULT_CUSTOM_THEME.accent)
      const text = normalizeHex(customThemeData.value.text, DEFAULT_CUSTOM_THEME.text)
      const bg = normalizeHex(customThemeData.value.bg, DEFAULT_CUSTOM_THEME.bg)
      const accentDark = mixHex(accent, '#000000', 0.18)
      const accentPale = mixHex(accent, bg, 0.88)
      const textFaint = mixHex(text, bg, 0.45)

      return {
        '--cs-pink': accent,
        '--cs-pink-dark': accentDark,
        '--cs-pink-pale': accentPale,
        '--cs-text': text,
        '--cs-text-faint': textFaint,
        '--cs-bg': rgbaHex(bg, 0.98),
        '--cs-bg-muted': mixHex(bg, '#000000', 0.03),
        '--cs-border': rgbaHex(accent, 0.16),
      }
    }

    return THEMES.find((t) => t.id === currentThemeId.value)?.vars ?? {}
  })

  return {
    THEMES,
    currentThemeId,
    customThemeData,
    themeVars,
  }
})
