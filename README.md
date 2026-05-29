# CharaStatus — Luker 角色状态栏插件

一个为 [Luker](https://github.com/funnycups/Luker) 深度定制的**高端角色状态栏插件**。提供绝佳的视觉质感，支持高度自由的 HTML 模板设计、实时变量渲染、移动端响应式布局与极简的微交互物理过渡动画。

---

## ✨ 核心特性

- **🎮 实时状态面板** — 悬浮可轻量拖动和大小缩放的精美卡片，实时同步展示当前角色的战斗属性、徽章及个性化变量。
- **💾 服务器无感持久化** — **无需安装额外后端插件！** 全新对接 Luker 内部全局设置接口，没有绑定角色卡时的“全局自定义模板”会自动云同步写入服务器的 `settings.json`。实现**多端、手机与电脑之间自动云同步**，防止本地缓存清空丢失。
- **🌸 优雅物理过渡动画** — 所有面板、主题卡片和编辑器全面接入 Vue 3 物理过渡动画。无论是打开还是关闭，均提供柔和的缓冲渐变（PC 端弹窗中心淡入微缩放，移动手机端抽屉式底部滑入滑出）。
- **🎨 专属自定义主题编辑器 (Custom Theme)** — 除内置的 Sakura (蜜桃粉) / Midnight (深紫星空) / Matcha (抹茶绿) / Amber (琥珀暖橙) / Ocean (天空蓝) 五套高雅配色外，新增了 **Custom 高级设计师工具**，允许您随心所欲拾取属于自己的强调色 (Accent)、文字色 (Text) 与背景色 (Base BG)。
- **📱 极致移动端自适应** — 采用 Mobile-First 响应式架构。PC 端是精美的浮动弹窗与自由编辑器；在小屏/手机端则会自动流式重构，变成底部的全宽抽屉（Drawer）交互，并提供全触摸手势支持。
- **💎 现代液体玻璃质感** — 升级了整体界面的圆角至 `20px`。加入了细腻的折射光影，底层基调采用 Zinc 质感高级中性灰，彻底告别廉价的高饱和度发光。
- **💬 极简脉冲通知指示灯** — 收到新消息时，悬浮球右上角会亮起极具克制感的白色脉冲呼吸信号点，低调而高级地提醒您状态变化。
- **📝 专业级云编辑器** — 内置 CodeMirror 语法高亮编辑器，附带可调节大小的分割预览线、模板导入导出（一键分享）以及变量快捷点击复制面板。

---

## 📦 安装与配置

1. 将本仓库克隆或解压到您的 Luker 插件目录中：
   ```bash
   Luker/public/scripts/extensions/third-party/chara-status/
   ```
2. 打开 Luker 网页端，在右侧 **扩展管理 (Extension Management)** 面板中启用 **CharaStatus**。
3. 重新加载界面，即可在屏幕边缘看到精致的状态栏悬浮球。

---

## 🎮 使用说明

### 1. 在角色卡中写入属性与变量

您只需在角色卡的属性提示词、系统提示词或发送的消息中，使用 Luker 的 `setvar` 宏写入变量。例如：

```text
{{setvar::hp::85}}
{{setvar::hp_max::100}}
{{setvar::mp::40}}
{{setvar::mp_max::120}}
{{setvar::mood::愉悦}}
{{setvar::location::星空图书馆}}
{{setvar::status_desc::窗外的风很舒服，魔法研究有了新的进展。}}
```
### 2. 系统内置全局变量 (System Variables)

插件会自动从当前的聊天上下文和角色卡状态中为您提取并同步以下实时内置变量，**无需通过角色卡声明，即可直接在模板中渲染**：

| 变量占位符 | 说明与数据源 | 示例输出 |
|---|---|---|
| `{{name}}` 或 `{{char}}` | 当前聊天的角色名称 | `艾拉` |
| `{{user}}` | 当前用户的姓名（您的名字） | `旅行者` |
| `{{chat_id}}` | 当前活跃对话的唯一文件名/会话 ID | `chat-2026-05-28_23-00` |
| `{{char_id}}` | 当前角色卡唯一的图片文件 ID / 编号 | `avatar.png` |
| `{{message_count}}` 或 `{{msg_count}}` | 当前会话发生的总消息数量（动态随对话增长） | `42` |
| `{{last_user_msg}}` | 用户发送的最后一条消息的纯文本内容 | `今天天气真好，出去走走？` |
| `{{last_char_msg}}` | 角色发送的最后一条消息的纯文本内容 | `好呀，我们出去吧！` |
| `{{__avatar__}}` | 特殊占位符：自动渲染成极具折射折光质感的圆形角色头像 | `[圆形头像框 <img>]` |

### 3. 高级 CSS 预设与变量

点击面板右上角的 **✏️ 编辑模板** 即可打开实时设计器。

#### 💡 HTML 推荐骨架示例：
```html
<div class="cs-card">
  <!-- 头像与名称 -->
  <div class="cs-header">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div class="cs-info">
      <div class="cs-name">{{name}}</div>
      <div class="cs-sub"><i class="fa-solid fa-map-pin"></i> {{location}}</div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <!-- 属性状态条 -->
  <div class="cs-stats">
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-heart"></i> HP</span>
        <span class="cs-stat-value">{{hp}} / {{hp_max}}</span>
      </div>
      <div class="cs-track">
        <div class="cs-bar cs-bar-hp" style="width: {{hp_pct}}%"></div>
      </div>
    </div>
  </div>

  <!-- 描述性段落 -->
  <p class="cs-desc">{{status_desc}}</p>
</div>
```

#### 内置优雅 CSS 类：

- `cs-card`: 拥有毛玻璃边框和高级内阴影的容器。
- `cs-avatar`: 完美的圆形头像，自带浅色发光边框。
- `cs-name`: 突出展示角色名称（采用 `Outfit` 粗体字）。
- `cs-sub`: 极轻的副标题，多用于地标或小标签。
- `cs-divider`: 极致纤细的淡色水平线。
- `cs-track`: 属性进度条的深色背景轨道。
- `cs-bar`: 进度条填充条，支持三款高质感配色：
  - `cs-bar-hp`: 强调粉红色（活力）
  - `cs-bar-mp`: 高级靛蓝色（魔力）
  - `cs-bar-sp`: 典雅琥珀色（体力）
- `cs-badge`: 随主题自适应的精美药丸形徽章。
- `cs-desc`: 行高经过微调的精致正文段落。

---

## 🎨 主题样式

点击面板右上角 **🎨 调色盘** 图标，可在多个内置方案间无缝切换，也可开启 Custom 主题自由搭配：

| 主题色 | 调色盘主色调 | 适用场景 |
|---|---|---|
| **🌸 Sakura** | 蜜桃腮红粉 | 经典恋人与日常风 |
| **🌙 Midnight** | 深邃幽灵紫 | 奇幻魔法与暗黑科技风 |
| **🍵 Matcha** | 奶油抹茶绿 | 治愈、森系与自然系 |
| **🍯 Amber** | 琥珀暖香橙 | 蒸汽朋克与复古冒险 |
| **🌊 Ocean** | 清透海天蓝 | 现代科幻与海滨冒险 |
| **🎛️ Custom** | 拾色器全自定义 | 属于您自己的专属视觉配色 |

---

## 📄 插件结构

```text
luker-chara-status/
├── src/                # 前端 Vue 3 全套开发源码
├── index.js            # 插件部署主逻辑 (由 Vite 编译)
├── style.css           # 插件部署 UI 样式 (由 Vite 编译)
├── manifest.json       # 插件元数据声明
└── README.md           # 插件使用文档
```

---

## 📝 许可证

本项目采用 [MIT](LICENSE) 开源许可证。
