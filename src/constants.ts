export const MODULE_NAME = 'chara-status' as const
export const STATE_NS = 'chara_status_settings' as const

export const DEFAULT_TEMPLATE = `<div class="cs-card">

  <div class="cs-header">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div class="cs-info">
      <div class="cs-name">{{char}}</div>
      <div class="cs-sub">
        <i class="fa-solid fa-user-astronaut"></i> Chatting with {{user}}
      </div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <div class="cs-stats">
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-message"></i> 消息数量</span>
        <span class="cs-stat-value">{{message_count}}</span>
      </div>
    </div>
  </div>

  <p class="cs-desc">欢迎使用 CharaStatus！您可以点击右上角的编辑按钮来自定义此 HTML 模板，渲染您的角色卡自定义变量（如属性、理智值、好感度进度条等）。</p>

</div>`
