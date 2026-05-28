<template>
  <button 
    title="角色状态栏"
    ref="btnRef"
    class="fixed z-10 w-[48px] h-[48px] box-border border-none outline-none m-0 p-0 rounded-full cursor-pointer text-white text-[18px] flex items-center justify-center transition-colors transition-transform transition-shadow duration-300 cs-font touch-manipulation"
    :class="[
      active ? 'bg-[var(--cs-pink-dark)] shadow-[0_0_0_4px_var(--cs-pink-pale),var(--cs-shadow-sm)] scale-[0.96]' 
             : 'bg-[var(--cs-pink)] shadow-[var(--cs-shadow-md)] hover:shadow-[var(--cs-shadow-lg)] hover:scale-[1.04] active:scale-[0.96]'
    ]"
    :style="style"
  >
    <i class="fa-solid fa-user drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]"></i>
    
    <!-- Elegant Unread Indicator -->
    <div v-if="blink" class="absolute top-[2px] right-[2px] w-[10px] h-[10px] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.2)] flex items-center justify-center">
      <div class="w-full h-full bg-white rounded-full animate-[cs-pulse-ring_1.5s_cubic-bezier(0.16,1,0.3,1)_infinite]"></div>
    </div>
  </button>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDraggable, useWindowSize, useStorage } from '@vueuse/core'

const props = defineProps({
  active: Boolean,
  blink: Boolean
})

const btnRef = ref(null)
const { width: ww, height: wh } = useWindowSize()

// Persistent position via vueuse storage
const posStorage = useStorage('cs-btn-pos-v2', { x: undefined, y: undefined })

// Compute initial value: if undefined, bottom-right corner
const initialValue = computed(() => {
  if (posStorage.value.x !== undefined) return posStorage.value
  return {
    x: ww.value - 24 - 48,
    y: wh.value - 24 - 48
  }
})

// Draggable logic with boundary check
const { x, y } = useDraggable(btnRef, {
  initialValue: initialValue.value,
  onEnd(position) {
    // Boundary checks
    const w = btnRef.value?.offsetWidth || 48
    const h = btnRef.value?.offsetHeight || 48
    let finalX = Math.max(0, Math.min(ww.value - w, position.x))
    let finalY = Math.max(0, Math.min(wh.value - h, position.y))
    posStorage.value = { x: finalX, y: finalY }
  }
})

// Constrain current x, y to viewport during resize
const style = computed(() => {
  const w = btnRef.value?.offsetWidth || 48
  const h = btnRef.value?.offsetHeight || 48
  let finalX = Math.max(0, Math.min(ww.value - w, x.value))
  let finalY = Math.max(0, Math.min(wh.value - h, y.value))
  return { left: `${finalX}px`, top: `${finalY}px` }
})
</script>
