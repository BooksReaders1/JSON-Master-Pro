// 对比模块
(function() {
    const CompareModule = {
        name: '对比',
        icon: 'fa-columns',
        
        init: function(container) {
            container.innerHTML = `
                <div class="flex flex-col h-full gap-4">
                    <div class="flex justify-between items-center">
                        <h3 class="text-lg font-bold text-white">JSON 差异对比</h3>
                        <div class="flex gap-2">
                            <button id="cmp-diff" class="btn-primary"><i class="fas fa-search"></i> 开始对比</button>
                            <button id="cmp-prev" class="btn-secondary"><i class="fas fa-arrow-up"></i> 上一处</button>
                            <button id="cmp-next" class="btn-secondary"><i class="fas fa-arrow-down"></i> 下一处</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 flex-1 min-h-0">
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">原始 JSON</label>
                            <textarea id="cmp-left" class="editor-box flex-1" placeholder="粘贴第一个 JSON"></textarea>
                        </div>
                        <div class="flex flex-col">
                            <label class="text-xs text-gray-400 mb-2">对比 JSON</label>
                            <textarea id="cmp-right" class="editor-box flex-1" placeholder="粘贴第二个 JSON"></textarea>
                        </div>
                    </div>
                    <div id="cmp-result" class="bg-gray-800 rounded-lg p-4 h-48 overflow-auto font-mono text-sm"></div>
                </div>
            `;

            document.getElementById('cmp-diff').onclick = () => this.runDiff();
            document.getElementById('cmp-prev').onclick = () => this.navigate(-1);
            document.getElementById('cmp-next').onclick = () => this.navigate(1);
            
            this.diffIndex = -1;
            this.diffs = [];
        },

        activate: function(input) {
            if (input && !document.getElementById('cmp-left').value) {
                document.getElementById('cmp-left').value = input;
            }
        },

        runDiff: function() {
            const leftStr = document.getElementById('cmp-left').value;
            const rightStr = document.getElementById('cmp-right').value;
            const resultDiv = document.getElementById('cmp-result');

            const left = JSONUtils.parse(leftStr);
            const right = JSONUtils.parse(rightStr);

            if (left === null || right === null) {
                showToast('请输入有效的 JSON', 'error');
                return;
            }

            this.diffs = [];
            this.compareObjects(left, right, '$');
            
            if (this.diffs.length === 0) {
                resultDiv.innerHTML = '<div class="text-green-400">✅ 两个 JSON 完全相同</div>';
                showToast('没有发现差异', 'success');
                return;
            }

            this.renderDiffs(resultDiv);
            this.diffIndex = 0;
            showToast(`发现 ${this.diffs.length} 处差异`, 'warning');
        },

        compareObjects: function(left, right, path) {
            if (typeof left !== typeof right) {
                this.diffs.push({ path, type: 'type_change', left: left, right: right });
                return;
            }

            if (left === null && right === null) return;
            if (typeof left !== 'object') {
                if (left !== right) {
                    this.diffs.push({ path, type: 'value_change', left: left, right: right });
                }
                return;
            }

            const leftKeys = Object.keys(left || {});
            const rightKeys = Object.keys(right || {});

            for (const key of leftKeys) {
                const newPath = `${path}.${key}`;
                if (!right || !(key in right)) {
                    this.diffs.push({ path: newPath, type: 'removed', left: left[key] });
                } else {
                    this.compareObjects(left[key], right[key], newPath);
                }
            }

            for (const key of rightKeys) {
                const newPath = `${path}.${key}`;
                if (!left || !(key in left)) {
                    this.diffs.push({ path: newPath, type: 'added', right: right[key] });
                }
            }
        },

        renderDiffs: function(container) {
            let html = `<div class="text-gray-400 mb-2">发现 ${this.diffs.length} 处差异:</div>`;
            this.diffs.forEach((d, i) => {
                const colors = {
                    added: 'text-green-400',
                    removed: 'text-red-400',
                    value_change: 'text-yellow-400',
                    type_change: 'text-purple-400'
                };
                const icons = {
                    added: '+',
                    removed: '-',
                    value_change: '~',
                    type_change: '!'
                };
                html += `<div class="${colors[d.type]} hover:bg-gray-700 p-1 cursor-pointer diff-item" data-index="${i}">
                    ${icons[d.type]} ${d.path}: ${d.type}
                </div>`;
            });
            container.innerHTML = html;

            container.querySelectorAll('.diff-item').forEach(el => {
                el.onclick = () => {
                    this.diffIndex = parseInt(el.dataset.index);
                    this.highlightDiff();
                };
            });
        },

        navigate: function(dir) {
            if (this.diffs.length === 0) return;
            this.diffIndex += dir;
            if (this.diffIndex < 0) this.diffIndex = this.diffs.length - 1;
            if (this.diffIndex >= this.diffs.length) this.diffIndex = 0;
            this.highlightDiff();
        },

        highlightDiff: function() {
            const items = document.querySelectorAll('.diff-item');
            items.forEach((el, i) => {
                el.classList.toggle('bg-blue-600', i === this.diffIndex);
            });
            if (items[this.diffIndex]) {
                items[this.diffIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    if (window.AppInstance) {
        window.AppInstance.register('compare', CompareModule);
    }
})();
