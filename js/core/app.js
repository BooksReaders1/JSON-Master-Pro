// 核心应用框架 - 插件式自动注册
class AppFramework {
    constructor() {
        this.modules = new Map();
        this.currentModuleId = null;
        this.globalInput = '';
        this.init();
    }

    // 模块注册入口
    register(id, config) {
        if (this.modules.has(id)) return;
        this.modules.set(id, config);
        this.renderTabUI(id, config);
        if (this.modules.size === 1) {
            setTimeout(() => this.switchTab(id), 100);
        }
    }

    // 动态生成 Tab UI
    renderTabUI(id, config) {
        const tabsContainer = document.getElementById('tabsContainer');
        const modulesContainer = document.getElementById('modulesContainer');

        // 创建 Tab 按钮
        const btn = document.createElement('button');
        btn.id = `tab-btn-${id}`;
        btn.className = 'tab-btn flex items-center gap-2 px-5 py-3 text-sm font-medium text-slate-400 hover:text-white transition-colors border-b-2 border-transparent whitespace-nowrap';
        btn.innerHTML = `<i class="fas ${config.icon}"></i><span>${config.name}</span>`;
        btn.onclick = () => this.switchTab(id);
        tabsContainer.appendChild(btn);

        // 创建内容面板
        const panel = document.createElement('div');
        panel.id = `module-panel-${id}`;
        panel.className = 'module-panel hidden flex-1 overflow-hidden';
        if (config.init) config.init(panel);
        modulesContainer.appendChild(panel);
    }

    // 切换 Tab
    switchTab(moduleId) {
        if (!this.modules.has(moduleId)) return;

        // 卸载旧模块
        if (this.currentModuleId) {
            const oldMod = this.modules.get(this.currentModuleId);
            if (oldMod.deactivate) oldMod.deactivate();
            
            const oldBtn = document.getElementById(`tab-btn-${this.currentModuleId}`);
            const oldPanel = document.getElementById(`module-panel-${this.currentModuleId}`);
            oldBtn?.classList.replace('text-white', 'text-slate-400');
            oldBtn?.classList.replace('border-blue-500', 'border-transparent');
            oldPanel?.classList.add('hidden');
        }

        // 激活新模块
        const newMod = this.modules.get(moduleId);
        const newBtn = document.getElementById(`tab-btn-${moduleId}`);
        const newPanel = document.getElementById(`module-panel-${moduleId}`);
        
        newBtn?.classList.replace('text-slate-400', 'text-white');
        newBtn?.classList.replace('border-transparent', 'border-blue-500');
        newPanel?.classList.remove('hidden');

        this.currentModuleId = moduleId;

        // 同步输入并激活
        if (newMod.activate) newMod.activate(this.globalInput);
    }

    // 全局输入处理
    setupGlobalInput() {
        // 由 format 模块提供主输入框
    }

    // 清空所有
    clearAll() {
        this.globalInput = '';
        const activePanel = document.getElementById(`module-panel-${this.currentModuleId}`);
        if (activePanel) {
            const inputEl = activePanel.querySelector('textarea');
            if (inputEl) inputEl.value = '';
        }
        showToast('已清空', 'info');
    }

    // 复制当前输出
    copyCurrentOutput() {
        const activePanel = document.getElementById(`module-panel-${this.currentModuleId}`);
        if (!activePanel) return;
        
        const outputEl = activePanel.querySelector('textarea[readonly], pre, code');
        if (outputEl) {
            const text = outputEl.tagName === 'PRE' ? outputEl.textContent : outputEl.value;
            Utils.copyToClipboard(text);
        }
    }

    init() {
        console.log('JSON Master Pro Core Initialized');
    }
}

window.App = new AppFramework();
