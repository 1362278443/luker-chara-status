<template>
  <div :style="themeVars">
    <!-- Floating Button -->
    <FloatingButton 
      :active="isPanelVisible"
      :blink="isBlinking"
      @click="togglePanel"
      ref="btnComponent"
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

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import { MODULE_NAME, STATE_NS, DEFAULT_TEMPLATE } from './constants.js'
import { useTheme } from './composables/useTheme.js'
import { useLuker } from './composables/useLuker.js'

import FloatingButton from './components/FloatingButton.vue'
import StatusPanel from './components/StatusPanel.vue'
import ThemePopover from './components/ThemePopover.vue'
import TemplateEditor from './components/TemplateEditor.vue'

const { themeVars } = useTheme()
const { lukerState, avatarHtml, updateState, getLukerContextSafe, getAvatarId } = useLuker()

// Visibility State
const isPanelVisible = ref(false)
const isEditorVisible = ref(false)
const isThemePopoverVisible = ref(false)
const themeBtnRect = ref(null)
const isBlinking = ref(false)

// Template State
const currentTemplate = ref(DEFAULT_TEMPLATE)

const renderedHtml = computed(() => {
  let tmpl = currentTemplate.value.replace('{{__avatar__}}', avatarHtml.value)
  return tmpl.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (match, key) => {
    const k = key.toLowerCase()
    let val = lukerState[k] !== undefined ? lukerState[k] : lukerState[key]
    return val !== undefined ? String(val) : match
  })
})

const btnComponent = ref(null)
const btnRect = computed(() => {
  if (!btnComponent.value || !btnComponent.value.$el) return null
  return btnComponent.value.$el.getBoundingClientRect()
})

function togglePanel() {
  isPanelVisible.value = !isPanelVisible.value
  if (isPanelVisible.value) {
    updateState()
  } else {
    isThemePopoverVisible.value = false
  }
}

function toggleThemePopover(e) {
  e.stopPropagation()
  isThemePopoverVisible.value = !isThemePopoverVisible.value
  if (isThemePopoverVisible.value && e.currentTarget) {
    themeBtnRect.value = e.currentTarget.getBoundingClientRect()
  }
}

function onTemplateSaved(tmpl) {
  currentTemplate.value = tmpl
}

// Luker Bridge
let ctx = null

async function loadTemplate() {
  const avatarId = getAvatarId()
  if (!avatarId) {
    try {
      const ctx = getLukerContextSafe()
      if (ctx && ctx.extensionSettings && ctx.extensionSettings[MODULE_NAME] && ctx.extensionSettings[MODULE_NAME].template) {
        currentTemplate.value = ctx.extensionSettings[MODULE_NAME].template
        return
      }
    } catch(e) {}
    const saved = localStorage.getItem(`${MODULE_NAME}-template`)
    if (saved) currentTemplate.value = saved
    return
  }
  try {
    const data = ctx && ctx.getCharacterState ? await ctx.getCharacterState(avatarId, STATE_NS) : null
    if (data && data.template) currentTemplate.value = data.template
  } catch(e) {}
}

const onMessageRendered = () => { if (isPanelVisible.value) updateState() }
const onMessageReceived = () => {
  if (isPanelVisible.value) {
    isBlinking.value = true
    setTimeout(() => isBlinking.value = false, 1000)
  }
}
const onMessageSent = () => { if (isPanelVisible.value) updateState() }
const onChatChanged = async () => {
  currentTemplate.value = DEFAULT_TEMPLATE
  await loadTemplate()
  if (isPanelVisible.value) updateState()
}
const onAppReady = async () => {
  await loadTemplate()
  if (isPanelVisible.value) updateState()
}

onMounted(async () => {
  const checkCtx = () => {
    ctx = getLukerContextSafe()
    if (ctx && ctx.eventSource && ctx.eventTypes) {
      ctx.eventSource.on(ctx.eventTypes.MESSAGE_RENDERED, onMessageRendered)
      ctx.eventSource.on(ctx.eventTypes.MESSAGE_RECEIVED, onMessageReceived)
      ctx.eventSource.on(ctx.eventTypes.MESSAGE_SENT, onMessageSent)
      ctx.eventSource.on(ctx.eventTypes.CHAT_CHANGED, onChatChanged)
      ctx.eventSource.on(ctx.eventTypes.CHAT_LOADED, onChatChanged)
      ctx.eventSource.on(ctx.eventTypes.APP_READY, onAppReady)
      
      loadTemplate()
    } else {
      setTimeout(checkCtx, 100)
    }
  }
  checkCtx()
})
</script>
