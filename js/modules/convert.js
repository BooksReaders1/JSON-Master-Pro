// JSON ⇄ String Convert Module
const ConvertModule = {
    currentDir: 'j2s',
    inputEl: null,
    outputEl: null,
    dirJ2S: null,
    dirS2J: null,
    optGroupJ2S: null,
    optGroupS2J: null,
    optQuotes: null,
    optDeep: null,
    optPretty: null,
    convInLabel: null,
    convOutLabel: null,

    init() {
        this.inputEl = document.getElementById('convInput');
        this.outputEl = document.getElementById('convOutput');
        this.dirJ2S = document.getElementById('dirJ2S');
        this.dirS2J = document.getElementById('dirS2J');
        this.optGroupJ2S = document.getElementById('optGroupJ2S');
        this.optGroupS2J = document.getElementById('optGroupS2J');
        this.optQuotes = document.getElementById('optQuotes');
        this.optDeep = document.getElementById('optDeep');
        this.optPretty = document.getElementById('optPretty');
        this.convInLabel = document.getElementById('convInLabel');
        this.convOutLabel = document.getElementById('convOutLabel');
        console.log('[ConvertModule] Initialized');
    },

    onActivate() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput && mainInput.value.trim()) {
            this.inputEl.value = mainInput.value;
        }
    },

    onSync(data) {
        this.inputEl.value = data;
        if (document.getElementById('viewConvert').classList.contains('hidden') === false) {
            this.doConvert();
        }
    },

    setConvDir(dir) {
        this.currentDir = dir;
        if (dir === 'j2s') {
            this.dirJ2S.classList.add('dir-active');
            this.dirS2J.classList.remove('dir-active');
            this.optGroupJ2S.classList.remove('hidden');
            this.optGroupS2J.classList.add('hidden');
            this.convInLabel.textContent = '输入：JSON 对象/数组文本 (全局同步)';
            this.convOutLabel.textContent = '输出：转义后的字符串';
        } else {
            this.dirJ2S.classList.remove('dir-active');
            this.dirS2J.classList.add('dir-active');
            this.optGroupJ2S.classList.add('hidden');
            this.optGroupS2J.classList.remove('hidden');
            this.convInLabel.textContent = '输入：转义的字符串';
            this.convOutLabel.textContent = '输出：解析后的 JSON';
        }
    },

    doConvert(showToastMsg = false) {
        const input = this.inputEl.value;
        if (!input || !input.trim()) {
            this.outputEl.value = '';
            return;
        }

        try {
            if (this.currentDir === 'j2s') {
                // JSON → String
                const obj = JSON.parse(input);
                let result = JSON.stringify(obj);
                
                if (!this.optQuotes.checked) {
                    // Remove outer quotes if it's a string
                    if (result.startsWith('"') && result.endsWith('"')) {
                        result = result.slice(1, -1);
                    }
                }
                
                this.outputEl.value = result;
                if (showToastMsg) showToast('转换完成：JSON → String', 'success');
            } else {
                // String → JSON
                let str = input;
                
                // Deep unwrap
                if (this.optDeep.checked) {
                    let prev = str;
                    let changed = true;
                    while (changed) {
                        changed = false;
                        if ((str.startsWith('"') && str.endsWith('"')) || 
                            (str.startsWith("'") && str.endsWith("'"))) {
                            try {
                                const unwrapped = JSON.parse(str);
                                if (typeof unwrapped === 'string') {
                                    str = unwrapped;
                                    changed = true;
                                }
                            } catch (e) {
                                break;
                            }
                        }
                        if (!changed && str.startsWith('"') && str.endsWith('"')) {
                            str = str.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
                            changed = true;
                        }
                    }
                }
                
                const obj = JSON.parse(str);
                this.outputEl.value = this.optPretty.checked 
                    ? JSON.stringify(obj, null, 2) 
                    : JSON.stringify(obj);
                    
                if (showToastMsg) showToast('转换完成：String → JSON', 'success');
            }
        } catch (e) {
            showToast('解析错误：' + e.message, 'error');
            this.outputEl.value = '';
        }
    },

    swapConv() {
        const temp = this.currentDir;
        this.setConvDir(temp === 'j2s' ? 's2j' : 'j2s');
        const inputValue = this.inputEl.value;
        this.inputEl.value = this.outputEl.value;
        this.outputEl.value = inputValue;
        this.doConvert();
        showToast('已交换输入/输出方向', 'info');
    },

    loadConvSample() {
        const sample = {
            message: "Hello, World!",
            count: 42,
            nested: { key: "value" },
            array: [1, 2, 3]
        };
        this.inputEl.value = JSON.stringify(sample, null, 2);
        this.doConvert();
        showToast('已加载示例数据', 'info');
    },

    copyConvOutput() {
        const output = this.outputEl.value;
        if (!output) {
            showToast('没有可复制的内容', 'warning');
            return;
        }
        navigator.clipboard.writeText(output).then(() => {
            showToast('已复制到剪贴板', 'success');
        }).catch(() => {
            showToast('复制失败', 'error');
        });
    },

    getContentForCopy() {
        return this.outputEl?.value || '';
    }
};

App.registerModule('convert', ConvertModule);
window.setConvDir = (dir) => ConvertModule.setConvDir(dir);
window.doConvert = (showToastMsg) => ConvertModule.doConvert(showToastMsg);
window.swapConv = () => ConvertModule.swapConv();
window.loadConvSample = () => ConvertModule.loadConvSample();
window.copyConvOutput = () => ConvertModule.copyConvOutput();
