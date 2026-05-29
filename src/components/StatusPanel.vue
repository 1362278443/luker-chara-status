<template>
  <Transition name="cs-panel">
    <div
      v-show="visible"
      ref="panelRef"
      class="absolute z-[9] flex flex-col overflow-hidden cs-font rounded-[20px] shadow-[var(--cs-shadow-lg)] sm:min-w-[260px] sm:min-h-[220px] sm:left-[14px] sm:right-auto sm:top-[72px] sm:bottom-auto pointer-events-auto bg-[var(--cs-bg)] border border-[var(--cs-border)]"
      :style="[style, { width: `${panelSize.w}px`, height: `${panelSize.h}px`, minWidth: '220px', minHeight: '180px', maxWidth: 'calc(100vw - 28px)', maxHeight: 'calc(100dvh - 96px)' }]"
    >
      <!-- Header (Draggable Handle) -->
      <div
        class="relative z-1 flex items-center justify-between p-[12px_16px] border-b border-[var(--cs-border)] shrink-0 cursor-grab select-none active:cursor-grabbing bg-[var(--cs-bg-muted)]"
        @mousedown="startHeaderDrag"
        @touchstart="startHeaderDrag"
      >
        <span class="flex items-center gap-[8px] text-[13px] font-bold text-[var(--cs-text)] tracking-tight">
          <i class="fa-solid fa-chart-simple text-[var(--cs-pink)]"></i> Status
        </span>
        <div class="flex items-center gap-[4px] cursor-auto" @mousedown.stop @touchstart.stop>
          <button
            class="w-[28px] h-[28px] border-none rounded-[8px] bg-transparent text-[var(--cs-text-faint)] text-[12px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:text-[var(--cs-text)] hover:shadow-[var(--cs-shadow-sm)] active:scale-95 shrink-0"
            title="Theme"
            @click="$emit('toggle-theme', $event)"
          >
            <i class="fa-solid fa-palette"></i>
          </button>
          <button
            class="w-[28px] h-[28px] border-none rounded-[8px] bg-transparent text-[var(--cs-text-faint)] text-[12px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:text-[var(--cs-text)] hover:shadow-[var(--cs-shadow-sm)] active:scale-95 shrink-0"
            title="Edit Template"
            @click="$emit('open-editor')"
          >
            <i class="fa-solid fa-pen"></i>
          </button>
          <div class="w-[1px] h-[14px] bg-[var(--cs-border)] mx-1"></div>
          <button
            class="w-[28px] h-[28px] border-none rounded-[8px] bg-transparent text-[var(--cs-text-faint)] text-[12px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:text-[var(--cs-text)] hover:shadow-[var(--cs-shadow-sm)] active:scale-95 shrink-0"
            title="Close"
            @click="$emit('update:visible', false)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Content (Rendered template) -->
      <div
        class="relative z-1 flex-1 overflow-y-auto p-[16px] [scrollbar-width:thin] [scrollbar-color:var(--cs-border)_transparent] text-[var(--cs-text)]"
        v-html="renderedHtml"
      ></div>

      <!-- Empty State -->
      <div
        v-if="!renderedHtml || renderedHtml.includes('__EMPTY__')"
        class="relative z-1 flex flex-col items-center justify-center flex-1 gap-[12px] p-[20px] text-center text-[var(--cs-text-faint)] text-[12px] leading-[1.6]"
      >
        <div class="w-[48px] h-[48px] rounded-full bg-[var(--cs-bg-muted)] border border-[var(--cs-border)] flex items-center justify-center shadow-[var(--cs-shadow-sm)]">
          <i class="fa-regular fa-comment-dots text-[20px] text-[var(--cs-text-faint)] opacity-60"></i>
        </div>
        <div>在角色卡里用 <code v-pre class="cs-mono text-[11px] bg-[var(--cs-bg)] border border-[var(--cs-border)] text-[var(--cs-pink)] p-[2px_6px] rounded-[6px] shadow-sm">{{setvar::变量名::值}}</code><br>写入变量后自动显示</div>
      </div>

      <!-- Resize Handle -->
      <div
        class="absolute bottom-0 right-0 w-[24px] h-[24px] cursor-se-resize touch-none opacity-40 hover:opacity-100 transition-opacity flex items-end justify-end p-[4px] text-[var(--cs-text-faint)] z-10"
        @mousedown.stop.prevent="startResize"
        @touchstart.stop.prevent="startResize"
      >
        <svg viewBox="0 0 24 24" class="w-[12px] h-[12px] fill-current"><path d="M22 22H10L22 10V22Z"/></svg>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  renderedHtml: string
  btnRect: DOMRect | null
}

interface PanelSize {
  w: number
  h: number
}

interface PanelPos {
  x: number | undefined
  y: number | undefined
}

const props = defineProps<Props>()
defineEmits<{
  'update:visible': [value: boolean]
  'open-editor': []
  'toggle-theme': [event: MouseEvent]
}>()

const panelRef = ref<HTMLElement | null>(null)
const { width: ww, height: wh } = useWindowSize()

// Persistent size & position
const panelSize = useStorage<PanelSize>('cs-panel-size', { w: 260, h: 380 })
const posStorage = useStorage<PanelPos>('cs-panel-pos-v2', { x: undefined, y: undefined })

// Position style
const style = computed<Record<string, string>>(() => {
  let x = posStorage.value.x
  let y = posStorage.value.y

  if (x === undefined && props.btnRect) {
    const w = panelSize.value.w
    const h = panelSize.value.h
    const gap = 10
    x = props.btnRect.left - w - gap
    if (x < 0) x = props.btnRect.right + gap
    y = props.btnRect.bottom - h
    if ((y ?? 0) < 0) y = props.btnRect.top
  } else if (x === undefined) {
    x = ww.value - panelSize.value.w - 80
    y = wh.value - panelSize.value.h - 80
  }

  const finalX = Math.max(0, Math.min(ww.value - panelSize.value.w, x ?? 0))
  const finalY = Math.max(0, Math.min(wh.value - panelSize.value.h, y ?? 0))

  return { left: `${finalX}px`, top: `${finalY}px`, right: 'auto', bottom: 'auto' }
})

// ── Dragging ───────────────────────────────────────────────────────────────
function startHeaderDrag(e: MouseEvent | TouchEvent): void {
  const pt = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent)
  const startX = pt.clientX
  const startY = pt.clientY
  const r = panelRef.value!.getBoundingClientRect()
  const startLeft = r.left
  const startTop = r.top

  const move = (ev: MouseEvent | TouchEvent) => {
    ev.preventDefault()
    const p = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0] : (ev as MouseEvent)
    posStorage.value = {
      x: Math.max(0, Math.min(ww.value - panelSize.value.w, startLeft + p.clientX - startX)),
      y: Math.max(0, Math.min(wh.value - panelSize.value.h, startTop + p.clientY - startY)),
    }
  }
  const end = () => {
    document.removeEventListener('mousemove', move as EventListener)
    document.removeEventListener('touchmove', move as EventListener)
    document.removeEventListener('mouseup', end)
    document.removeEventListener('touchend', end)
  }
  document.addEventListener('mousemove', move as EventListener, { passive: false })
  document.addEventListener('touchmove', move as EventListener, { passive: false })
  document.addEventListener('mouseup', end)
  document.addEventListener('touchend', end)
}

// ── Resizing ───────────────────────────────────────────────────────────────
function startResize(e: MouseEvent | TouchEvent): void {
  e.preventDefault()
  const pt = (e as TouchEvent).touches ? (e as TouchEvent).touches[0] : (e as MouseEvent)
  const startX = pt.clientX
  const startY = pt.clientY
  const startW = panelSize.value.w
  const startH = panelSize.value.h

  const move = (ev: MouseEvent | TouchEvent) => {
    const p = (ev as TouchEvent).touches ? (ev as TouchEvent).touches[0] : (ev as MouseEvent)
    panelSize.value = {
      w: Math.max(200, Math.min(500, startW + p.clientX - startX)),
      h: Math.max(160, Math.min(700, startH + p.clientY - startY)),
    }
  }
  const end = () => {
    document.removeEventListener('mousemove', move as EventListener)
    document.removeEventListener('touchmove', move as EventListener)
    document.removeEventListener('mouseup', end)
    document.removeEventListener('touchend', end)
  }
  document.addEventListener('mousemove', move as EventListener)
  document.addEventListener('touchmove', move as EventListener)
  document.addEventListener('mouseup', end)
  document.addEventListener('touchend', end)
}
</script>

<style scoped>
.cs-panel-enter-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.cs-panel-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1), transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.cs-panel-enter-from,
.cs-panel-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.98);
}
</style>
