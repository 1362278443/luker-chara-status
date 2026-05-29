<template>
  <Transition name="cs-popover">
    <div v-if="visible" class="fixed flex flex-col gap-[8px] bg-[var(--cs-bg)] border border-[var(--cs-border)] rounded-[16px] p-[12px] shadow-[var(--cs-shadow-md)] z-[10001] cs-font"
         :style="computedStyle" ref="popoverRef">
    <div class="flex items-center gap-[8px]">
      <div v-for="t in THEMES" :key="t.id"
           class="w-[24px] h-[24px] rounded-full cursor-pointer border-[2px] transition-all duration-200 shrink-0 shadow-sm"
           :class="[currentThemeId === t.id ? 'scale-110 border-[var(--cs-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'border-transparent hover:scale-110']"
           :style="{ background: t.dot }"
           :title="t.label"
           @click="selectTheme(t.id)">
      </div>
      
      <div class="w-[1px] h-[16px] bg-[var(--cs-border)] mx-1"></div>
      
      <!-- Custom Theme Dot -->
      <div class="w-[24px] h-[24px] rounded-full cursor-pointer border-[2px] transition-all duration-200 shrink-0 flex items-center justify-center text-white shadow-sm"
           :class="[currentThemeId === 'custom' ? 'scale-110 border-[var(--cs-text)] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'border-transparent hover:scale-110']"
           :style="{ background: customThemeData.accent }"
           title="Custom"
           @click.stop="toggleCustom()">
        <i class="fa-solid fa-sliders text-[10px] drop-shadow-sm"></i>
      </div>
    </div>
    
    <!-- Custom Editor -->
    <div v-if="showCustomEditor" class="grid grid-cols-3 gap-[8px] border-t border-[var(--cs-border)] pt-[10px] mt-[2px]">
      <label class="flex flex-col gap-[4px] text-[10px] font-bold text-[var(--cs-text-faint)] tracking-wide">
        <span>Accent</span>
        <input type="color" v-model="customThemeData.accent" class="w-full h-[28px] border border-[var(--cs-border)] rounded-[8px] p-[2px] bg-[var(--cs-bg)] cursor-pointer shadow-sm">
      </label>
      <label class="flex flex-col gap-[4px] text-[10px] font-bold text-[var(--cs-text-faint)] tracking-wide">
        <span>Text</span>
        <input type="color" v-model="customThemeData.text" class="w-full h-[28px] border border-[var(--cs-border)] rounded-[8px] p-[2px] bg-[var(--cs-bg)] cursor-pointer shadow-sm">
      </label>
      <label class="flex flex-col gap-[4px] text-[10px] font-bold text-[var(--cs-text-faint)] tracking-wide">
        <span>Base BG</span>
        <input type="color" v-model="customThemeData.bg" class="w-full h-[28px] border border-[var(--cs-border)] rounded-[8px] p-[2px] bg-[var(--cs-bg)] cursor-pointer shadow-sm">
      </label>
      <button class="col-span-3 h-[30px] border border-[var(--cs-border)] rounded-[8px] bg-[var(--cs-bg-muted)] text-[var(--cs-text)] text-[12px] font-bold cursor-pointer transition-all hover:border-[var(--cs-text-faint)] hover:shadow-sm active:scale-[0.98] mt-1" @click="resetCustom">Reset Custom</button>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { useThemeStore, DEFAULT_CUSTOM_THEME } from '@/stores/theme'

interface Props {
  visible: boolean
  anchorRect: DOMRect | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const popoverRef = ref<HTMLElement | null>(null)
const themeStore = useThemeStore()
const THEMES = themeStore.THEMES
const { currentThemeId, customThemeData } = storeToRefs(themeStore)

const showCustomEditor = ref(false)
const { width: ww, height: wh } = useWindowSize()

const computedStyle = computed<Record<string, string | undefined>>(() => {
  if (!props.anchorRect) return { top: '64px', right: '16px' }
  const rect = props.anchorRect
  // Default: below and right-aligned to the button
  let top = rect.bottom + 8
  let left = rect.right - 200 // Approx width of popover
  
  // If too close to bottom, show above
  if (top + 150 > wh.value) {
    top = rect.top - 8 - 150
  }
  
  // Keep within bounds
  left = Math.max(8, Math.min(left, ww.value - 208))
  
  return { top: `${top}px`, left: `${left}px` }
})

watch(() => props.visible, (val) => {
  if (val && currentThemeId.value === 'custom') {
    showCustomEditor.value = true
  } else if (!val) {
    showCustomEditor.value = false
  }
})

onClickOutside(popoverRef, () => {
  emit('update:visible', false)
})

function selectTheme(id: string): void {
  currentThemeId.value = id
  emit('update:visible', false)
}

function toggleCustom(): void {
  currentThemeId.value = 'custom'
  showCustomEditor.value = !showCustomEditor.value
}

function resetCustom(): void {
  customThemeData.value = { ...DEFAULT_CUSTOM_THEME }
}
</script>

<style scoped>
.cs-popover-enter-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.cs-popover-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.cs-popover-enter-from,
.cs-popover-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
