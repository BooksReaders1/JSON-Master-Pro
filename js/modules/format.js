(function() {
    const FormatModule = {
        name: '格式化',
        icon: 'fa-code',
        
        init: (container) => {
            container.innerHTML = `
                <div class="split-pane">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">输入 JSON</label>
                            <div class="flex gap-2">
                                <button id="fmt-beautify" class="btn-primary"><i class="fas fa-magic"></i> 格式化</button>
                                <button id="fmt-minify" class="btn-secondary"><i class="fas fa-compress"></i> 压缩</button>
                                <button id="fmt-copy" class="btn-secondary"><i class="fas fa-copy"></i> 复制</button>
                            </div>
                        </div>
                        <textarea id="fmt-input" class="editor-box w-full h-full resize-none"></textarea>
                    </div>
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <label class="text-xs text-gray-400">输出</label>
                            <span id="fmt-status" class="text-xs text-gray-500"></span>
                        </div>
                        <textarea id="fmt-output" class="editor-box w-full h-full resize-none" readonly></textarea>
                    </div>
                </div>
            `;

            const beautifyBtn = container.querySelector('#fmt-beautify');
            const minifyBtn = container.querySelector('#fmt-minify');
            const copyBtn = container.querySelector('#fmt-copy');
            const inputEl = container.querySelector('#fmt-input');
            const outputEl = container.querySelector('#fmt-output');

            beautifyBtn.onclick = () => {
                const input = inputEl.value;
                if (!input.trim()) { showToast('请输入 JSON', 'warning'); return; }
                const result = formatJson(input);
                if (result) {
                    outputEl.value = result;
                    showToast('格式化成功', 'success');
                } else {
                    showToast('JSON 格式错误', 'error');
                }
            };

            minifyBtn.onclick = () => {
                const input = inputEl.value;
                if (!input.trim()) { showToast('请输入 JSON', 'warning'); return; }
                const result = minifyJson(input);
                if (result) {
                    outputEl.value = result;
                    showToast('压缩成功', 'success');
                } else {
                    showToast('JSON 格式错误', 'error');
                }
            };

            copyBtn.onclick = () => {
                const output = outputEl.value;
                if (output) {
                    navigator.clipboard.writeText(output);
                    showToast('已复制到剪贴板', 'success');
                }
            };
        },

        activate: (globalInput) => {
            const inputEl = document.getElementById('fmt-input');
            if (inputEl && !inputEl.value && globalInput) {
                inputEl.value = globalInput;
            }
        },

        deactivate: () => {}
    };

    if (window.AppInstance) {
        window.AppInstance.register('format', FormatModule);
    }
})();
