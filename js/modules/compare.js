(function() {
    const CompareModule = {
        name: 'JSON 对比',
        icon: 'fa-columns',
        
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">原始 JSON</label>
                            <button id="cmp-sync-left" class="btn-secondary"><i class="fas fa-arrow-left"></i> 同步到主输入</button>
                        </div>
                        <textarea id="cmp-left" class="editor-box w-full h-full resize-none" placeholder='{"a": 1}'></textarea>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">新 JSON</label>
                            <button id="cmp-sync-right" class="btn-secondary"><i class="fas fa-arrow-left"></i> 同步到主输入</button>
                        </div>
                        <textarea id="cmp-right" class="editor-box w-full h-full resize-none" placeholder='{"a": 2, "b": 3}'></textarea>
                    </div>
                </div>
                <div class="mt-4 flex gap-2">
                    <button id="cmp-run" class="btn-primary"><i class="fas fa-search"></i> 开始对比</button>
                    <span id="cmp-stats" class="text-xs text-gray-400 self-center"></span>
                </div>
                <div id="cmp-result" class="mt-4 editor-box flex-1 overflow-auto diff-container"></div>
            `;

            document.getElementById('cmp-run').onclick = runDiff;
            document.getElementById('cmp-sync-left').onclick = () => {
                const val = document.getElementById('cmp-left').value;
                if (window.AppInstance) window.AppInstance.setGlobalInput(val);
                showToast('已同步到主输入', 'success');
            };
            document.getElementById('cmp-sync-right').onclick = () => {
                const val = document.getElementById('cmp-right').value;
                if (window.AppInstance) window.AppInstance.setGlobalInput(val);
                showToast('已同步到主输入', 'success');
            };
        },

        activate: () => {},
        deactivate: () => {}
    };

    function runDiff() {
        const leftVal = document.getElementById('cmp-left').value;
        const rightVal = document.getElementById('cmp-right').value;
        const resultEl = document.getElementById('cmp-result');
        const statsEl = document.getElementById('cmp-stats');

        const leftObj = safeJsonParse(leftVal);
        const rightObj = safeJsonParse(rightVal);

        if (leftObj.error || rightObj.error) {
            resultEl.innerHTML = '<div class="text-red-400">请确保两边都是有效的 JSON</div>';
            return;
        }

        const leftLines = JSON.stringify(leftObj.data, null, 2).split('\n');
        const rightLines = JSON.stringify(rightObj.data, null, 2).split('\n');

        let added = 0, removed = 0;
        let html = '';

        // Simple line-by-line diff
        const maxLen = Math.max(leftLines.length, rightLines.length);
        for (let i = 0; i < maxLen; i++) {
            const leftLine = leftLines[i] || '';
            const rightLine = rightLines[i] || '';

            if (leftLine === rightLine) {
                html += `<div class="diff-line">${escapeHtml(rightLine)}</div>`;
            } else if (leftLine && !rightLine) {
                html += `<div class="diff-line diff-remove">- ${escapeHtml(leftLine)}</div>`;
                removed++;
            } else if (!leftLine && rightLine) {
                html += `<div class="diff-line diff-add">+ ${escapeHtml(rightLine)}</div>`;
                added++;
            } else {
                html += `<div class="diff-line diff-remove">- ${escapeHtml(leftLine)}</div>`;
                html += `<div class="diff-line diff-add">+ ${escapeHtml(rightLine)}</div>`;
                removed++;
                added++;
            }
        }

        resultEl.innerHTML = html;
        statsEl.textContent = `新增：${added} | 删除：${removed}`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    if (window.AppInstance) {
        window.AppInstance.register('compare', CompareModule);
    }
})();
