class App {
    constructor() {
        this.modules = new Map();
        this.currentModuleId = null;
        this.globalInput = '';
        this.init();
    }

    register(id, config) {
        if (this.modules.has(id)) return;
        this.modules.set(id, config);
        this.renderTabUI(id, config);
        if (this.modules.size === 1) {
            setTimeout(() => this.switchTab(id), 0);
        }
    }

    renderTabUI(id, config) {
        const tabsContainer = document.getElementById('tabs-wrapper');
        const mainContainer = document.getElementById('main-container');

        if (!tabsContainer || !mainContainer) {
            console.error('Core containers not found.');
            return;
        }

        const btn = document.createElement('button');
        btn.id = `tab-btn-${id}`;
        btn.className = 'tab-btn flex items-center gap-2';
        btn.innerHTML = `<i class="fas ${config.icon}"></i><span>${config.name}</span>`;
        btn.onclick = () => this.switchTab(id);
        tabsContainer.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = `module-panel-${id}`;
        panel.className = 'module-panel hidden h-full w-full';
        
        // 关键修复：先 append 到 DOM，再执行 init，确保 querySelector 能找到元素
        mainContainer.appendChild(panel);
        
        if (config.init) {
            config.init(panel);
        }
    }

    switchTab(moduleId) {
        if (!this.modules.has(moduleId)) return;

        if (this.currentModuleId) {
            const oldMod = this.modules.get(this.currentModuleId);
            if (oldMod.deactivate) oldMod.deactivate();
            const oldBtn = document.getElementById(`tab-btn-${this.currentModuleId}`);
            const oldPanel = document.getElementById(`module-panel-${this.currentModuleId}`);
            if (oldBtn) {
                oldBtn.classList.remove('active');
                oldBtn.classList.add('text-gray-400');
            }
            if (oldPanel) oldPanel.classList.add('hidden');
        }

        const newMod = this.modules.get(moduleId);
        const newBtn = document.getElementById(`tab-btn-${moduleId}`);
        const newPanel = document.getElementById(`module-panel-${moduleId}`);

        if (newBtn) {
            newBtn.classList.add('active');
            newBtn.classList.remove('text-gray-400');
        }
        if (newPanel) newPanel.classList.remove('hidden');

        this.currentModuleId = moduleId;

        if (newMod.activate) {
            newMod.activate(this.globalInput);
        }
    }

    setGlobalInput(value) {
        this.globalInput = value;
        if (this.currentModuleId) {
            const mod = this.modules.get(this.currentModuleId);
            if (mod && mod.activate) mod.activate(this.globalInput);
        }
    }

    init() {
        console.log('JSON Master Pro Core Initialized');
    }
}

window.AppInstance = new App();
