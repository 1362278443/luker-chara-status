<template>
  <Transition name="cs-editor">
    <div v-if="visible" class="cs-editor-overlay absolute inset-0 z-20 bg-[rgba(0,0,0,0.5)] flex flex-col justify-end p-0 pointer-events-auto sm:items-center sm:justify-center sm:p-5"
         @mousedown.self="close">
      
      <div class="cs-editor-modal bg-[var(--cs-bg)] overflow-hidden flex flex-col shadow-[var(--cs-shadow-lg)] cs-font relative w-full h-[85vh] rounded-[24px_24px_0_0] border-t border-[var(--cs-border)] sm:min-w-[480px] sm:min-h-[360px] sm:rounded-[20px] sm:border sm:border-[var(--cs-border)]"
           :style="wrapStyle" ref="wrapRef">
      
      <!-- Head -->
      <div class="flex items-center justify-between p-[16px_20px] border-b border-[var(--cs-border)] shrink-0 bg-[var(--cs-bg-muted)]">
        <span class="flex items-center gap-[8px] text-[14px] font-bold text-[var(--cs-text)] tracking-tight">
          <i class="fa-solid fa-code text-[var(--cs-pink)]"></i> Template Studio
        </span>
        <div class="flex items-center gap-2">
          <button class="w-[32px] h-[32px] border border-transparent rounded-[10px] bg-transparent text-[var(--cs-text-faint)] text-[14px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:border-[var(--cs-border)] hover:text-[var(--cs-text)] hover:shadow-sm shrink-0" title="Import" @click="importTemplate">
            <i class="fa-solid fa-file-import text-[0.85em]"></i>
          </button>
          <button class="w-[32px] h-[32px] border border-transparent rounded-[10px] bg-transparent text-[var(--cs-text-faint)] text-[14px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:border-[var(--cs-border)] hover:text-[var(--cs-text)] hover:shadow-sm shrink-0" title="Export" @click="exportTemplate">
            <i class="fa-solid fa-file-export text-[0.85em]"></i>
          </button>
          <div class="w-[1px] h-[16px] bg-[var(--cs-border)] mx-1"></div>
          <button class="w-[32px] h-[32px] border border-transparent rounded-[10px] bg-transparent text-[var(--cs-text-faint)] text-[14px] cursor-pointer flex items-center justify-center transition-all hover:bg-[var(--cs-bg)] hover:border-[var(--cs-border)] hover:text-[var(--cs-text)] hover:shadow-sm shrink-0" title="Close" @click="close">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex flex-col flex-1 overflow-hidden relative sm:flex-row">
        
        <!-- Left: Code Editor -->
        <div class="flex flex-col flex-1 p-[16px] gap-[12px] min-h-[200px] overflow-hidden" :style="leftPaneStyle">
          <div class="flex-1 min-h-0 relative rounded-[12px] border border-[var(--cs-border)] overflow-hidden transition-all duration-300 shadow-inner focus-within:border-[var(--cs-pink)] focus-within:shadow-[0_0_0_3px_var(--cs-pink-pale)]">
            <codemirror
              v-model="code"
              :extensions="extensions"
              class="absolute inset-0 h-full text-[13px] cs-mono"
            />
          </div>

          <div class="flex gap-[8px] shrink-0 flex-wrap">
            <button class="flex items-center justify-center gap-[6px] p-[10px_16px] rounded-[10px] text-[12px] font-bold cs-font border border-[var(--cs-border)] cursor-pointer transition-colors whitespace-nowrap bg-[var(--cs-bg-muted)] text-[var(--cs-text)] hover:border-[var(--cs-text-faint)] shadow-sm" @click="resetToDefault">
              <i class="fa-solid fa-rotate-left"></i> 重置
            </button>
            <button class="flex items-center justify-center gap-[6px] p-[10px_16px] rounded-[10px] text-[12px] font-bold cs-font border-none cursor-pointer transition-colors whitespace-nowrap flex-1 text-white shadow-sm" :class="[saved ? 'bg-emerald-500' : 'bg-[var(--cs-pink)] hover:opacity-90']" @click="save">
              <i v-if="saved" class="fa-solid fa-check"></i>
              <i v-else class="fa-solid fa-floppy-disk"></i>
              {{ saved ? '已保存' : '保存' }}
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-[6px] w-full bg-[var(--cs-border)] cursor-row-resize shrink-0 transition-colors flex items-center justify-center hover:bg-[var(--cs-pink)] sm:w-[6px] sm:h-full sm:cursor-col-resize"
             @mousedown="startDividerDrag" @touchstart="startDividerDrag">
          <div class="bg-[var(--cs-text-faint)] rounded-full w-[32px] h-[2px] opacity-40 sm:w-[2px] sm:h-[32px]"></div>
        </div>

        <!-- Right: Preview & Variables -->
        <div class="h-[250px] w-full shrink-0 flex flex-col p-[16px] gap-[12px] overflow-y-auto min-h-[180px] bg-[var(--cs-bg-muted)] sm:w-[300px] sm:h-full sm:border-l sm:border-[var(--cs-border)]" :style="rightPaneStyle">
          <div class="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--cs-text-faint)] flex items-center gap-[6px] shrink-0">
            <i class="fa-solid fa-eye text-[12px]"></i> 实时预览
          </div>
          
          <div class="bg-[var(--cs-bg)] border border-[var(--cs-border)] rounded-[12px] p-[16px] min-h-[80px] shrink-0 overflow-hidden text-[var(--cs-text)] shadow-sm" v-html="previewHtml"></div>
          
          <div class="text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--cs-text-faint)] flex items-center gap-[6px] shrink-0 mt-2">
            <i class="fa-solid fa-database text-[12px]"></i> 当前变量
            <span class="font-normal normal-case tracking-normal opacity-65 ml-1">（点击复制）</span>
          </div>
          
          <div class="flex flex-col gap-2">
            <div v-if="lukerVars.length === 0" class="text-[12px] text-[var(--cs-text-faint)] leading-[1.7] p-4 bg-[var(--cs-bg)] border border-[var(--cs-border)] rounded-[10px]">
              尚无本地变量。在角色卡里用 <code v-pre class="cs-mono text-[11px] bg-[var(--cs-pink-pale)] text-[var(--cs-pink)] p-[2px_6px] rounded-[6px]">{{setvar::变量名::值}}</code> 写入后自动显示。
            </div>
            <div v-for="v in lukerVars" :key="v.key"
                 class="group p-[10px_12px] rounded-[10px] bg-[var(--cs-bg)] border border-[var(--cs-border)] cursor-pointer transition-colors text-[var(--cs-text)] hover:border-[var(--cs-pink)] hover:shadow-sm"
                 @click="copyVar(v.key, $event)">
              <div class="flex items-center justify-between gap-[8px]">
                <code class="cs-mono text-[12px] text-[var(--cs-pink)] bg-transparent! break-all flex-1"><span v-pre>{{</span>{{ v.key }}<span v-pre>}}</span></code>
                <span class="text-[10px] font-extrabold p-[2px_8px] rounded-full shrink-0 bg-[var(--cs-bg-muted)] text-[var(--cs-text-faint)] border border-[var(--cs-border)] group-hover:text-[var(--cs-pink)] group-hover:border-[var(--cs-pink-pale)] transition-colors">Local</span>
              </div>
              <div class="text-[11px] text-[var(--cs-text-faint)] mt-[6px] whitespace-nowrap overflow-hidden text-ellipsis">{{ v.value.slice(0,50) }}</div>
            </div>
          </div>
        </div>

      </div>

      <!-- Editor Window Resize Handle -->
      <div v-show="!isMobile" class="absolute bottom-0 right-0 w-[24px] h-[24px] cursor-se-resize touch-none opacity-40 hover:opacity-100 transition-opacity flex items-end justify-end p-[4px] text-[var(--cs-text-faint)] z-10"
           @mousedown.stop.prevent="startWindowDrag" @touchstart.stop.prevent="startWindowDrag">
        <svg viewBox="0 0 24 24" class="w-[12px] h-[12px] fill-current"><path d="M22 22H10L22 10V22Z"/></svg>
      </div>
           
    </div>
  </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { html } from '@codemirror/lang-html'
import { oneDark } from '@codemirror/theme-one-dark'
import { useLuker } from '../composables/useLuker.js'
import { DEFAULT_TEMPLATE, MODULE_NAME, STATE_NS } from '../constants.js'
import { useStorage, useWindowSize } from '@vueuse/core'

const props = defineProps({ visible: Boolean, initialTemplate: String })
const emit = defineEmits(['update:visible', 'template-saved'])

const { lukerState, lukerVars, avatarHtml, getAvatarId, getLukerContextSafe } = useLuker()
const { width: ww } = useWindowSize()
const isMobile = computed(() => ww.value <= 640)

// Editor Code
const code = ref('')
const extensions = [html(), oneDark]
const saved = ref(false)

// Preview Update
const previewHtml = computed(() => {
  let tmpl = code.value.replace('{{__avatar__}}', avatarHtml.value)
  return tmpl.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, (match, key) => {
    const k = key.toLowerCase()
    let val = lukerState[k] !== undefined ? lukerState[k] : lukerState[key]
    return val !== undefined ? String(val) : match
  })
})

watch(() => props.visible, (val) => {
  if (val) code.value = props.initialTemplate || DEFAULT_TEMPLATE
})

// Window Resizing
const wrapRef = ref(null)
const winSize = useStorage('cs-editor-size', { w: 900, h: 640 })
const wrapStyle = computed(() => isMobile.value ? {} : { width: `${winSize.value.w}px`, height: `${winSize.value.h}px` })

function startWindowDrag(e) {
  if (isMobile.value) return
  e.preventDefault()
  const pt = e.touches ? e.touches[0] : e
  const startX = pt.clientX, startY = pt.clientY
  const startW = wrapRef.value.offsetWidth, startH = wrapRef.value.offsetHeight
  
  const move = (ev) => {
    const p = ev.touches ? ev.touches[0] : ev
    winSize.value = {
      w: Math.max(480, Math.min(window.innerWidth * 0.95, startW + p.clientX - startX)),
      h: Math.max(360, Math.min(window.innerHeight * 0.92, startH + p.clientY - startY))
    }
  }
  const end = () => {
    document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move)
    document.removeEventListener('mouseup', end); document.removeEventListener('touchend', end)
  }
  document.addEventListener('mousemove', move); document.addEventListener('touchmove', move)
  document.addEventListener('mouseup', end); document.addEventListener('touchend', end)
}

// Pane Divider
const paneSize = useStorage('cs-pane-size', { rightW: 300, rightH: 250 })
const rightPaneStyle = computed(() => isMobile.value ? { height: `${paneSize.value.rightH}px` } : { width: `${paneSize.value.rightW}px` })
const leftPaneStyle = computed(() => ({}))

function startDividerDrag(e) {
  e.preventDefault()
  const pt = e.touches ? e.touches[0] : e
  const startX = pt.clientX, startY = pt.clientY
  const startRightW = paneSize.value.rightW
  const startRightH = paneSize.value.rightH
  
  const move = (ev) => {
    const p = ev.touches ? ev.touches[0] : ev
    if (isMobile.value) {
      paneSize.value.rightH = Math.max(140, Math.min(window.innerHeight * 0.55, startRightH - (p.clientY - startY)))
    } else {
      paneSize.value.rightW = Math.max(200, Math.min(600, startRightW - (p.clientX - startX)))
    }
  }
  const end = () => {
    document.removeEventListener('mousemove', move); document.removeEventListener('touchmove', move)
    document.removeEventListener('mouseup', end); document.removeEventListener('touchend', end)
  }
  document.addEventListener('mousemove', move); document.addEventListener('touchmove', move)
  document.addEventListener('mouseup', end); document.addEventListener('touchend', end)
}

// Actions
function close() { emit('update:visible', false) }

function resetToDefault() {
  if (confirm('确定恢复默认模板？')) code.value = DEFAULT_TEMPLATE
}

async function save() {
  const avatarId = getAvatarId()
  const tmpl = code.value
  
  if (avatarId) {
    const ctx = getLukerContextSafe()
    if (ctx && ctx.setCharacterState) {
      try {
        await ctx.setCharacterState(avatarId, STATE_NS, { version: 1, template: tmpl })
      } catch(e) {}
    }
  } else {
    localStorage.setItem(`${MODULE_NAME}-template`, tmpl)
    try {
      const ctx = getLukerContextSafe()
      if (ctx && ctx.extensionSettings) {
        if (!ctx.extensionSettings[MODULE_NAME]) ctx.extensionSettings[MODULE_NAME] = {}
        ctx.extensionSettings[MODULE_NAME].template = tmpl
        if (ctx.saveSettingsDebounced) ctx.saveSettingsDebounced()
      }
    } catch(e) {}
  }
  
  saved.value = true
  emit('template-saved', tmpl)
  setTimeout(() => saved.value = false, 1500)
  close()
}

function copyVar(key, e) {
  const ph = `{{${key}}}`
  if (navigator.clipboard) navigator.clipboard.writeText(ph).catch(()=>{})
  const el = e.currentTarget
  el.style.borderColor = 'var(--cs-pink)'
  el.style.background = 'var(--cs-pink-pale)'
  el.style.transform = 'scale(0.96)'
  setTimeout(() => {
    el.style.borderColor = ''
    el.style.background = ''
    el.style.transform = ''
  }, 300)
}

function exportTemplate() {
  const data = JSON.stringify({
    version: 1, theme: localStorage.getItem('cs-theme') || 'sakura',
    customTheme: JSON.parse(localStorage.getItem('cs-custom-theme') || '{}'),
    template: code.value
  }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'chara-status-template.json'; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function importTemplate() {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.json,application/json'
  input.onchange = () => {
    const file = input.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (!data || !data.template) return alert('模板文件格式错误')
        code.value = data.template
        if (data.customTheme) localStorage.setItem('cs-custom-theme', JSON.stringify(data.customTheme))
        if (data.theme) localStorage.setItem('cs-theme', data.theme)
        // Refresh full reload maybe needed for theme, but fine for now
      } catch(err) { alert('模板文件解析失败') }
    }
    reader.readAsText(file)
  }
  input.click()
}
</script>

<style>
/* Adjust CodeMirror style to fit nicely inside the container */
.cm-editor { height: 100%; border-radius: inherit; }
.cm-scroller { font-family: inherit; }

/* Transition classes for the editor overlay and modal */
.cs-editor-enter-active,
.cs-editor-leave-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cs-editor-enter-active .cs-editor-modal,
.cs-editor-leave-active .cs-editor-modal {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.cs-editor-enter-from,
.cs-editor-leave-to {
  opacity: 0;
}

/* On Desktop (sm screen): Scale and fade the modal */
@media (min-width: 641px) {
  .cs-editor-enter-from .cs-editor-modal,
  .cs-editor-leave-to .cs-editor-modal {
    opacity: 0;
    transform: scale(0.95);
  }
}

/* On Mobile: Slide the drawer down/up */
@media (max-width: 640px) {
  .cs-editor-enter-from .cs-editor-modal,
  .cs-editor-leave-to .cs-editor-modal {
    transform: translateY(100%);
  }
}
</style>
