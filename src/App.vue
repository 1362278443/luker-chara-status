<template>
  <div :style="themeVars">
    <!-- Floating Button -->
    <FloatingButton
      :active="isPanelVisible"
      :blink="isBlinking"
      ref="btnComponent"
      @click="togglePanel"
    />

    <!-- Status Panel -->
    <StatusPanel
      v-model:visible="isPanelVisible"
      :renderedHtml="renderedHtml"
      :btnRect="btnRect"
      @open-editor="isEditorVisible = true"
      @toggle-theme="toggleThemePopover"
    />

    <!-- Theme Popover -->
    <ThemePopover
      v-model:visible="isThemePopoverVisible"
      :anchorRect="themeBtnRect"
    />

    <!-- Template Editor -->
    <TemplateEditor
      v-model:visible="isEditorVisible"
      :initialTemplate="currentTemplate"
      @template-saved="onTemplateSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { MODULE_NAME, STATE_NS, DEFAULT_TEMPLATE } from '@/constants'
import { useLukerStore, getLukerContextSafe } from '@/stores/luker'
import { useThemeStore } from '@/stores/theme'

const lukerStore = useLukerStore()
const themeStore = useThemeStore()

const { themeVars } = storeToRefs(themeStore)
const { lukerState, avatarHtml } = storeToRefs(lukerStore)

// ── Visibility State ───────────────────────────────────────────────────────
const isPanelVisible = ref(false)
const isEditorVisible = ref(false)
const isThemePopoverVisible = ref(false)
const themeBtnRect = ref<DOMRect | null>(null)
const isBlinking = ref(false)

// ── Template State ─────────────────────────────────────────────────────────
const currentTemplate = ref(DEFAULT_TEMPLATE)

const renderedHtml = computed(() => {
  let tmpl = currentTemplate.value.replace('{{__avatar__}}', avatarHtml.value)
  return tmpl.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (_match, key: string) => {
    const k = key.toLowerCase()
    const val = lukerState.value[k] !== undefined ? lukerState.value[k] : lukerState.value[key]
    return val !== undefined ? String(val) : _match
  })
})

// ── Button Rect ────────────────────────────────────────────────────────────
const btnComponent = ref<{ $el: HTMLElement } | null>(null)
const btnRect = computed(() => btnComponent.value?.$el.getBoundingClientRect() ?? null)

// ── Actions ────────────────────────────────────────────────────────────────
function togglePanel(): void {
  isPanelVisible.value = !isPanelVisible.value
  if (isPanelVisible.value) {
    lukerStore.updateState()
  } else {
    isThemePopoverVisible.value = false
  }
}

function toggleThemePopover(e: MouseEvent): void {
  e.stopPropagation()
  isThemePopoverVisible.value = !isThemePopoverVisible.value
  if (isThemePopoverVisible.value && e.currentTarget) {
    themeBtnRect.value = (e.currentTarget as HTMLElement).getBoundingClientRect()
  }
}

function onTemplateSaved(tmpl: string): void {
  currentTemplate.value = tmpl
}

// ── Template Loading ───────────────────────────────────────────────────────
let ctx: ReturnType<typeof getLukerContextSafe> = null

async function loadTemplate(): Promise<void> {
  const avatarId = lukerStore.getAvatarId()
  if (!avatarId) {
    try {
      const c = getLukerContextSafe()
      const saved = c?.extensionSettings?.[MODULE_NAME]?.['template']
      if (saved) { currentTemplate.value = saved as string; return }
    } catch { /* ignore */ }
    const saved = localStorage.getItem(`${MODULE_NAME}-template`)
    if (saved) currentTemplate.value = saved
    return
  }
  try {
    const data = ctx?.getCharacterState ? await ctx.getCharacterState(avatarId, STATE_NS) : null
    if (data?.['template']) currentTemplate.value = data['template'] as string
  } catch { /* ignore */ }
}

// ── ST Event Listeners ─────────────────────────────────────────────────────
const onMessageRendered = () => { if (isPanelVisible.value) lukerStore.updateState() }
const onMessageReceived = () => {
  if (isPanelVisible.value) {
    isBlinking.value = true
    setTimeout(() => (isBlinking.value = false), 1000)
  }
}
const onMessageSent = () => { if (isPanelVisible.value) lukerStore.updateState() }
const onChatChanged = async () => {
  currentTemplate.value = DEFAULT_TEMPLATE
  await loadTemplate()
  if (isPanelVisible.value) lukerStore.updateState()
}
const onAppReady = async () => {
  await loadTemplate()
  if (isPanelVisible.value) lukerStore.updateState()
}

onMounted(async () => {
  const checkCtx = () => {
    ctx = getLukerContextSafe()
    if (ctx?.eventSource && ctx.eventTypes) {
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_RENDERED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_RECEIVED'], onMessageReceived)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_SENT'], onMessageSent)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_SWIPED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_DELETED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_SWIPE_DELETED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_EDITED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['MESSAGE_UPDATED'], onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes['CHAT_CHANGED'], onChatChanged)
      ctx.eventSource.on(ctx.eventTypes['CHAT_LOADED'], onChatChanged)
      ctx.eventSource.on(ctx.eventTypes['APP_READY'], onAppReady)
      loadTemplate()
    } else {
      setTimeout(checkCtx, 100)
    }
  }
  checkCtx()
})
</script>
