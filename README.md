# CharaStatus — Luker 角色状态栏插件

一个为 [Luker](https://github.com/funnycups/Luker) 设计的角色状态栏插件，支持自定义模板、多套主题、实时渲染与代码高亮编辑器。

## ✨ 功能

- **实时状态面板** — 悬浮按钮 + 可拖拽面板，展示角色当前变量
- **自定义模板** — HTML 模板编辑器，支持 `{{变量名}}` 占位符，实时预览
- **代码高亮** — 内置 CodeMirror 编辑器，HTML 语法高亮（Moonrise 暗色主题）
- **5 套主题** — Sakura / Midnight / Matcha / Amber / Ocean，点击切换
- **可调节大小** — 状态面板与编辑器窗口均支持 resize，分隔线可拖拽调节比例
- **移动端友好** — 小屏幕自动切换为底部抽屉布局，全触摸支持
- **模板导入/导出** — JSON 格式，一键分享或备份模板

## 📦 安装

1. 将本仓库克隆/下载到 Luker 插件目录：
   ```
   Luker/public/scripts/extensions/third-party/luker-chara-status/
   ```
2. 在 Luker 扩展管理中启用 **CharaStatus**

## 🎮 使用

### 写入变量

在角色卡提示词或系统提示中使用 Luker 变量宏：

```
{{setvar::hp::80}}
{{setvar::hp_max::100}}
{{setvar::mp::60}}
{{setvar::mp_max::100}}
{{setvar::name::艾拉}}
{{setvar::mood::开心}}
{{setvar::location::魔法学院}}
{{setvar::status_desc::今天精神不错，魔力充沛。}}
```

### 支持的自动计算字段

有 `key` 和 `key_max` 时，自动计算 `key_pct`（百分比，用于进度条）：

| 字段 | 说明 |
|---|---|
| `hp` / `hp_max` → `hp_pct` | 活力 |
| `mp` / `mp_max` → `mp_pct` | 魔力 |
| `sp` / `sp_max` → `sp_pct` | 体力 |
| `atk` / `def` / `spd` ... | 其他属性（自由定义） |

### 自定义模板

点击面板右上角 **✏️ 编辑模板** 打开设计器：

```html
<div class="cs-card">
  <div style="display:flex;align-items:center;gap:12px">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div style="min-width:0;flex:1">
      <div class="cs-name">{{name}}</div>
    </div>
  </div>
  <div class="cs-track">
    <div class="cs-bar cs-bar-pink" style="width:{{hp_pct}}%"></div>
  </div>
</div>
```

#### 内置 CSS 类

| 类名 | 说明 |
|---|---|
| `cs-card` | 卡片容器 |
| `cs-avatar` | 头像框 |
| `cs-name` | 角色名（主题色） |
| `cs-sub` | 副标题（淡色） |
| `cs-divider` | 分隔线 |
| `cs-stat-head` | 属性行（标签 + 数值） |
| `cs-stat-label` | 属性标签 |
| `cs-stat-value` | 属性数值 |
| `cs-track` | 进度条轨道 |
| `cs-bar cs-bar-pink` | 进度条填充（pink/violet/yellow/teal） |
| `cs-badge` | 标签徽章 |
| `cs-desc` | 描述文字 |

#### CSS 变量（随主题自动变化）

```css
var(--cs-pink)        /* 主色 */
var(--cs-pink-dark)   /* 深主色 */
var(--cs-pink-pale)   /* 浅背景 */
var(--cs-text)        /* 正文色 */
var(--cs-text-faint)  /* 淡文字 */
var(--cs-border)      /* 边框色 */
```

## 🎨 主题

| 主题 | 色调 |
|---|---|
| 🌸 Sakura | 蜜桃粉 |
| 🌙 Midnight | 深紫星空 |
| 🍵 Matcha | 抹茶绿 |
| 🍯 Amber | 琥珀暖橙 |
| 🌊 Ocean | 天空蓝 |

## 📄 文件结构

```
luker-chara-status/
├── index.js        # 插件主逻辑
├── style.css       # 插件 UI 样式
├── manifest.json   # 插件元数据
└── README.md
```

## 📝 许可

MIT License
