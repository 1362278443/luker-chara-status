import { defineStore } from 'pinia'

// ─── Types ─────────────────────────────────────────────────────────────────

/** SillyTavern 上下文对象（松散类型，仅声明用到的字段） */
interface STContext {
  name1?: string
  name2?: string
  chatId?: string
  characterId?: number | null
  characters?: Array<{ avatar?: string }>
  chat?: Array<{ is_user?: boolean; is_system?: boolean; mes?: string }>
  chatMetadata?: { variables?: Record<string, unknown> }
  variables?: { local?: { get?: (k: string) => unknown } }
  extensionSettings?: Record<string, Record<string, unknown>>
  eventSource?: { on: (event: string, cb: () => void) => void }
  eventTypes?: Record<string, string>
  getCharacterState?: (avatarId: string, ns: string) => Promise<Record<string, unknown> | null>
  setCharacterState?: (avatarId: string, ns: string, data: unknown) => Promise<void>
  getThumbnailUrl?: (type: string, avatar: string) => string
  saveSettingsDebounced?: () => void
}

export interface LukerVar {
  key: string
  value: string
  scope: 'System' | 'Local'
}

// ─── ST Context Helper ──────────────────────────────────────────────────────

export function getLukerContextSafe(): STContext | null {
  try {
    const w = window as unknown as Record<string, { getContext?: () => STContext }>
    if (w['Luker']?.getContext) return w['Luker'].getContext()!
  } catch {
    // ignore
  }
  return null
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useLukerStore = defineStore('luker', () => {
  const lukerState = reactive<Record<string, unknown>>({})
  const lukerVars = ref<LukerVar[]>([])
  const avatarHtml = ref('<div class="fa-solid fa-user"></div>')

  /**
   * 从 ST 上下文读取最新状态，写入 lukerState
   */
  function updateState(): void {
    const ctx = getLukerContextSafe()
    if (!ctx) return

    // 清空旧状态
    for (const key in lukerState) {
      delete lukerState[key]
    }

    // 角色 / 用户名
    if (ctx.name2) { lukerState['char'] = ctx.name2; lukerState['name'] = ctx.name2 }
    if (ctx.name1) { lukerState['user'] = ctx.name1 }

    // 会话信息
    if (ctx.chatId) lukerState['chat_id'] = ctx.chatId
    if (ctx.characterId !== undefined && ctx.characterId !== null) {
      lukerState['char_id'] = ctx.characterId
    }

    // 消息统计
    if (Array.isArray(ctx.chat)) {
      lukerState['message_count'] = ctx.chat.length
      lukerState['msg_count'] = ctx.chat.length

      const userMsgs = ctx.chat.filter((m) => m.is_user && !m.is_system)
      const charMsgs = ctx.chat.filter((m) => !m.is_user && !m.is_system)
      lukerState['last_user_msg'] = userMsgs.at(-1)?.mes ?? ''
      lukerState['last_char_msg'] = charMsgs.at(-1)?.mes ?? ''
    } else {
      lukerState['message_count'] = 0
      lukerState['msg_count'] = 0
      lukerState['last_user_msg'] = ''
      lukerState['last_char_msg'] = ''
    }

    // 本地聊天变量
    const localVars = (ctx.chatMetadata?.variables ?? {}) as Record<string, unknown>
    Object.assign(lukerState, localVars)

    // 变量列表（供模板编辑器展示）
    const systemList: LukerVar[] = []
    if (ctx.name2) systemList.push({ key: 'name', value: String(ctx.name2), scope: 'System' })
    if (ctx.name1) systemList.push({ key: 'user', value: String(ctx.name1), scope: 'System' })
    if (ctx.chatId) systemList.push({ key: 'chat_id', value: String(ctx.chatId), scope: 'System' })
    if (Array.isArray(ctx.chat)) {
      systemList.push({ key: 'message_count', value: String(ctx.chat.length), scope: 'System' })
    }

    const localList: LukerVar[] = Object.keys(localVars).map((k) => {
      const localValue = ctx.variables?.local?.get?.(k)
      return { key: k, value: String(localValue ?? localVars[k]), scope: 'Local' }
    })

    lukerVars.value = [...systemList, ...localList]

    // 头像
    if (ctx.characterId != null && ctx.characters?.[ctx.characterId as number]?.avatar) {
      const char = ctx.characters![ctx.characterId as number]
      avatarHtml.value = `<img style="width:100%;height:100%;object-fit:cover;display:block;" src="${ctx.getThumbnailUrl?.('avatar', char.avatar!)}" alt="" loading="lazy">`
    } else {
      avatarHtml.value = '<div class="fa-solid fa-user"></div>'
    }
  }

  /**
   * 获取当前角色的 avatar 文件名，用于 setCharacterState 的 key
   */
  function getAvatarId(): string | null {
    const ctx = getLukerContextSafe()
    if (!ctx || ctx.characterId == null) return null
    return ctx.characters?.[ctx.characterId as number]?.avatar ?? null
  }

  return {
    lukerState,
    lukerVars,
    avatarHtml,
    updateState,
    getAvatarId,
  }
})
