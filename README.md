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

### 3. HTML 模板编写与高级设计指南

点击面板右上角的 **✏️ 编辑模板** 即可打开内置的实时设计器。插件为用户提供了强大的自定义能力与多项内置特性，您可以随心所欲设计出专属于您的属性面板。

---

#### 🌟 核心渲染特性与可用变量

1. **动态文本插值 `{{变量名}}`**
   * **系统内置变量**：直接渲染如 `{{char}}`（当前角色）、`{{user}}`（您的姓名）、`{{message_count}}`（消息数）、`{{last_char_msg}}`（最后一条消息）等全局字段（不区分大小写，详情参见“系统内置全局变量”章节）。
   * **角色自定义属性**：您在角色卡中通过 `setvar` 定义的任意变量均可作为插值。
     * *例如*：角色卡声明 `{{setvar::location::法师塔}}` 后，模板写 `{{location}}` 即可动态输出 `法师塔`。

2. **头像占位符 `{{__avatar__}}`**
   * 特殊的内置插值。在渲染时会自动替换为一个圆形的当前角色头像 `<img>` 标签，完美适配边框且自带 lazy 懒加载。

3. **内置 FontAwesome 6 图标库**
   * 插件已全局集成 FontAwesome 6 图标。您可以在模板中使用任意小图标来丰富卡片表达，例如：
     ```html
     <i class="fa-solid fa-heart"></i>
     <i class="fa-solid fa-wand-magic-sparkles"></i>
     <i class="fa-solid fa-location-dot"></i>
     ```

4. **自适应 CSS 变量**
   * 无论用户当前选择的是 **Sakura (蜜桃粉)** 还是 **Midnight (星空紫)**，甚至是 **Custom 自定义设计师主题**，插件都会将当前主题的配色方案注入为一组全局 CSS 变量。您可在 inline 样式或您自己的 CSS 中使用它们：
     * `var(--cs-pink)`：主题的强调主色调（Accent Color）。
     * `var(--cs-pink-dark)`：偏深一些的强调色。
     * `var(--cs-pink-pale)`：极淡的主色（常用于背景或发光）。
     * `var(--cs-text)`：自适应高对比度文本主色。
     * `var(--cs-text-faint)`：温和的次要文本辅色（非常适合做图标、属性标签颜色）。
     * `var(--cs-bg)`：主卡片底板背景色（带有毛玻璃般的优雅透明度）。
     * `var(--cs-bg-muted)`：偏深/偏浅的辅助背景色（进度条轨道、徽章）。
     * `var(--cs-border)`：极细微的边框线颜色。
     * `var(--cs-font)`：整体高雅无衬线字体（`Outfit` 字体）。
     * `var(--cs-mono)`：专为数据准备的极简等宽字体（`JetBrains Mono` 字体）。

---

#### 💡 高级 HTML 推荐骨架与自定义进度条设计：

这是一个展示了如何设计自定义**进度条**、**徽章组**、及**布局卡片**的高级示例：

```html
<div class="cs-card">
  <!-- 头部：头像与名称信息 -->
  <div class="cs-header">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div class="cs-info">
      <div class="cs-name">{{char}}</div>
      <div class="cs-sub">
        <i class="fa-solid fa-map-pin" style="color: var(--cs-pink)"></i> 
        {{location}}
      </div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <!-- 动态状态进度条展示 -->
  <div class="cs-stats">
    <!-- 生命值 (HP) 示例 -->
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-heart" style="color: #FF6B8B"></i> 生命值</span>
        <span class="cs-stat-value">{{hp}} / {{hp_max}}</span>
      </div>
      <!-- 进度条轨道 -->
      <div class="cs-track">
        <!-- 进度条填充：通过内联样式动态控制宽度与渐变色 -->
        <div class="cs-bar" style="width: {{hp_pct}}%; background: linear-gradient(90deg, #FF6B8B, #FF8DA1)"></div>
      </div>
    </div>
    
    <!-- 魔法值 (MP) 示例 -->
    <div class="cs-stat-row">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-wand-magic-sparkles" style="color: #6366F1"></i> 魔法值</span>
        <span class="cs-stat-value">{{mp}} / {{mp_max}}</span>
      </div>
      <div class="cs-track">
        <div class="cs-bar" style="width: {{mp_pct}}%; background: #6366F1"></div>
      </div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <!-- 徽章药丸组展示 -->
  <div class="cs-badges">
    <span class="cs-badge"><i class="fa-solid fa-face-smile"></i> {{mood}}</span>
    <span class="cs-badge"><i class="fa-solid fa-crown"></i> 等级 {{level}}</span>
  </div>

  <!-- 描述性介绍段落 -->
  <p class="cs-desc">{{status_desc}}</p>
</div>
```

---

#### 📐 内置 CSS 排版布局类解析

在编写模板时，您可以直接应用下列精心调校的内置 CSS 类：

| CSS 类名 | 视觉表现与最佳实践 |
|---|---|
| `.cs-card` | **基础卡片容器**：拥有自适应弹性布局，自动在组件之间分配 `16px` 的行间距。 |
| `.cs-header` | **头部对齐容器**：用于对齐圆形头像和右侧文字信息。 |
| `.cs-avatar` | **头像容器**：完美的圆形，并自带精致的内侧发光及阴影滤镜。 |
| `.cs-info` | **文字容器**：内部采用纵向紧凑排列，用于展示名称与小地标。 |
| `.cs-name` | **大标题**：采用 `Outfit` 粗体字，字体大小为 `17px`，对超长角色名会自动截断展示省略号。 |
| `.cs-sub` | **辅助说明**：淡灰色（自适应主题），最适合与 FontAwesome 小图标搭配做地标或副标题。 |
| `.cs-divider` | **极细分隔线**：高度为 `1px`，能根据当前主题自动调节线条淡化程度，分隔卡片区域。 |
| `.cs-stats` | **状态字段组**：提供整洁的纵向间距，专门放置多行进度条。 |
| `.cs-stat-row` | **单条状态容器**：组合文字行与进度条轨道的父类。 |
| `.cs-stat-head` | **状态头对齐**：使用 `flex: space-between` 自动在左右两端对齐状态名与当前的数值。 |
| `.cs-stat-label` | **状态标签**：用于为 HP/MP 或其他属性标签附加小图标，文本较淡。 |
| `.cs-stat-value` | **数值展示**：自动启用 `JetBrains Mono` 等宽字体，显示更加严谨和精美。 |
| `.cs-track` | **进度条黑色轨道**：拥有 `4px` 极简高度、圆角和深色半透明背景，负责容纳内部进度条。 |
| `.cs-bar` | **进度条填充**：高度占满轨道，圆角设计，拥有 `0.6s` 极致丝滑的缓动伸缩过渡动画。默认继承当前主题强调色，您可通过内联样式 `style="background:颜色"` 自定义填充色或渐变色。 |
| `.cs-badges` | **徽章流式布局**：自动以包裹折行（Wrap）模式对齐所有徽章，横向间距 `8px`。 |
| `.cs-badge` | **精美药丸形徽章**：采用圆角高亮边框和半透明微阴影，悬浮或点击时会伴随柔和的色调变化与微交互动画。 |
| `.cs-desc` | **行高正文段落**：拥有高度排版调校的行高（`1.7`），适用于展示角色的描述文本或剧情概述。 |

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
