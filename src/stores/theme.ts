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

const BG_LIGHT = 'rgba(250,250,250,0.98)'
const BG_MUTED_LIGHT = 'rgba(244,244,245,0.8)'
const TEXT_LIGHT = '#09090b'
const TEXT_FAINT_LIGHT = '#71717a'

export const THEMES: ThemePreset[] = [
  {
    id: 'sakura',
    label: 'Sakura',
    dot: '#E11D48',
    vars: {
      '--cs-pink': '#E11D48', '--cs-pink-dark': '#BE123C', '--cs-pink-pale': '#FFE4E6',
      '--cs-text': TEXT_LIGHT, '--cs-text-faint': TEXT_FAINT_LIGHT,
      '--cs-bg': BG_LIGHT, '--cs-bg-muted': BG_MUTED_LIGHT, '--cs-border': 'rgba(225,29,72,0.15)',
    },
  },
  {
    id: 'midnight',
    label: 'Midnight',
    dot: '#18181B',
    vars: {
      '--cs-pink': '#FAFAFA', '--cs-pink-dark': '#E4E4E7', '--cs-pink-pale': '#27272A',
      '--cs-text': '#FAFAFA', '--cs-text-faint': '#A1A1AA',
      '--cs-bg': 'rgba(9,9,11,0.98)', '--cs-bg-muted': 'rgba(24,24,27,0.8)', '--cs-border': 'rgba(255,255,255,0.1)',
    },
  },
  {
    id: 'matcha',
    label: 'Emerald',
    dot: '#059669',
    vars: {
      '--cs-pink': '#059669', '--cs-pink-dark': '#047857', '--cs-pink-pale': '#D1FAE5',
      '--cs-text': TEXT_LIGHT, '--cs-text-faint': TEXT_FAINT_LIGHT,
      '--cs-bg': BG_LIGHT, '--cs-bg-muted': BG_MUTED_LIGHT, '--cs-border': 'rgba(5,150,105,0.15)',
    },
  },
  {
    id: 'amber',
    label: 'Amber',
    dot: '#D97706',
    vars: {
      '--cs-pink': '#D97706', '--cs-pink-dark': '#B45309', '--cs-pink-pale': '#FEF3C7',
      '--cs-text': TEXT_LIGHT, '--cs-text-faint': TEXT_FAINT_LIGHT,
      '--cs-bg': BG_LIGHT, '--cs-bg-muted': BG_MUTED_LIGHT, '--cs-border': 'rgba(217,119,6,0.15)',
    },
  },
  {
    id: 'ocean',
    label: 'Ocean',
    dot: '#0284C7',
    vars: {
      '--cs-pink': '#0284C7', '--cs-pink-dark': '#0369A1', '--cs-pink-pale': '#E0F2FE',
      '--cs-text': TEXT_LIGHT, '--cs-text-faint': TEXT_FAINT_LIGHT,
      '--cs-bg': BG_LIGHT, '--cs-bg-muted': BG_MUTED_LIGHT, '--cs-border': 'rgba(2,132,199,0.15)',
    },
  },
]

export const DEFAULT_CUSTOM_THEME: CustomThemeData = {
  accent: '#E11D48',
  text: '#09090b',
  bg: '#FAFAFA',
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
