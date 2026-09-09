/**
 * 应用框架 - 管理 Tab 切换和模块注册
 */

const App = {
    modules: {},
    currentTab: 'format',
    elements: {},
    
    /**
     * 注册功能模块
     */
    registerModule(id, module) {
        this.modules[id] = module;
        if (module.init && typeof module.init === 'function') {
            module.init(this.elements);
        }
        console.log(`[App] Module registered: ${id}`);
    },
    
    /**
     * 初始化 DOM 元素引用
     */
    initElements() {
        this.elements = {
            // Input elements (global sync)
            inputJson: document.getElementById('inputJson'),
            treeInput: document.getElementById('treeInput'),
            compareLeft: document.getElementById('compareLeft'),
            convInput: document.getElementById('convInput'),
            javaInput: document.getElementById('javaInput'),
            beanInput: document.getElementById('beanInput'),
            mockInput: document.getElementById('mockInput'),
            queryInput: document.getElementById('queryInput'),
            analyzeInput: document.getElementById('analyzeInput'),
            
            // Output containers
            fmtOutput: document.getElementById('fmtOutput'),
            fmtError: document.getElementById('fmtError'),
            fmtErrorText: document.getElementById('fmtErrorText'),
            treeOutput: document.getElementById('treeOutput'),
            errorMsg: document.getElementById('errorMsg'),
            errorText: document.getElementById('errorText'),
            
            // Loading overlay
            loadingOverlay: document.getElementById('loadingOverlay'),
            loadingText: document.getElementById('loadingText'),
            
            // Toast container will be created by Toast module
        };
        
        // All synced inputs
        this.syncedInputs = [
            this.elements.inputJson,
            this.elements.treeInput,
            this.elements.compareLeft,
            this.elements.convInput,
            this.elements.javaInput,
            this.elements.beanInput,
            this.elements.mockInput,
            this.elements.queryInput,
            this.elements.analyzeInput
        ];
    },
    
    /**
     * 切换 Tab
     */
    switchTab(tabId) {
        // Hide all views
        document.querySelectorAll('[id^="view"]').forEach(el => {
            el.classList.add('hidden');
        });
        
        // Deactivate all tabs
        document.querySelectorAll('[id^="tab"]').forEach(el => {
            el.classList.remove('tab-active');
        });
        
        // Show selected view
        const viewEl = document.getElementById(`view${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        const tabEl = document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`);
        
        if (viewEl) viewEl.classList.remove('hidden');
        if (tabEl) tabEl.classList.add('tab-active');
        
        this.currentTab = tabId;
        
        // Call module's onActivate if exists
        const module = this.modules[tabId];
        if (module && module.onActivate) {
            module.onActivate();
        }
        
        console.log(`[App] Switched to tab: ${tabId}`);
    },
    
    /**
     * 同步所有输入框
     */
    propagateFrom(sourceElement) {
        const value = sourceElement.value;
        this.syncedInputs.forEach(input => {
            if (input && input !== sourceElement) {
                input.value = value;
            }
        });
        
        // Notify modules about sync
        Object.values(this.modules).forEach(module => {
            if (module.onSync && typeof module.onSync === 'function') {
                module.onSync(value, sourceElement);
            }
        });
    },
    
    /**
     * 显示加载状态
     */
    showLoading(message = '处理中...') {
        if (this.elements.loadingText) {
            this.elements.loadingText.textContent = message;
        }
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'flex';
        }
    },
    
    /**
     * 隐藏加载状态
     */
    hideLoading() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = 'none';
        }
    },
    
    /**
     * 带加载状态执行
     */
    withLoading(message, fn) {
        this.showLoading(message);
        setTimeout(() => {
            try {
                fn();
            } finally {
                this.hideLoading();
            }
        }, 50);
    },
    
    /**
     * 清空所有输入
     */
    clearAll() {
        this.syncedInputs.forEach(input => {
            if (input) input.value = '';
        });
        
        // Clear outputs
        if (this.elements.fmtOutput) this.elements.fmtOutput.innerHTML = '';
        if (this.elements.treeOutput) this.elements.treeOutput.innerHTML = '';
        
        // Notify modules
        Object.values(this.modules).forEach(module => {
            if (module.onClear && typeof module.onClear === 'function') {
                module.onClear();
            }
        });
        
        showToast('已清空所有内容', 'info');
    },
    
    /**
     * 复制结果到剪贴板
     */
    copyResult() {
        let textToCopy = '';
        
        // Try to get content from current active module
        const module = this.modules[this.currentTab];
        if (module && module.getContentForCopy) {
            textToCopy = module.getContentForCopy();
        }
        
        if (!textToCopy) {
            showToast('没有可复制的内容', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('已复制到剪贴板', 'success');
        }).catch(err => {
            showToast('复制失败：' + err.message, 'error');
        });
    },
    
    /**
     * 启动应用
     */
    bootstrap() {
        this.initElements();
        
        // Setup global functions
        window.switchTab = (tabId) => this.switchTab(tabId);
        window.clearAll = () => this.clearAll();
        window.copyResult = () => this.copyResult();
        window.propagateFrom = (source) => this.propagateFrom(source);
        window.withLoading = (msg, fn) => this.withLoading(msg, fn);
        
        // Initialize default tab
        this.switchTab('format');
        
        console.log('[App] Bootstrap complete');
    }
};
