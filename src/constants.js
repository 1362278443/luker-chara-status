export const MODULE_NAME = 'chara-status'
export const STATE_NS = 'chara_status_settings'

export const DEFAULT_TEMPLATE = `<div class="cs-card">

  <div class="cs-header">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div class="cs-info">
      <div class="cs-name">{{char}}</div>
      <div class="cs-sub">
        <i class="fa-solid fa-location-dot"></i> {{location}}
      </div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <div class="cs-stats">
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-heart"></i> 活力</span>
        <span class="cs-stat-value">{{hp}} / {{hp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-hp" style="width:{{hp_pct}}%"></div></div>
    </div>
    
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-wand-magic-sparkles"></i> 魔力</span>
        <span class="cs-stat-value">{{mp}} / {{mp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-mp" style="width:{{mp_pct}}%"></div></div>
    </div>
    
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-bolt"></i> 体力</span>
        <span class="cs-stat-value">{{sp}} / {{sp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-sp" style="width:{{sp_pct}}%"></div></div>
    </div>
  </div>

  <div class="cs-badges">
    <span class="cs-badge"><i class="fa-solid fa-face-smile"></i> {{mood}}</span>
  </div>

  <p class="cs-desc">{{status_desc}}</p>

</div>`
