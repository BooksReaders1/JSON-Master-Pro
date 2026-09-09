// 核心应用框架 - 插件式注册架构
class App {
    constructor() {
        this.modules = new Map();
        this.currentModuleId = null;
        this.globalInput = '';
    }

    // 模块主动注册自己
    register(id, config) {
        if (this.modules.has(id)) {
            console.warn(`Module ${id} already registered.`);
            return;
        }
        this.modules.set(id, config);
        this.renderTabUI(id, config);
        
        // 第一个模块默认激活
        if (this.modules.size === 1) {
            setTimeout(() => this.switchTab(id), 100);
        }
    }

    // 动态生成 Tab UI
    renderTabUI(id, config) {
        const tabsContainer = document.getElementById('tabs-container');
        const contentContainer = document.getElementById('modules-container');

        // 创建 Tab 按钮
        const btn = document.createElement('button');
        btn.id = `tab-btn-${id}`;
        btn.className = 'tab-btn flex items-center gap-2 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors border-b-2 border-transparent whitespace-nowrap';
        btn.innerHTML = `<i class="fas ${config.icon}"></i><span>${config.name}</span>`;
        btn.onclick = () => this.switchTab(id);
        tabsContainer.appendChild(btn);

        // 创建内容面板
        const panel = document.createElement('div');
        panel.id = `module-panel-${id}`;
        panel.className = 'module-panel hidden flex-1 overflow-y-auto h-full';
        if (config.init) {
            config.init(panel);
        }
        contentContainer.appendChild(panel);
    }

    switchTab(moduleId) {
        if (!this.modules.has(moduleId)) return;

        // 卸载旧模块
        if (this.currentModuleId) {
            const oldMod = this.modules.get(this.currentModuleId);
            if (oldMod.deactivate) oldMod.deactivate();
            
            const oldBtn = document.getElementById(`tab-btn-${this.currentModuleId}`);
            const oldPanel = document.getElementById(`module-panel-${this.currentModuleId}`);
            if (oldBtn) {
                oldBtn.classList.replace('text-white', 'text-gray-400');
                oldBtn.classList.replace('border-blue-500', 'border-transparent');
            }
            if (oldPanel) oldPanel.classList.add('hidden');
        }

        // 激活新模块
        const newMod = this.modules.get(moduleId);
        const newBtn = document.getElementById(`tab-btn-${moduleId}`);
        const newPanel = document.getElementById(`module-panel-${moduleId}`);
        
        if (newBtn) {
            newBtn.classList.replace('text-gray-400', 'text-white');
            newBtn.classList.replace('border-transparent', 'border-blue-500');
        }
        if (newPanel) newPanel.classList.remove('hidden');

        this.currentModuleId = moduleId;

        // 同步数据并执行
        if (newMod.activate) {
            newMod.activate(this.globalInput);
        }
    }

    setupGlobalInput() {
        const inputEl = document.getElementById('global-json-input');
        if (!inputEl) return;
        
        let timeout;
        inputEl.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.globalInput = e.target.value;
                if (this.currentModuleId) {
                    const mod = this.modules.get(this.currentModuleId);
                    if (mod && mod.activate) mod.activate(this.globalInput);
                }
            }, 300);
        });
    }

    init() {
        this.setupGlobalInput();
        console.log('🚀 JSON Master Pro initialized');
    }
}

window.AppInstance = new App();
document.addEventListener('DOMContentLoaded', () => {
    window.AppInstance.init();
});
