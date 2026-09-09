(function() {
    const ConvertModule = {
        name: 'JSON ⇄ String',
        icon: 'fa-exchange-alt',
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">输入</label>
                            <button id="conv-swap" class="btn-secondary"><i class="fas fa-retweet"></i> 切换方向</button>
                        </div>
                        <textarea id="conv-input" class="editor-box w-full h-full resize-none"></textarea>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">输出</label>
                            <button id="conv-copy" class="btn-secondary"><i class="fas fa-copy"></i> 复制</button>
                        </div>
                        <textarea id="conv-output" class="editor-box w-full h-full resize-none" readonly></textarea>
                    </div>
                </div>
                <div class="mt-4 flex gap-2">
                    <button id="conv-run" class="btn-primary"><i class="fas fa-play"></i> 转换</button>
                    <span id="conv-dir" class="text-xs text-gray-400 self-center">JSON → String</span>
                </div>
            `;
            let toStr = true;
            document.getElementById('conv-swap').onclick = () => {
                toStr = !toStr;
                document.getElementById('conv-dir').textContent = toStr ? 'JSON → String' : 'String → JSON';
            };
            document.getElementById('conv-run').onclick = () => {
                const input = document.getElementById('conv-input').value;
                if (!input.trim()) { showToast('请输入内容', 'warning'); return; }
                if (toStr) {
                    const res = safeJsonParse(input);
                    if (res.error) { showToast(res.error, 'error'); return; }
                    document.getElementById('conv-output').value = JSON.stringify(input);
                    showToast('转换成功', 'success');
                } else {
                    try {
                        const parsed = JSON.parse(JSON.parse(input));
                        document.getElementById('conv-output').value = JSON.stringify(parsed, null, 2);
                        showToast('转换成功', 'success');
                    } catch(e) { showToast('格式错误: ' + e.message, 'error'); }
                }
            };
            document.getElementById('conv-copy').onclick = () => {
                const out = document.getElementById('conv-output').value;
                if(out) { navigator.clipboard.writeText(out); showToast('已复制', 'success'); }
            };
        },
        activate: (globalInput) => {
            const el = document.getElementById('conv-input');
            if(el && !el.value && globalInput) el.value = globalInput;
        },
        deactivate: () => {}
    };
    if(window.AppInstance) window.AppInstance.register('convert', ConvertModule);
})();
