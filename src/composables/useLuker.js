import { reactive, ref } from 'vue'

function getLukerContextSafe() {
  try {
    if (window.Luker && typeof window.Luker.getContext === 'function') {
      return window.Luker.getContext()
    }
    if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
      return window.SillyTavern.getContext()
    }
    if (window.st && typeof window.st.getContext === 'function') {
      return window.st.getContext()
    }
  } catch (err) {
    //
  }
  return null
}

const lukerState = reactive({})
const lukerVars = ref([])
const avatarHtml = ref('<div class="fa-solid fa-user"></div>')

export function useLuker() {
  const updateState = () => {
    const ctx = getLukerContextSafe()
    if (!ctx) return
    
    // Clear old state safely
    for (const key in lukerState) {
      delete lukerState[key]
    }
    
    // Name macros
    if (ctx.name2) { lukerState.char = ctx.name2; lukerState.name = ctx.name2 }
    if (ctx.name1) { lukerState.user = ctx.name1 }
    
    const localVars = (ctx.chatMetadata && ctx.chatMetadata.variables) ? ctx.chatMetadata.variables : {}
    Object.assign(lukerState, localVars)
    
    const keys = ['hp','mp','sp','atk','def','spd','affection','trust','stamina']
    for (const k of keys) {
      if (lukerState[k] !== undefined && lukerState[k+'_max'] !== undefined) {
        const v = Number(lukerState[k]), m = Number(lukerState[k+'_max'])
        if (!isNaN(v) && !isNaN(m) && m > 0 && lukerState[k+'_pct'] === undefined) {
          lukerState[k+'_pct'] = Math.round(v / m * 100)
        }
      }
      if (lukerState[k+'_pct'] !== undefined) {
        lukerState[k+'_pct'] = Math.max(0, Math.min(100, Number(lukerState[k+'_pct']) || 0))
      }
    }

    // Vars for editor list
    lukerVars.value = Object.keys(localVars).map(k => {
      const localValue = ctx.variables?.local?.get ? ctx.variables.local.get(k) : undefined
      return { key: k, value: String(localValue || localVars[k]) }
    })

    // Avatar
    if (ctx.characterId != null && ctx.characters?.[ctx.characterId]?.avatar) {
      const char = ctx.characters[ctx.characterId]
      avatarHtml.value = `<img style="width:100%;height:100%;object-fit:cover;display:block;" src="${ctx.getThumbnailUrl('avatar', char.avatar)}" alt="" loading="lazy">`
    } else {
      avatarHtml.value = '<div class="fa-solid fa-user"></div>'
    }
  }

  const getAvatarId = () => {
    const ctx = getLukerContextSafe()
    if (!ctx || ctx.characterId == null) return null
    return ctx.characters[ctx.characterId]?.avatar || null
  }

  return {
    lukerState,
    lukerVars,
    avatarHtml,
    updateState,
    getLukerContextSafe,
    getAvatarId
  }
}
