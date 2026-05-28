/**
 * CharaStatus - 角色状态栏插件
 * 数据源：Luker 原生变量系统
 * 入口：Luker.getContext()
 * 样式：纯原生 CSS (style.css)
 */

// ─── 常量 ──────────────────────────────────────────────────────────────────

const MODULE_NAME  = 'chara-status';
const STATE_NS     = 'chara_status_settings';
const LS_BTN_POS   = 'cs-btn-pos';
const LS_PANEL_POS = 'cs-panel-pos';
const LS_PANEL_SIZE   = 'cs-panel-size';
const LS_EDITOR_SIZE  = 'cs-editor-size';
const LS_THEME     = 'cs-theme';

// 5 套主题
const THEMES = [
    { id: 'sakura',   label: 'Sakura',   dot: '#FF6BAD',
      vars: '' /* 使用 :root 默认值 */ },
    { id: 'midnight', label: 'Midnight', dot: '#8B5CF6',
      vars: '--cs-pink:#8B5CF6;--cs-pink-dark:#6D28D9;--cs-pink-pale:#F5F3FF;' +
            '--cs-text:#1E1033;--cs-text-faint:#7C6A9B;' +
            '--cs-bg:rgba(245,243,255,0.97);--cs-border:rgba(139,92,246,0.15);' +
            '--cs-shadow:0 8px 32px rgba(139,92,246,0.18);' +
            '--cs-btn-ring:rgba(139,92,246,0.18);--cs-btn-glow:rgba(139,92,246,0.38);' },
    { id: 'matcha',   label: 'Matcha',   dot: '#5B9B6E',
      vars: '--cs-pink:#5B9B6E;--cs-pink-dark:#3D7A54;--cs-pink-pale:#F0FFF4;' +
            '--cs-text:#1A3D28;--cs-text-faint:#6B9F7E;' +
            '--cs-bg:rgba(240,255,244,0.97);--cs-border:rgba(91,155,110,0.15);' +
            '--cs-shadow:0 8px 32px rgba(91,155,110,0.18);' +
            '--cs-btn-ring:rgba(91,155,110,0.18);--cs-btn-glow:rgba(91,155,110,0.38);' },
    { id: 'amber',    label: 'Amber',    dot: '#D97706',
      vars: '--cs-pink:#D97706;--cs-pink-dark:#B45309;--cs-pink-pale:#FFFBEB;' +
            '--cs-text:#3D2A0A;--cs-text-faint:#9B7A40;' +
            '--cs-bg:rgba(255,251,235,0.97);--cs-border:rgba(217,119,6,0.15);' +
            '--cs-shadow:0 8px 32px rgba(217,119,6,0.18);' +
            '--cs-btn-ring:rgba(217,119,6,0.18);--cs-btn-glow:rgba(217,119,6,0.38);' },
    { id: 'ocean',    label: 'Ocean',    dot: '#0EA5E9',
      vars: '--cs-pink:#0EA5E9;--cs-pink-dark:#0284C7;--cs-pink-pale:#F0F9FF;' +
            '--cs-text:#0C2D4A;--cs-text-faint:#5B8FAA;' +
            '--cs-bg:rgba(240,249,255,0.97);--cs-border:rgba(14,165,233,0.15);' +
            '--cs-shadow:0 8px 32px rgba(14,165,233,0.18);' +
            '--cs-btn-ring:rgba(14,165,233,0.18);--cs-btn-glow:rgba(14,165,233,0.38);' },
];

// 默认模板：使用纯原生 CSS (cs-* 类) 负责所有布局与主题颜色
const DEFAULT_TEMPLATE = `<div class="cs-card">

  <div style="display:flex;align-items:center;gap:12px">
    <div class="cs-avatar">{{__avatar__}}</div>
    <div style="min-width:0;flex:1">
      <div class="cs-name">{{char}}</div>
      <div class="cs-sub">
        <i class="fa-solid fa-location-dot fa-xs"></i> {{location}}
      </div>
    </div>
  </div>

  <div class="cs-divider"></div>

  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;flex-direction:column;gap:4px">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-heart"></i> 活力</span>
        <span class="cs-stat-value">{{hp}} / {{hp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-pink" style="width:{{hp_pct}}%"></div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-wand-magic-sparkles"></i> 魔力</span>
        <span class="cs-stat-value">{{mp}} / {{mp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-violet" style="width:{{mp_pct}}%"></div></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:4px">
      <div class="cs-stat-head">
        <span class="cs-stat-label"><i class="fa-solid fa-bolt"></i> 体力</span>
        <span class="cs-stat-value">{{sp}} / {{sp_max}}</span>
      </div>
      <div class="cs-track"><div class="cs-bar cs-bar-yellow" style="width:{{sp_pct}}%"></div></div>
    </div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:6px">
    <span class="cs-badge"><i class="fa-solid fa-face-smile fa-xs"></i> {{mood}}</span>
  </div>

  <p class="cs-desc">{{status_desc}}</p>

</div>`;

// ─── 运行时状态 ────────────────────────────────────────────────────────────

let currentTemplate = DEFAULT_TEMPLATE;
let currentTheme    = 'sakura';
let isPanelVisible  = false;
let $btn = null, $panel = null, $editorModal = null, $themePopover = null;
let _cmEditor = null; // CodeMirror 实例
let _suppressEditorClose = false; // 防止 resize/拖拽结束后误关弹窗



// ─── CodeMirror 懒加载（HTML 代码高亮编辑器）─────────────────────────────

let _cmPromise = null;

function _loadScript(src) {
    return new Promise(function(resolve) {
        var s = document.createElement('script');
        s.src = src; s.onload = resolve; s.onerror = resolve;
        document.head.appendChild(s);
    });
}

function ensureCodeMirror() {
    if (_cmPromise) return _cmPromise;
    _cmPromise = new Promise(async function(resolve) {
        if (window.CodeMirror) { injectCMTheme(); return resolve(); }
        // 加载 CodeMirror CSS
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.css';
        document.head.appendChild(link);
        // 串行加载 JS（htmlmixed 依赖 xml/css/js）
        await _loadScript('https://cdn.jsdelivr.net/npm/codemirror@5/lib/codemirror.min.js');
        await _loadScript('https://cdn.jsdelivr.net/npm/codemirror@5/mode/xml/xml.min.js');
        await _loadScript('https://cdn.jsdelivr.net/npm/codemirror@5/mode/javascript/javascript.min.js');
        await _loadScript('https://cdn.jsdelivr.net/npm/codemirror@5/mode/css/css.min.js');
        await _loadScript('https://cdn.jsdelivr.net/npm/codemirror@5/mode/htmlmixed/htmlmixed.min.js');
        injectCMTheme();
        resolve();
    });
    return _cmPromise;
}

function injectCMTheme() {
    if (document.getElementById('cs-cm-theme')) return;
    var style = document.createElement('style');
    style.id = 'cs-cm-theme';
    // 固定暗色配色（Moonrise），与插件主题无关
    style.textContent = [
        '#cs-editor-modal .CodeMirror {',
        '  background: #1a1b2e;',
        '  color: #e2e8f0;',
        '  font-family: "JetBrains Mono","Fira Code","Cascadia Code",monospace;',
        '  font-size: 12.5px;',
        '  line-height: 1.7;',
        '  height: 100%;',
        '  border-radius: 10px;',
        '}',
        '#cs-editor-modal .CodeMirror-focused { outline: none; }',
        '#cs-editor-modal .CodeMirror-gutters {',
        '  background: #161725;',
        '  border-right: 1px solid rgba(255,255,255,0.06);',
        '}',
        '#cs-editor-modal .CodeMirror-linenumber { color: #4a5568; }',
        '#cs-editor-modal .CodeMirror-cursor { border-left: 2px solid #f687b3; }',
        '#cs-editor-modal .CodeMirror-selected { background: rgba(246,135,179,0.18); }',
        '#cs-editor-modal .CodeMirror-activeline-background { background: rgba(255,255,255,0.03); }',
        '#cs-editor-modal .CodeMirror-scroll { height: 100%; }',
        // 语法高亮 — 固定配色
        '#cs-editor-modal .cm-tag      { color: #f687b3; font-weight: 600; }', // 粉：标签名
        '#cs-editor-modal .cm-attribute{ color: #90cdf4; }',                   // 蓝：属性名
        '#cs-editor-modal .cm-string   { color: #68d391; }',                   // 绿：字符串
        '#cs-editor-modal .cm-comment  { color: #4a5568; font-style: italic; }',// 灰：注释
        '#cs-editor-modal .cm-number   { color: #fbd38d; }',                   // 黄：数字
        '#cs-editor-modal .cm-keyword  { color: #b794f4; }',                   // 紫：关键字
        '#cs-editor-modal .cm-atom     { color: #fbd38d; }',                   // 黄：布尔/null
        '#cs-editor-modal .cm-def      { color: #76e4f7; }',                   // 青：定义
        '#cs-editor-modal .cm-bracket  { color: #718096; }',                   // 灰：括号
        '#cs-editor-modal .cm-error    { color: #fc8181; text-decoration: underline; }',
    ].join('\n');
    document.head.appendChild(style);
}

function initCodeEditor() {
    if (_cmEditor || !window.CodeMirror) return;
    var textarea = document.getElementById('cs-template-textarea');
    if (!textarea) return;
    _cmEditor = CodeMirror.fromTextArea(textarea, {
        mode:        'htmlmixed',
        lineNumbers: true,
        lineWrapping: true,
        tabSize:     2,
        indentWithTabs: false,
        extraKeys:   { 'Tab': 'indentMore', 'Shift-Tab': 'indentLess' },
        autofocus:   false,
    });
    // 变化时刷新预览
    var previewTimer = null;
    _cmEditor.on('change', function() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(updatePreview, 300);
    });
}

// ─── 主题系统 ─────────────────────────────────────────────────────────────

function applyTheme(themeId) {
    currentTheme = themeId;
    var theme = THEMES.find(function(t){ return t.id === themeId; });
    if (!theme) return;

    var $style = $('#cs-theme-vars');
    if (!$style.length) {
        $style = $('<style id="cs-theme-vars"></style>');
        $('head').append($style);
    }
    var selector = '#cs-float-btn,#cs-status-panel,#cs-editor-modal .cs-editor-wrap,#cs-theme-popover';
    $style.text(theme.vars ? selector + '{' + theme.vars + '}' : '');

    // 更新 popover 选中状态
    if ($themePopover) {
        $themePopover.find('.cs-theme-dot').removeClass('cs-theme-active');
        $themePopover.find('[data-theme="' + themeId + '"]').addClass('cs-theme-active');
    }
    localStorage.setItem(LS_THEME, themeId);
}

function loadTheme() {
    var saved = localStorage.getItem(LS_THEME);
    applyTheme(saved || 'sakura');
}

// ─── 核心：从 Luker 原生变量系统收集状态 ──────────────────────────────────

function collectState() {
    var ctx = Luker.getContext();
    var state = {};

    // 对齐 Luker 宏命名约定：{{char}} = 角色名，{{user}} = 用户名
    if (ctx.name2) { state.char = ctx.name2; state.name = ctx.name2; } // name 向下兼容
    if (ctx.name1) { state.user = ctx.name1; }

    var localVars = (ctx.chatMetadata && ctx.chatMetadata.variables)
        ? ctx.chatMetadata.variables : {};
    Object.assign(state, localVars);

    var keys = ['hp','mp','sp','atk','def','spd','affection','trust','stamina'];
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i];
        if (state[k] !== undefined && state[k+'_max'] !== undefined) {
            var v = Number(state[k]), m = Number(state[k+'_max']);
            if (!isNaN(v) && !isNaN(m) && m > 0 && state[k+'_pct'] === undefined)
                state[k+'_pct'] = Math.round(v / m * 100);
        }
        if (state[k+'_pct'] !== undefined)
            state[k+'_pct'] = Math.max(0, Math.min(100, Number(state[k+'_pct']) || 0));
    }
    return state;
}

function buildVariableEntries() {
    var ctx = Luker.getContext();
    var localVars = (ctx.chatMetadata && ctx.chatMetadata.variables) ? ctx.chatMetadata.variables : {};
    return Object.keys(localVars).map(function(k) {
        return { key: k, value: String(ctx.variables.local.get(k) || localVars[k]) };
    });
}

// ─── 模板渲染 ─────────────────────────────────────────────────────────────

function applyTemplate(tmpl, state) {
    return tmpl.replace(/\{\{([a-zA-Z_][a-zA-Z0-9_.]*)\}\}/g, function(match, key) {
        var val = state[key.toLowerCase()];
        if (val === undefined) val = state[key];
        return val !== undefined ? String(val) : match;
    });
}

function getAvatarHtml() {
    var ctx = Luker.getContext();
    if (ctx.characterId == null) return '<i class="fa-solid fa-user"></i>';
    var char = ctx.characters[ctx.characterId];
    if (!char || !char.avatar) return '<i class="fa-solid fa-user"></i>';
    return '<img class="cs-avatar-img" src="' + ctx.getThumbnailUrl('avatar', char.avatar) + '" alt="" loading="lazy">';
}

function renderStatus() {
    if (!$panel) return;
    var state = collectState();
    var tmpl  = currentTemplate.replace('{{__avatar__}}', getAvatarHtml());
    $panel.find('#cs-panel-content').html(applyTemplate(tmpl, state));
}

// ─── 模板持久化 ───────────────────────────────────────────────────────────

function getAvatarId() {
    var ctx = Luker.getContext();
    if (ctx.characterId == null) return null;
    var char = ctx.characters[ctx.characterId];
    return char ? char.avatar : null;
}

async function loadTemplate() {
    var avatarId = getAvatarId();
    if (!avatarId) {
        var saved = localStorage.getItem(MODULE_NAME + '-template');
        if (saved) currentTemplate = saved;
        return;
    }
    try {
        var data = await Luker.getContext().getCharacterState(avatarId, STATE_NS);
        if (data && data.template) currentTemplate = data.template;
    } catch(e) { console.warn('[' + MODULE_NAME + '] loadTemplate:', e); }
}

async function saveTemplate() {
    var avatarId = getAvatarId();
    if (!avatarId) { localStorage.setItem(MODULE_NAME + '-template', currentTemplate); return; }
    try {
        await Luker.getContext().setCharacterState(avatarId, STATE_NS, { version:1, template: currentTemplate });
    } catch(e) { console.warn('[' + MODULE_NAME + '] saveTemplate:', e); }
}

// ─── 模板导入/导出 ────────────────────────────────────────────────────────

function exportTemplate() {
    var data  = JSON.stringify({ version: 1, theme: currentTheme, template: currentTemplate }, null, 2);
    var blob  = new Blob([data], { type: 'application/json' });
    var url   = URL.createObjectURL(blob);
    var a     = document.createElement('a');
    a.href = url; a.download = 'chara-status-template.json'; a.click();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
}

function importTemplate() {
    var input = document.createElement('input');
    input.type = 'file'; input.accept = '.json,application/json';
    input.onchange = function() {
        var file = input.files[0]; if (!file) return;
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = JSON.parse(e.target.result);
                if (!data || !data.template) { alert('模板文件格式错误'); return; }
                currentTemplate = data.template;
                if (data.theme) applyTheme(data.theme);
                if ($editorModal) {
                    $editorModal.find('#cs-template-textarea').val(currentTemplate);
                    updatePreview();
                }
            } catch(err) { alert('模板文件解析失败'); }
        };
        reader.readAsText(file);
    };
    input.click();
}

// ─── Resize 逻辑 ──────────────────────────────────────────────────────────

function getPoint(e) { return e.touches ? e.touches[0] : e; }

function initPanelResize() {
    var $handle = $panel.find('.cs-resize-handle');
    var startX, startY, startW, startH;
    function onStart(e) {
        var pt = getPoint(e); startX=pt.clientX; startY=pt.clientY;
        startW=$panel.outerWidth(); startH=$panel.outerHeight();
        $(document).on('mousemove.cspanelr touchmove.cspanelr', onMove);
        $(document).on('mouseup.cspanelr touchend.cspanelr', onEnd);
        e.preventDefault(); e.stopPropagation();
    }
    function onMove(e) {
        var pt = getPoint(e);
        var nw = Math.max(200, Math.min(500, startW + pt.clientX - startX));
        var nh = Math.max(160, Math.min(700, startH + pt.clientY - startY));
        $panel.css({ width: nw, height: nh });
    }
    function onEnd() {
        $(document).off('.cspanelr');
        localStorage.setItem(LS_PANEL_SIZE, JSON.stringify({ w: $panel.outerWidth(), h: $panel.outerHeight() }));
    }
    $handle.on('mousedown touchstart', onStart);
}

function restorePanelSize() {
    var s = localStorage.getItem(LS_PANEL_SIZE);
    if (s) { try { var p=JSON.parse(s); $panel.css({ width:p.w, height:p.h }); } catch(e){} }
}

function initEditorResize() {
    var $wrap   = $editorModal.find('.cs-editor-wrap');
    var $handle = $editorModal.find('.cs-editor-resize-handle');
    var startX, startY, startW, startH, rafId;
    function onStart(e) {
        var pt = getPoint(e); startX=pt.clientX; startY=pt.clientY;
        startW=$wrap.outerWidth(); startH=$wrap.outerHeight();
        $(document).on('mousemove.cseditorr touchmove.cseditorr', onMove);
        $(document).on('mouseup.cseditorr touchend.cseditorr', onEnd);
        e.preventDefault(); e.stopPropagation();
    }
    function onMove(e) {
        var pt = getPoint(e);
        var nw = Math.max(380, Math.min(window.innerWidth  * 0.95, startW + pt.clientX - startX));
        var nh = Math.max(280, Math.min(window.innerHeight * 0.92, startH + pt.clientY - startY));
        $wrap.css({ width: nw, height: nh });
        // 尺寸变化后通知 CodeMirror 重新测量，用 rAF 节流
        if (_cmEditor) {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() { _cmEditor.refresh(); });
        }
    }
    function onEnd() {
        $(document).off('.cseditorr');
        localStorage.setItem(LS_EDITOR_SIZE, JSON.stringify({ w: $wrap.outerWidth(), h: $wrap.outerHeight() }));
        // resize 完成后再刺一次 refresh，确保最终尺寸正确
        if (_cmEditor) setTimeout(function() { _cmEditor.refresh(); }, 0);
        _suppressEditorClose = true;
        setTimeout(function() { _suppressEditorClose = false; }, 100);
    }
    $handle.on('mousedown touchstart', onStart);
}

function restoreEditorSize() {
    var s = localStorage.getItem(LS_EDITOR_SIZE);
    if (s) { try { var p=JSON.parse(s); $editorModal.find('.cs-editor-wrap').css({ width:p.w, height:p.h }); } catch(e){} }
}

function initPaneDivider() {
    var $divider   = $editorModal.find('.cs-pane-divider');
    // 拖拽分隔线时调整右侧宽度，左侧保持 flex:1 自动填充
    var $rightPane = $editorModal.find('.cs-editor-pane-right');
    var startX, startW, isVertical, rafId;
    function onStart(e) {
        var pt = getPoint(e); startX = pt.clientX;
        startW = $rightPane.outerWidth();
        isVertical = window.innerWidth < 640;
        $divider.addClass('cs-dividing');
        $(document).on('mousemove.csdiv touchmove.csdiv', onMove);
        $(document).on('mouseup.csdiv touchend.csdiv', onEnd);
        e.preventDefault();
    }
    function onMove(e) {
        if (isVertical) return;
        var pt = getPoint(e);
        var dx  = startX - pt.clientX;
        var nw  = Math.max(160, Math.min(460, startW + dx));
        $rightPane.css({ width: nw, 'flex-shrink': '0', 'flex-grow': '0' });
        // 左侧宽度变化后通知 CodeMirror 重算（换行模式下行高会变）
        if (_cmEditor) {
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(function() { _cmEditor.refresh(); });
        }
    }
    function onEnd() {
        $divider.removeClass('cs-dividing');
        $(document).off('.csdiv');
        if (_cmEditor) setTimeout(function() { _cmEditor.refresh(); }, 0);
        _suppressEditorClose = true;
        setTimeout(function() { _suppressEditorClose = false; }, 100);
    }
    $divider.on('mousedown touchstart', onStart);
}

// ─── 拖拽（含触摸支持）────────────────────────────────────────────────────

function makeDraggable($el, storageKey, onClick) {
    var sx=0, sy=0, ol=0, ot=0, moved=false, active=false;

    function onStart(e) {
        if ($(e.target).closest('.cs-ctrl-btn,.cs-btn,.cs-panel-controls,.cs-editor-head-actions').length) return;
        active=true; moved=false;
        var pt = getPoint(e);
        var r  = $el[0].getBoundingClientRect();
        sx=pt.clientX; sy=pt.clientY; ol=r.left; ot=r.top;
        e.preventDefault();
    }
    function onMove(e) {
        if (!active) return;
        var pt = getPoint(e);
        var dx=pt.clientX-sx, dy=pt.clientY-sy;
        if (Math.abs(dx)>4||Math.abs(dy)>4) moved=true;
        $el.css({
            left: Math.max(0, Math.min(window.innerWidth -$el.outerWidth(),  ol+dx)),
            top:  Math.max(0, Math.min(window.innerHeight-$el.outerHeight(), ot+dy)),
            right:'auto', bottom:'auto'
        });
    }
    function onEnd() {
        if (!active) return; active=false;
        var r = $el[0].getBoundingClientRect();
        if (storageKey) localStorage.setItem(storageKey, JSON.stringify({left:r.left,top:r.top}));
        if (!moved && onClick) onClick();
    }

    $el.on('mousedown touchstart', onStart);
    $(document).on('mousemove.' + MODULE_NAME + storageKey + ' touchmove.' + MODULE_NAME + storageKey, onMove);
    $(document).on('mouseup.'   + MODULE_NAME + storageKey + ' touchend.'  + MODULE_NAME + storageKey, onEnd);
}

function restorePosition($el, storageKey, def) {
    var s = localStorage.getItem(storageKey);
    if (s) { try { var p=JSON.parse(s); $el.css({left:p.left,top:p.top,right:'auto',bottom:'auto'}); return; } catch(e){} }
    if (def) $el.css(def);
}

// ─── 主题 Popover ─────────────────────────────────────────────────────────

function injectThemePopover() {
    if ($('#cs-theme-popover').length) return;
    $themePopover = $('<div id="cs-theme-popover"></div>');
    THEMES.forEach(function(t) {
        var $dot = $('<div class="cs-theme-dot" title="' + t.label + '" data-theme="' + t.id + '"'
            + ' style="background:' + t.dot + '"></div>');
        $dot.on('click', function() {
            applyTheme(t.id);
            $themePopover.removeClass('cs-visible');
        });
        $themePopover.append($dot);
    });
    $panel.append($themePopover);

    // 标记当前主题
    $themePopover.find('[data-theme="' + currentTheme + '"]').addClass('cs-theme-active');

    // 点 panel 之外关闭 popover
    $(document).on('click.csthemepop', function(e) {
        if (!$(e.target).closest('#cs-theme-popover,#cs-theme-btn').length)
            $themePopover.removeClass('cs-visible');
    });
}

// ─── UI 构建 ──────────────────────────────────────────────────────────────

function injectFloatingButton() {
    if ($('#cs-float-btn').length) return;
    $btn = $('<button id="cs-float-btn" title="角色状态栏"><i class="fa-solid fa-user"></i></button>');
    $('body').append($btn);
    restorePosition($btn, LS_BTN_POS, {right:'24px',bottom:'120px'});
    makeDraggable($btn, LS_BTN_POS, function(){ togglePanel(); });
}

function injectStatusPanel() {
    if ($('#cs-status-panel').length) return;
    $panel = $('<div id="cs-status-panel"></div>');
    $panel.html(
        '<div class="cs-panel-header">'
        +   '<span class="cs-panel-title">'
        +     '<i class="fa-solid fa-chart-simple fa-sm"></i> 角色状态'
        +   '</span>'
        +   '<div class="cs-panel-controls">'
        +     '<button class="cs-ctrl-btn" id="cs-theme-btn" title="切换主题">'
        +       '<i class="fa-solid fa-palette fa-xs"></i>'
        +     '</button>'
        +     '<button class="cs-ctrl-btn" id="cs-btn-edit" title="编辑模板">'
        +       '<i class="fa-solid fa-pen fa-xs"></i>'
        +     '</button>'
        +     '<button class="cs-ctrl-btn" id="cs-btn-close" title="关闭">'
        +       '<i class="fa-solid fa-xmark fa-xs"></i>'
        +     '</button>'
        +   '</div>'
        + '</div>'
        + '<div class="cs-panel-content" id="cs-panel-content">'
        +   '<div class="cs-empty-hint">'
        +     '<i class="fa-regular fa-comment-dots"></i>'
        +     '<div>在角色卡里用 <code>{{setvar::变量名::值}}</code><br>写入变量后自动显示</div>'
        +   '</div>'
        + '</div>'
        + '<div class="cs-resize-handle"></div>'
    );
    $('body').append($panel);
    restorePosition($panel, LS_PANEL_POS, {right:'86px',bottom:'120px'});
    restorePanelSize();

    // 面板 header 拖拽（阻止 controls 区域触发）
    $panel.find('.cs-panel-header').on('mousedown touchstart', function(e) {
        if ($(e.target).closest('.cs-panel-controls').length) return;
        var pd=true, r=$panel[0].getBoundingClientRect();
        var pt=getPoint(e), pol=r.left, pot=r.top, psx=pt.clientX, psy=pt.clientY;
        $panel.addClass('cs-dragging');
        $(document).on('mousemove.cspaneldrag touchmove.cspaneldrag', function(ev){
            var p=getPoint(ev);
            $panel.css({
                left: Math.max(0,Math.min(window.innerWidth -$panel.outerWidth(), pol+p.clientX-psx)),
                top:  Math.max(0,Math.min(window.innerHeight-$panel.outerHeight(),pot+p.clientY-psy)),
                right:'auto', bottom:'auto'
            });
        });
        $(document).on('mouseup.cspaneldrag touchend.cspaneldrag', function(){
            $panel.removeClass('cs-dragging');
            var r2=$panel[0].getBoundingClientRect();
            localStorage.setItem(LS_PANEL_POS, JSON.stringify({left:r2.left,top:r2.top}));
            $(document).off('.cspaneldrag');
        });
        e.preventDefault();
    });

    $panel.find('#cs-btn-close').on('click', hidePanel);
    $panel.find('#cs-btn-edit').on('click', openEditor);
    $panel.find('#cs-theme-btn').on('click', function(e) {
        e.stopPropagation();
        injectThemePopover();
        $themePopover.toggleClass('cs-visible');
    });
    initPanelResize();
}

function buildEditorVarList() {
    if (!$editorModal) return;
    var entries = buildVariableEntries();
    var $list   = $editorModal.find('#cs-var-list');
    $list.empty();
    if (!entries.length) {
        $list.append('<div class="cs-var-empty">尚无本地变量。在角色卡里用 <code>{{setvar::变量名::值}}</code> 写入后自动显示。</div>');
        return;
    }
    entries.forEach(function(entry) {
        var ph   = '{{' + entry.key + '}}';
        var $item = $(
            '<div class="cs-var-item">'
            + '<div class="cs-var-row"><code class="cs-var-key">' + ph + '</code>'
            + '<span class="cs-var-scope">本地</span></div>'
            + '<div class="cs-var-val">' + String(entry.value).slice(0,50) + '</div>'
            + '</div>'
        );
        $item.on('click', (function(p){ return function(){
            if (navigator.clipboard) navigator.clipboard.writeText(p).catch(function(){});
            $(this).addClass('cs-var-copied');
            var self=this; setTimeout(function(){ $(self).removeClass('cs-var-copied'); }, 600);
        }; })(ph));
        $list.append($item);
    });
}

function injectEditor() {
    if ($('#cs-editor-modal').length) return;
    $editorModal = $('<div id="cs-editor-modal"></div>');
    $editorModal.html(
        '<div class="cs-editor-wrap">'

        /* 头部 */
        +   '<div class="cs-editor-head">'
        +     '<span class="cs-editor-title">'
        +       '<i class="fa-solid fa-palette" style="color:var(--cs-pink)"></i> 模板设计器'
        +     '</span>'
        +     '<div class="cs-editor-head-actions">'
        +       '<button class="cs-ctrl-btn" id="cs-btn-import" title="导入模板">'
        +         '<i class="fa-solid fa-file-import fa-xs"></i>'
        +       '</button>'
        +       '<button class="cs-ctrl-btn" id="cs-btn-export" title="导出模板">'
        +         '<i class="fa-solid fa-file-export fa-xs"></i>'
        +       '</button>'
        +       '<button class="cs-ctrl-btn" id="cs-editor-close" title="关闭" style="width:30px;height:30px;font-size:13px">'
        +         '<i class="fa-solid fa-xmark"></i>'
        +       '</button>'
        +     '</div>'
        +   '</div>'

        /* 主体 */
        +   '<div class="cs-editor-body">'

        /* 左侧：编辑区 */
        +     '<div class="cs-editor-pane-left">'
        +       '<div class="cs-section-label"><i class="fa-solid fa-code fa-xs"></i> HTML Template</div>'
        +       '<div class="cs-cm-wrapper">'
        +         '<textarea id="cs-template-textarea" placeholder="输入 HTML 模板，用 {{变量名}} 引用 Luker 本地变量..."></textarea>'
        +       '</div>'
        +       '<div class="cs-editor-actions">'
        +         '<button class="cs-btn cs-btn-secondary" id="cs-btn-reset">'
        +           '<i class="fa-solid fa-rotate-left fa-xs"></i> 重置'
        +         '</button>'
        +         '<button class="cs-btn cs-btn-primary" id="cs-btn-save">'
        +           '<i class="fa-solid fa-floppy-disk fa-xs"></i> 保存'
        +         '</button>'
        +       '</div>'
        +     '</div>' /* cs-editor-pane-left */

        /* 分隔线 */
        +     '<div class="cs-pane-divider"></div>'

        /* 右侧：预览 + 变量 */
        +     '<div class="cs-editor-pane-right">'
        +       '<div class="cs-section-label"><i class="fa-solid fa-eye fa-xs"></i> 实时预览</div>'
        +       '<div class="cs-preview-pane" id="cs-preview-pane"></div>'
        +       '<div class="cs-section-label" style="margin-top:4px">'
        +         '<i class="fa-solid fa-database fa-xs"></i> 当前变量'
        +         '<span class="cs-var-hint">（点击复制）</span>'
        +       '</div>'
        +       '<div class="cs-var-list" id="cs-var-list"></div>'
        +     '</div>'

        +   '</div>' /* editor-body */
        +   '<div class="cs-editor-resize-handle"></div>'
        + '</div>'  /* editor-wrap */
    );
    $('body').append($editorModal);

    $editorModal.find('#cs-editor-close').on('click', closeEditor);
    $editorModal.find('#cs-btn-reset').on('click', function(){
        if (!confirm('确定恢复默认模板？')) return;
        if (_cmEditor) _cmEditor.setValue(DEFAULT_TEMPLATE);
        else $editorModal.find('#cs-template-textarea').val(DEFAULT_TEMPLATE);
        updatePreview();
    });
    $editorModal.find('#cs-btn-save').on('click', doSaveTemplate);
    $editorModal.find('#cs-btn-import').on('click', importTemplate);
    $editorModal.find('#cs-btn-export').on('click', exportTemplate);
    $editorModal.on('click', function(e){
        // resize 或拖拽分隔线结束后会触发一次 click，跳过
        if (_suppressEditorClose) return;
        if ($(e.target).is('#cs-editor-modal')) closeEditor();
    });
    // input 监听由 initCodeEditor 内的 _cmEditor.on('change') 接管

    restoreEditorSize();
    initEditorResize();
    initPaneDivider();
}

// ─── 面板 / 编辑器控制 ────────────────────────────────────────────────────

function showPanel() {
    if (!$panel) return;
    isPanelVisible = true;
    $panel.addClass('cs-visible');
    $btn.addClass('cs-active');
    renderStatus();
}

function hidePanel() {
    if (!$panel) return;
    isPanelVisible = false;
    $panel.removeClass('cs-visible');
    $btn.removeClass('cs-active');
    if ($themePopover) $themePopover.removeClass('cs-visible');
}

function togglePanel() { isPanelVisible ? hidePanel() : showPanel(); }

function updatePreview() {
    if (!$editorModal) return;
    var tmpl  = _cmEditor ? _cmEditor.getValue()
                          : $editorModal.find('#cs-template-textarea').val();
    var state = collectState();
    $editorModal.find('#cs-preview-pane').html(
        applyTemplate(tmpl.replace('{{__avatar__}}', getAvatarHtml()), state)
    );
}

async function openEditor() {
    await ensureCodeMirror();
    if (!$editorModal) injectEditor();
    // 初始化 CodeMirror（只在第一次打开时执行）
    if (!_cmEditor) initCodeEditor();
    // 设置编辑器内容
    if (_cmEditor) {
        _cmEditor.setValue(currentTemplate);
        // refresh 修复首次打开时的布局问题
        setTimeout(function() { _cmEditor.refresh(); }, 50);
    } else {
        $editorModal.find('#cs-template-textarea').val(currentTemplate);
    }
    buildEditorVarList();
    updatePreview();
    $editorModal.addClass('cs-visible');
}

function closeEditor() {
    if ($editorModal) $editorModal.removeClass('cs-visible');
}

async function doSaveTemplate() {
    if (!$editorModal) return;
    currentTemplate = _cmEditor ? _cmEditor.getValue()
                                : $editorModal.find('#cs-template-textarea').val();
    await saveTemplate();
    renderStatus();
    var $s = $editorModal.find('#cs-btn-save'), orig = $s.html();
    $s.html('<i class="fa-solid fa-check fa-xs"></i> 已保存').addClass('cs-saved');
    setTimeout(function(){ $s.html(orig).removeClass('cs-saved'); }, 1500);
    closeEditor();
}

// ─── 事件处理 ─────────────────────────────────────────────────────────────

function onMessageReceived() {
    if ($btn && isPanelVisible) {
        $btn.addClass('cs-blink');
        setTimeout(function(){ $btn.removeClass('cs-blink'); }, 1000);
    }
}
function onMessageRendered() { if (isPanelVisible) renderStatus(); }
function onMessageSent()     { if (isPanelVisible) renderStatus(); }
async function onChatChanged() {
    currentTemplate = DEFAULT_TEMPLATE;
    await loadTemplate();
    if (isPanelVisible) renderStatus();
}

// ─── 初始化 ───────────────────────────────────────────────────────────────

async function init() {
    var ctx = Luker.getContext();

    injectFloatingButton();
    injectStatusPanel();

    loadTheme();

    ctx.eventSource.on(ctx.eventTypes.MESSAGE_RENDERED, onMessageRendered);
    ctx.eventSource.on(ctx.eventTypes.MESSAGE_RECEIVED, onMessageReceived);
    ctx.eventSource.on(ctx.eventTypes.MESSAGE_SENT,     onMessageSent);
    ctx.eventSource.on(ctx.eventTypes.CHAT_CHANGED,     onChatChanged);
    ctx.eventSource.on(ctx.eventTypes.CHAT_LOADED,      onChatChanged);
    ctx.eventSource.on(ctx.eventTypes.APP_READY, async function() {
        await loadTemplate();
        if (isPanelVisible) renderStatus();
    });

    await loadTemplate();
    console.log('[' + MODULE_NAME + '] loaded. Theme: ' + currentTheme);
}

jQuery(function(){ init(); });
