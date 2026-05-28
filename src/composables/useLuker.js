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
    
    // Active chat stats
    if (ctx.chatId) { lukerState.chat_id = ctx.chatId }
    if (ctx.characterId !== undefined && ctx.characterId !== null) { 
      lukerState.char_id = ctx.characterId 
    }
    
    if (Array.isArray(ctx.chat)) {
      lukerState.message_count = ctx.chat.length
      lukerState.msg_count = ctx.chat.length
      
      // Extract last user and character messages
      const userMsgs = ctx.chat.filter(m => m.is_user && !m.is_system)
      const charMsgs = ctx.chat.filter(m => !m.is_user && !m.is_system)
      if (userMsgs.length > 0) {
        lukerState.last_user_msg = userMsgs[userMsgs.length - 1].mes || ''
      }
      if (charMsgs.length > 0) {
        lukerState.last_char_msg = charMsgs[charMsgs.length - 1].mes || ''
      }
    } else {
      lukerState.message_count = 0
      lukerState.msg_count = 0
      lukerState.last_user_msg = ''
      lukerState.last_char_msg = ''
    }
    
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
    const systemList = []
    if (ctx.name2) systemList.push({ key: 'name', value: ctx.name2, scope: 'System' })
    if (ctx.name1) systemList.push({ key: 'user', value: ctx.name1, scope: 'System' })
    if (ctx.chatId) systemList.push({ key: 'chat_id', value: ctx.chatId, scope: 'System' })
    if (Array.isArray(ctx.chat)) {
      systemList.push({ key: 'message_count', value: String(ctx.chat.length), scope: 'System' })
    }
    
    const localList = Object.keys(localVars).map(k => {
      const localValue = ctx.variables?.local?.get ? ctx.variables.local.get(k) : undefined
      return { key: k, value: String(localValue || localVars[k]), scope: 'Local' }
    })
    
    lukerVars.value = [...systemList, ...localList]

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
