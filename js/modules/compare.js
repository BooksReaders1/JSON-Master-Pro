// JSON Compare Module - 差异对比
const CompareModule = {
    leftArea: null,
    rightArea: null,
    diffLeftContainer: null,
    diffRightContainer: null,
    diffLeftContent: null,
    diffRightContent: null,
    statsLeft: null,
    statsRight: null,
    diffNavCount: null,
    btnEdit: null,
    cmpHint: null,
    diffMode: false,
    diffs: [],
    currentDiffIndex: -1,

    init() {
        this.leftArea = document.getElementById('compareLeft');
        this.rightArea = document.getElementById('compareRight');
        this.diffLeftContainer = document.getElementById('diffLeftContainer');
        this.diffRightContainer = document.getElementById('diffRightContainer');
        this.diffLeftContent = document.getElementById('diffLeftContent');
        this.diffRightContent = document.getElementById('diffRightContent');
        this.statsLeft = document.getElementById('statsLeft');
        this.statsRight = document.getElementById('statsRight');
        this.diffNavCount = document.getElementById('diffNavCount');
        this.btnEdit = document.getElementById('btnEdit');
        this.cmpHint = document.getElementById('cmpHint');
        console.log('[CompareModule] Initialized');
    },

    onActivate() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput && mainInput.value.trim() && !this.diffMode) {
            this.leftArea.value = mainInput.value;
        }
    },

    onSync(data) {
        if (!this.diffMode) {
            this.leftArea.value = data;
        }
    },

    setDiffMode(isDiff) {
        this.diffMode = isDiff;
        if (isDiff) {
            this.leftArea.classList.add('hidden');
            this.rightArea.classList.add('hidden');
            this.diffLeftContainer.classList.remove('hidden');
            this.diffRightContainer.classList.remove('hidden');
            this.btnEdit.classList.remove('hidden');
            this.cmpHint.textContent = '正在查看对比结果';
        } else {
            this.leftArea.classList.remove('hidden');
            this.rightArea.classList.remove('hidden');
            this.diffLeftContainer.classList.add('hidden');
            this.diffRightContainer.classList.add('hidden');
            this.btnEdit.classList.add('hidden');
            this.cmpHint.textContent = '左侧输入已全局同步 · 在右侧粘贴新 JSON 后点击"开始对比"';
        }
    },

    doRunDiff() {
        const leftStr = this.leftArea.value.trim();
        const rightStr = this.rightArea.value.trim();

        if (!leftStr || !rightStr) {
            showToast('请确保左右两侧都输入了 JSON 内容', 'warning');
            return;
        }

        try {
            const leftObj = JSON.parse(leftStr);
            const rightObj = JSON.parse(rightStr);
            
            this.diffs = [];
            this.currentDiffIndex = -1;
            
            // Simple line-by-line diff for demo
            const leftLines = JSON.stringify(leftObj, null, 2).split('\n');
            const rightLines = JSON.stringify(rightObj, null, 2).split('\n');
            
            const result = this.computeDiff(leftLines, rightLines);
            this.renderDiff(result);
            this.setDiffMode(true);
            
            showToast(`对比完成：发现 ${this.diffs.length} 处差异`, 'success');
        } catch (e) {
            showToast('JSON 解析错误：' + e.message, 'error');
        }
    },

    computeDiff(left, right) {
        const result = { left: [], right: [] };
        const maxLen = Math.max(left.length, right.length);
        
        for (let i = 0; i < maxLen; i++) {
            const l = left[i] || '';
            const r = right[i] || '';
            
            if (l === r) {
                result.left.push({ type: 'same', line: i + 1, content: l });
                result.right.push({ type: 'same', line: i + 1, content: r });
            } else {
                if (l) {
                    result.left.push({ type: 'removed', line: i + 1, content: l });
                    this.diffs.push({ type: 'removed', line: i + 1, side: 'left' });
                }
                if (r) {
                    result.right.push({ type: 'added', line: i + 1, content: r });
                    this.diffs.push({ type: 'added', line: i + 1, side: 'right' });
                }
            }
        }
        
        return result;
    },

    renderDiff(result) {
        let leftHtml = '';
        let rightHtml = '';
        
        result.left.forEach(item => {
            let className = '';
            let indicator = ' ';
            if (item.type === 'added') { className = 'bg-added'; indicator = '+'; }
            else if (item.type === 'removed') { className = 'bg-removed'; indicator = '-'; }
            else if (item.type === 'modified') { className = 'bg-modified'; indicator = '~'; }
            
            leftHtml += `<div class="diff-row ${className}">
                <span class="ln">${item.line}</span>
                <span class="dg text-slate-500">${indicator}</span>
                <span class="dc">${this.escapeHtml(item.content)}</span>
            </div>`;
        });
        
        result.right.forEach(item => {
            let className = '';
            let indicator = ' ';
            if (item.type === 'added') { className = 'bg-added'; indicator = '+'; }
            else if (item.type === 'removed') { className = 'bg-removed'; indicator = '-'; }
            else if (item.type === 'modified') { className = 'bg-modified'; indicator = '~'; }
            
            rightHtml += `<div class="diff-row ${className}">
                <span class="ln">${item.line}</span>
                <span class="dg text-slate-500">${indicator}</span>
                <span class="dc">${this.escapeHtml(item.content)}</span>
            </div>`;
        });
        
        this.diffLeftContent.innerHTML = leftHtml;
        this.diffRightContent.innerHTML = rightHtml;
        
        // Sync scroll
        this.diffLeftContainer.addEventListener('scroll', () => {
            this.diffRightContainer.scrollTop = this.diffLeftContainer.scrollTop;
        });
        
        this.updateStats();
    },

    updateStats() {
        const added = this.diffs.filter(d => d.type === 'added').length;
        const removed = this.diffs.filter(d => d.type === 'removed').length;
        
        this.statsLeft.textContent = `删除：${removed}`;
        this.statsRight.textContent = `新增：${added}`;
        this.diffNavCount.textContent = `${this.diffs.length} 处差异`;
    },

    navigateDiff(direction) {
        if (this.diffs.length === 0) return;
        
        this.currentDiffIndex += direction;
        if (this.currentDiffIndex < 0) this.currentDiffIndex = 0;
        if (this.currentDiffIndex >= this.diffs.length) this.currentDiffIndex = this.diffs.length - 1;
        
        // Scroll to the diff location (simplified)
        const lineNumber = this.diffs[this.currentDiffIndex].line;
        const container = this.diffs[this.currentDiffIndex].side === 'left' 
            ? this.diffLeftContainer 
            : this.diffRightContainer;
        
        const rowHeight = 22;
        container.scrollTop = (lineNumber - 1) * rowHeight - 100;
        
        showToast(`差异 ${this.currentDiffIndex + 1}/${this.diffs.length}`, 'info');
    },

    escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    },

    syncLeft() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput) {
            this.leftArea.value = mainInput.value;
            showToast('已从主输入同步到左侧', 'success');
        }
    },

    syncRight() {
        const mainInput = document.getElementById('inputJson');
        if (mainInput && this.rightArea.value.trim()) {
            mainInput.value = this.rightArea.value;
            // Propagate to all inputs
            App.propagateFrom(mainInput);
            showToast('已将右侧内容回写到主输入并全局同步', 'success');
        }
    }
};

App.registerModule('compare', CompareModule);
window.doRunDiff = () => CompareModule.doRunDiff();
window.setDiffMode = (isDiff) => CompareModule.setDiffMode(isDiff);
window.navigateDiff = (dir) => CompareModule.navigateDiff(dir);
window.syncLeft = () => CompareModule.syncLeft();
window.syncRight = () => CompareModule.syncRight();
